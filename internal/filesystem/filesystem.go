package models

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
