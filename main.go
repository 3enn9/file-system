package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"math"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/joho/godotenv"
)

type myFile struct{
	Category 	string 	`json:"category"`
	Name 		string	`json:"name"`	
	Weight 		float64	`json:"weight"`
	Weight_name string 	`json:"weight_name"`
}

type ByWeight []myFile

func (a ByWeight) Len() int           { return len(a) }
func (a ByWeight) Less(i, j int) bool { return a[i].Weight < a[j].Weight }
func (a ByWeight) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

func main() {
	start := time.Now()
	defer func ()  {
		log.Println("Время работы сервера:", time.Since(start))
	}()

	err := godotenv.Load()

	if err != nil{
		log.Fatal("Ошибка чтения .env файла", err)
	}

	port := os.Getenv("PORT")

	server := &http.Server{
		Addr: ":" + port,
		Handler: nil,
	}

	absPath, err := filepath.Abs(".")
	if err != nil{
		fmt.Println("Ошибка текущего путя", err)
	}

	fs := http.FileServer(http.Dir("./static"))

	http.HandleFunc("/api/fs", handler)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.RawQuery == "" {
			http.Redirect(w, r, "/index.html?root="+absPath+"&sort=desc", http.StatusFound)
			return
		}
		http.ServeFile(w, r, "./static/index.html")
	})

	http.Handle("/static/", http.StripPrefix("/static", fs))

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	
	go func() {
		log.Println("Starting server on port", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed{
			log.Fatal("Error starting server...", err)
		}
	}()

	sig :=  <- sigChan

	log.Println("Получен сигнал, начинаем завершение работы", sig)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx);err != nil{
		log.Fatalf("Ошибка при завершении работы сервера %v", err)
	}
}


//	getSize возвращает размер файла, директории
func getSize(path string) int64 {

	var size int64
	files, err := os.ReadDir(path)

	if err != nil{
		fmt.Println("Ошибка при чтении директории", err)
		return 0
	}

	for _, file := range files{

		file, err := file.Info()

		if err != nil{
			fmt.Println("Ошибка информации о файле", err)
			continue
		}
		size += file.Size()
		if file.IsDir(){
			size += getSize(path + "/" + file.Name())
		}
	}
	return size
}

// checkPath валидация пути к root
func checkPath(path string) (string, error) {

	var err error

	if strings.HasPrefix(path, "~"){

		home_path, err := os.UserHomeDir()

		if err != nil{
			fmt.Println("Ошибка путя с префиксом", err)
			return "", err
		}
		path = strings.Replace(path, "~", home_path, 1)

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

// convertBytes конвертируем байты в нужную размерность
func convertBytes(bytes float64) (float64, string) {
	const (
		KB = 1000
		MB = KB * 1000
		GB = MB * 1000
	)

	if bytes >= GB {
		return math.Round(bytes / GB * 10) / 10, "GB"
	} else if bytes >= MB {
		return math.Round(bytes / MB * 10) / 10, "MB"
	} else if bytes >= KB {
		return math.Round(bytes / KB * 10) / 10, "KB"
	}
	return bytes, "Bytes"
}

// handler обрабатываем get запрос
func handler(w http.ResponseWriter, r *http.Request)  {
	const dirSize = 4096

	log.Println(r.Method, r.URL)
	if r.Method == "GET"{
		query := r.URL.Query()

		w.Header().Set("Content-Type", "application/json")

		path := query.Get("root")
		type_sort := query.Get("sort")

		if len(query) == 0{
			path = "./"
			type_sort = "desc"
		}
		if type_sort == ""{
			type_sort = "desc"
		}

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

		array := make([]myFile, len(files))

		for idx, file := range files{

			finfo, err := file.Info()

			if err != nil{
				fmt.Println("Ошибка информации о файле")
				continue
			}
			wg.Add(1)
			go func(fileinfo fs.FileInfo, c int) {
				defer wg.Done()
				if fileinfo.IsDir(){
					size := getSize(expandedPath + "/" + fileinfo.Name()) + fileinfo.Size() - dirSize

					array[c] = myFile{"d", fileinfo.Name(), float64(size), "Bytes"}
				}else{
					array[c] = myFile{"f", fileinfo.Name(), float64(fileinfo.Size()), "Bytes"}
				}
			}(finfo, idx)

		}

		wg.Wait()

		// Сортировка
		if type_sort == "desc"{
			sort.Slice(array, func(i, j int) bool {
				return array[i].Weight > array[j].Weight
			})
			for i := range array {
				array[i].Weight, array[i].Weight_name = convertBytes(array[i].Weight)
			}

			if err := json.NewEncoder(w).Encode(array); err != nil{
				http.Error(w, "Ошибка кодировки json", http.StatusInternalServerError)
			}
		}else if type_sort == "asc"{
			sort.Sort(ByWeight(array))
			for i := range array {
				array[i].Weight, array[i].Weight_name = convertBytes(array[i].Weight)
			}

			if err := json.NewEncoder(w).Encode(array); err != nil{
				http.Error(w, "Ошибка кодировки json", http.StatusInternalServerError)
			}
		}else{
			http.Error(w, "Ошибка выбора сортировки", http.StatusBadRequest)
		}
	}
}

func sortFiles(type_sort string, array []myFile)  {
	
}