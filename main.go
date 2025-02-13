package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	"github.com/joho/godotenv"
)

type myFile struct{
	Category 	string 	`json:"category"`
	Name 		string	`json:"name"`	
	Weight 		int64	`json:"weight"`
	Weight_name string 	`json:"weight_name"`
}

type ByWeight []myFile

func (a ByWeight) Len() int           { return len(a) }
func (a ByWeight) Less(i, j int) bool { return a[i].Weight < a[j].Weight }
func (a ByWeight) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

func handler(w http.ResponseWriter, r *http.Request)  {
	if r.Method == "GET"{
		query := r.URL.Query()

		w.Header().Set("Content-Type", "application/json")

		path := query.Get("root")
		type_sort := query.Get("sort")

		expandedPath, err := checkPath(path)

		if err != nil{
			http.Error(w, "Ошибка проверки пути", http.StatusBadRequest)
			return
		}

		files, err := os.ReadDir(expandedPath)
		if err != nil{
			http.Error(w, "Ошибка при чтении директории", http.StatusBadRequest)
			return
		}
	
		wg := sync.WaitGroup{}

		count := 0

		array := make([]myFile, len(files))

		for idx, file := range files{

			finfo, err := file.Info()

			if err != nil{
				fmt.Println("Ошибка информации о файле")
				idx--
				continue
			}
			wg.Add(1)
			go func(fileinfo fs.FileInfo, c int) {
				defer wg.Done()
				if fileinfo.IsDir(){
					size := getSize(expandedPath + "/" + fileinfo.Name()) + fileinfo.Size()

					array[c] = myFile{"d", fileinfo.Name(), size, "Bytes"}
				}else{
					array[c] = myFile{"f", fileinfo.Name(), fileinfo.Size(), "Bytes"}
				}
			}(finfo, count)

			count += 1
		}

		wg.Wait()

		if type_sort == "desc"{
			sort.Slice(array, func(i, j int) bool {
				return array[i].Weight > array[j].Weight
			})
			if err := json.NewEncoder(w).Encode(array); err != nil{
				http.Error(w, "Ошибка кодировки json", http.StatusInternalServerError)
			}
		}else if type_sort == "asc"{
			sort.Sort(ByWeight(array))
			if err := json.NewEncoder(w).Encode(array); err != nil{
				http.Error(w, "Ошибка кодировки json", http.StatusInternalServerError)
			}
		}else{
			http.Error(w, "Ошибка выбора сортировки", http.StatusBadRequest)
		}
	}
}

func main() {
	err := godotenv.Load()

	if err != nil{
		log.Fatal("Ошибка чтения .env файла")
	}

	port := os.Getenv("PORT")

	http.HandleFunc("/fs", handler)

	err = http.ListenAndServe(port, nil)

	if err != nil{
		log.Fatal("Ошибка запуска веб-сервера")
	}
}

func getSize(path string) int64 {

	var size int64
	files, err := os.ReadDir(path)

	if err != nil{
		fmt.Println("Ошибка при чтении директории getsize", err)
		return 0
	}

	for _, file := range files{

		file, err := file.Info()

		if err != nil{
			fmt.Println("Ошибка информации о файле")
			continue
		}

		if file.IsDir(){
			size += file.Size()
			size += getSize(path + "/" + file.Name())
		}else{
			size += file.Size()
		}

	}
	return size
}

func checkPath(path string) (string, error) {

	var err error

	if strings.HasPrefix(path, "~/"){

		home_path, err := os.UserHomeDir()

		if err != nil{
			fmt.Println("Ошибка путя с префиксом", err)
			return "", err
		}
		path = strings.Replace(path, "~/", home_path + "/", 1)

		fmt.Println(path)
	}else{
		path, err = filepath.Abs(os.ExpandEnv(path))
		if err != nil{
			fmt.Println("Ошибка относительно директории")
			return "", err
		}

	}
	return path, nil
}


func convertBytes(bytes int64) (int64, string) {
	const (
		KB = 1000
		MB = KB * 1000
		GB = MB * 1000
	)

	if bytes >= GB {
		return bytes / GB, "GB"
	} else if bytes >= MB {
		return bytes / MB, "MB"
	} else if bytes >= KB {
		return bytes / KB, "KB"
	}
	return bytes, "Bytes"
}