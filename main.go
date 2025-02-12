package main

import (
	"flag"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"

	"sort"
	"strings"
	"sync"
	// "time"
)

type myFile struct{
	category string
	name string
	weight int64
	weight_name string 
}

type ByWeight []myFile

func (a ByWeight) Len() int           { return len(a) }
func (a ByWeight) Less(i, j int) bool { return a[i].weight < a[j].weight }
func (a ByWeight) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }

func main() {
	
	path := flag.String("root", "~/", "Введите путь")
	type_sort := flag.String("sort", "desc", "Введите вид сортировки ")

	array := []myFile{}

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
	
	chs := make(chan myFile)
	
	wg := sync.WaitGroup{}

	for _, file := range files{

		finfo, err := file.Info()

		if err != nil{
			fmt.Println("Ошибка информации о файле")
			continue
		}

		wg.Add(1)
		go func(fileinfo fs.FileInfo) {
			defer wg.Done()

			if fileinfo.IsDir(){
				size := getSize(expandedPath + "/" + fileinfo.Name()) + fileinfo.Size()

				chs <- myFile{"d", fileinfo.Name(), size, "Bytes"}
			}else{
				chs <- myFile{"f", fileinfo.Name(), fileinfo.Size(), "Bytes"}
			}
		}(finfo)
	}

	go func() {
		wg.Wait()
		close(chs)
	}()

	for file := range chs{
		array = append(array, file)
	}

	if *type_sort == "desc"{
		sort.Slice(array, func(i, j int) bool {
			return array[i].weight > array[j].weight
		})
		for _, v := range array{
			v.weight, v.weight_name = convertBytes(v.weight)
			fmt.Println(v)
		}

	}else{

	sort.Sort(ByWeight(array))
	for _, v := range array{
		v.weight, v.weight_name = convertBytes(v.weight)
		fmt.Println(v)
	}
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