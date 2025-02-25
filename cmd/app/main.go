package main

import (
	"context"
	"errors"
	"fs-sort/internal/config"
	"fs-sort/internal/transport"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	start := time.Now()
	defer func() {
		log.Println("Время работы сервера:", time.Since(start))
	}()

	// Чтение .env
	config.Load()

	// Загрузка конфигурации
	port := config.GetPort()

	// Создание и настройка сервера
	server := config.NewServer(port)

	// Обработчики для API
	http.HandleFunc("/api/fs", transport.ApiHandler)

	http.HandleFunc("/", transport.RootPathHandler)

	fileServer := http.FileServer(http.Dir("../../static"))
	http.Handle("/static/", http.StripPrefix("/static", fileServer))

	go func() {
		log.Println("Starting server on port", port)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal("Error starting server...", err)
		}
	}()

	// Ожидание сигнала для завершения работы
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	sig := <-sigChan

	log.Println("Получен сигнал, начинаем завершение работы", sig)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Ошибка при завершении работы сервера %v", err)
	}
}
