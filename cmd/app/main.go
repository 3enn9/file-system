package main

import (
	"context"
	"errors"
	"fs-sort/internal/config"
	"fs-sort/internal/transport"
	"log"
	"net/http"
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

	// Ожидание сигнала для завершения работы с использованием signal.NotifyContext
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop() // Убедитесь, что контекст отменится при завершении

	// Ожидание завершения работы сервера с контекстом
	<-ctx.Done()

	log.Println("Получен сигнал, начинаем завершение работы", ctx.Err())

	// Создание контекста для graceful shutdown с таймаутом
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Попытка корректно завершить работу сервера
	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Ошибка при завершении работы сервера %v", err)
	}

	log.Println("Сервер успешно завершил работу")
}
