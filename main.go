package main

import (
	"flag"
	"fmt"
	"io/fs"
	"math"
	"os"
	"path/filepath"

	"sort"
	"strings"
	"sync"
)

type myFile struct{
	category string
	name string
	weight float64
	weight_name string 
}

type ByWeight []myFile

func (a ByWeight) Len() int           { return len(a) }
func (a ByWeight) Less(i, j int) bool { return a[i].weight < a[j].weight }
func (a ByWeight) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

func main() {
	
	path := flag.String("root", "~/", "Введите путь")
	type_sort := flag.String("sort", "desc", "Введите вид сортировки ")

	flag.Parse()

	expandedPath, err := checkPath(*path)

	if err != nil{
		fmt.Println("Ошибка проверки пути", err)
		return
	}

	files, err := os.ReadDir(expandedPath)
	if err != nil{
		fmt.Println("Ошибка при чтении директории main", err)
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
				size := getSize(expandedPath + "/" + fileinfo.Name()) + fileinfo.Size() - 4096

				array[c] = myFile{"d", fileinfo.Name(), float64(size), "Bytes"}
			}else{
				array[c] = myFile{"f", fileinfo.Name(), float64(fileinfo.Size()), "Bytes"}
			}
		}(finfo, idx)

		idx += 1
	}

	wg.Wait()

	if *type_sort == "desc"{
		sort.Slice(array, func(i, j int) bool {
			return array[i].weight > array[j].weight
		})
		for i := range array {
			array[i].weight, array[i].weight_name = convertBytes(array[i].weight)
			fmt.Println(array[i])
		}

	}else{

	sort.Sort(ByWeight(array))
	for i := range array {
		array[i].weight, array[i].weight_name = convertBytes(array[i].weight)
		fmt.Println(array[i])
	}
	}
}



// getSize возвращает вес файла по его пути
func getSize(path string) int64 {

	var size int64
	files, err := os.ReadDir(path)

	if err != nil{
		fmt.Printf("Ошибка при чтении директории %s %v", path, err)
		return 0
	}

	for _, file := range files{

		file, err := file.Info()

		if err != nil{
			fmt.Println("Ошибка информации о файле")
			continue
		}
		size += file.Size()
		if file.IsDir(){
			size += getSize(path + "/" + file.Name())
		}

	}
	return size
}

// checkPath проверяем путь на правильность
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

// convertBytes переводит байты в КБ, МБ, ГБ
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