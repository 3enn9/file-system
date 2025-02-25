package transport

import (
	"bytes"
	"encoding/json"
	"fmt"
	"fs-sort/internal/config"
	"fs-sort/internal/filesystem"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// ApiHandler считываем запрос, возвращаем данные в формате json
func ApiHandler(w http.ResponseWriter, r *http.Request) {
	const dirSize = 4096
	start := time.Now()

	log.Println(r.Method, r.URL)
	if r.Method == "GET" {
		query := r.URL.Query()

		w.Header().Set("Content-Type", "application/json")

		path := query.Get("root")
		typeSort := query.Get("sort")

		if len(query) == 0 {
			path = "./"
			typeSort = "desc"
		}
		if typeSort == "" {
			typeSort = "desc"
		}

		expandedPath, err := filesystem.CheckPath(path)

		if err != nil {
			http.Error(w, "Ошибка проверки пути", http.StatusBadRequest)
			return
		}

		files, err := os.ReadDir(expandedPath)
		if err != nil {
			http.Error(w, "Ошибка при чтении директории", http.StatusBadRequest)
			return
		}

		wg := sync.WaitGroup{}

		array := make([]filesystem.MyFile, len(files))

		for idx, file := range files {

			finfo, err := file.Info()

			if err != nil {
				fmt.Println("Ошибка информации о файле", err)
				continue
			}
			wg.Add(1)
			go func(fileInfo fs.FileInfo, c int) {
				defer wg.Done()
				if fileInfo.IsDir() {
					size := filesystem.GetSize(expandedPath+"/"+fileInfo.Name()) + fileInfo.Size() - dirSize

					array[c] = filesystem.MyFile{Category: "d", Name: fileInfo.Name(), Weight: float64(size), WeightName: "Bytes"}
				} else {
					array[c] = filesystem.MyFile{Category: "f", Name: fileInfo.Name(), Weight: float64(fileInfo.Size()), WeightName: "Bytes"}
				}
			}(finfo, idx)

		}
		wg.Wait()

		sizeCurrentDir := 0.0
		for _, v := range array {
			sizeCurrentDir += v.Weight
		}

		if err := filesystem.SortFiles(typeSort, array); err != nil {
			http.Error(w, "Ошибка выбора сортировки: "+err.Error(), http.StatusBadRequest)
			return
		}

		if err := json.NewEncoder(w).Encode(array); err != nil {
			http.Error(w, "Ошибка кодировки json", http.StatusInternalServerError)
			return
		}

		data := filesystem.Data{
			Root:        expandedPath,
			Size:        sizeCurrentDir,
			ElapsedTime: time.Since(start).Seconds(),
		}

		// Преобразуем структуру в JSON
		jsonData, err := json.Marshal(data)
		if err != nil {
			log.Println("Ошибка при преобразовании данных в JSON:", err)
			return
		}

		// URL для отправки POST-запроса
		url := config.GetPHPPath()

		// Отправка POST-запроса
		resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			log.Println("Ошибка при отправке запроса:", err)
			return
		}
		defer func() {
			if err := resp.Body.Close(); err != nil {
				log.Println("Ошибка при закрытии тела ответа:", err)
			}
		}()

		// Логируем статус код ответа
		log.Println("Ответ от сервера:", resp.Status)

		// Чтение ответа от сервера
		var response map[string]interface{}
		err = json.NewDecoder(resp.Body).Decode(&response)
		if err != nil {
			log.Println("Ошибка при декодировании ответа:", err)
			return
		}

		// Выводим полученный ответ от PHP сервера
		log.Printf("Ответ от PHP: %+v\n", response)
		log.Println(filesystem.ConvertBytes(sizeCurrentDir))
	}
}

func RootPathHandler(w http.ResponseWriter, r *http.Request) {
	absPath, err := filepath.Abs(".")

	if err != nil {
		fmt.Println("Ошибка текущего путя", err)
	}

	if r.URL.RawQuery == "" {
		http.Redirect(w, r, "/index.html?root="+absPath+"&sort=desc", http.StatusFound)
		return
	}
	http.ServeFile(w, r, "../../static/index.html")
}
