package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ani1238/brainmaps-api/internal/api"
	"github.com/ani1238/brainmaps-api/internal/cache"
	"github.com/ani1238/brainmaps-api/internal/db"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env in development (Neon + Gemini keys live here)
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file — expecting env vars from the environment")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.Connect(ctx); err != nil {
		log.Fatalf("db: %v", err)
	}
	defer db.Close()

	// Optional read-cache. Disabled cleanly if REDIS_URL is unset/unreachable.
	cache.Connect(ctx)
	if cache.Enabled() {
		log.Println("cache: Redis connected")
	} else {
		log.Println("cache: disabled (no Redis) — serving from Postgres")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      api.NewRouter(),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown on SIGTERM / SIGINT
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)

	go func() {
		log.Printf("brainmaps-api listening on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	}()

	<-quit
	log.Println("shutting down...")

	shutCtx, shutCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutCancel()
	srv.Shutdown(shutCtx)
}
