package api

import (
	"net/http"
	"time"

	"github.com/ani1238/brainmaps-api/internal/api/handlers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func NewRouter() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(30 * time.Second))
	r.Use(corsMiddleware)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	r.Route("/api/v1", func(r chi.Router) {
		// Passwordless student identity (name matching for now)
		r.Post("/students/login", handlers.LoginStudent)

		// Curriculum + progress
		r.Get("/chapters", handlers.GetChapters)
		r.Get("/concepts", handlers.GetConcepts)
		r.Get("/concepts/{id}", handlers.GetConcept)
		r.Get("/concepts/{id}/questions", handlers.GetConceptQuestions)

		// Session flow
		r.Post("/sessions", handlers.StartSession)
		r.Post("/sessions/{id}/complete", handlers.CompleteSession)
		r.Get("/sessions/{id}", handlers.GetSession)

		// Today's plan + dashboard/progress summary
		r.Get("/today", handlers.GetToday)
		r.Get("/dashboard", handlers.GetDashboard)
	})

	return r
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
