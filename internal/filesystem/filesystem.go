package filesystem

import (
	"errors"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// MyFile представляет информацию о файле, включая категорию, имя и размер.
type MyFile struct {
	// Category — категория файла
	Category string `json:"category"`

	// Name — имя файла
	Name string `json:"name"`

	// Weight — размер файла
	Weight float64 `json:"weight"`

	// WeightName — категория размерности файла
	WeightName string `json:"weight_name"`
}

// Data представляет данные в базе данных
type Data struct {
	// Root - путь к директории, для которой собираются данные.
	Root string `json:"root"`

	// Size - размер директории в байтах.
	Size float64 `json:"size"`

	// ElapsedTime - время, затраченное на обработку директории (в секундах).
	ElapsedTime float64 `json:"elapsedTime"`
}

// CheckPath валидация пути к root
func CheckPath(path string) (string, error) {

	var err error

	if strings.HasPrefix(path, "~") {

		homePath, err := os.UserHomeDir()

		if err != nil {
			return "", fmt.Errorf("ошибка путя с префиксом %s %w", homePath, err)
		}
		path = strings.Replace(path, "~", homePath, 1)

		fmt.Println(path)
	} else {
		path, err = filepath.Abs(os.ExpandEnv(path))
		if err != nil {
			return "", fmt.Errorf("ошибка относительно директории %s %w", path, err)
		}
	}
	return path, nil
}

// GetSize возвращает размер файла, директории
func GetSize(path string) int64 {

	var size int64
	files, err := os.ReadDir(path)

	if err != nil {
		fmt.Println("Ошибка при чтении директории", err)
		return 0
	}

	for _, file := range files {

		file, err := file.Info()

		if err != nil {
			fmt.Println("Ошибка информации о файле", err)
			continue
		}
		size += file.Size()
		if file.IsDir() {
			size += GetSize(path + "/" + file.Name())
		}
	}
	return size
}

// ConvertBytes конвертируем байты в нужную размерность
func ConvertBytes(bytes float64) (float64, string) {
	const (
		KB = 1000
		MB = KB * 1000
		GB = MB * 1000
	)

	if bytes >= GB {
		return math.Round(bytes/GB*10) / 10, "GB"
	} else if bytes >= MB {
		return math.Round(bytes/MB*10) / 10, "MB"
	} else if bytes >= KB {
		return math.Round(bytes/KB*10) / 10, "KB"
	}
	return bytes, "Bytes"
}

// SortFiles сортировка файлов
func SortFiles(typeSort string, array []MyFile) error {
	switch typeSort {
	case "desc":
		sort.Slice(array, func(i, j int) bool {
			return array[i].Weight > array[j].Weight
		})
	case "asc":
		sort.Slice(array, func(i, j int) bool {
			return array[i].Weight < array[j].Weight
		})
	default:
		return errors.New("неверный тип сортировки")
	}

	for i := range array {
		array[i].Weight, array[i].WeightName = ConvertBytes(array[i].Weight)
	}

	return nil
}
