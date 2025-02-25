package config

import (
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
)

// Load загружаем .env
func Load() {
	err := godotenv.Load("../../.env")
	if err != nil {
		log.Fatal("Ошибка чтения .env файла", err)
	}
}

// GetPort получить порт
func GetPort() string {
	return os.Getenv("PORT")
}

func GetPHPPath() string {
	return os.Getenv("PHP_PATH")
}

// NewServer создаёт новый HTTP сервер.
func NewServer(port string) *http.Server {
	return &http.Server{
		Addr: ":" + port,
	}
}
