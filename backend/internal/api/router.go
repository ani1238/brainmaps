package api

import (
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/ani1238/brainmaps-api/internal/api/handlers"
	authmw "github.com/ani1238/brainmaps-api/internal/api/middleware"
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
		// ── Public: auth ──────────────────────────────────────────────────────
		r.Post("/auth/register", handlers.RegisterUser)
		r.Post("/auth/login", handlers.LoginUser)
		r.Post("/auth/logout", handlers.LogoutUser) // graceful; ok without valid token

		// ── Protected: all data routes require a valid user session ──────────
		r.Group(func(r chi.Router) {
			r.Use(authmw.RequireAuth)

			// Authenticated learner profile (class + board + 1:1 student id)
			r.Get("/auth/me", handlers.Me)

			// Curriculum (no student required)
			r.Get("/chapters", handlers.GetChapters)
			r.Get("/concepts", handlers.GetConcepts)
			r.Get("/concepts/{id}", handlers.GetConcept)
			r.Get("/concepts/{id}/questions", handlers.GetConceptQuestions)

			// Session flow (student-scoped; ownership validated per handler)
			r.Post("/sessions", handlers.StartSession)
			r.Post("/sessions/{id}/complete", handlers.CompleteSession)
			r.Get("/sessions/{id}", handlers.GetSession)
			r.Get("/sessions/{id}/review", handlers.GetSessionReview)

			// Today's plan + dashboard/progress summary
			r.Get("/today", handlers.GetToday)
			r.Get("/dashboard", handlers.GetDashboard)
		})
	})

	return r
}

// allowedOrigins builds the permitted CORS origin set from the ALLOWED_ORIGINS
// environment variable (comma-separated). localhost:3000 is always included for
// local development. In production set ALLOWED_ORIGINS to the Vercel URL(s).
func allowedOrigins() map[string]bool {
	set := map[string]bool{
		"http://localhost:3000": true,
	}
	if raw := os.Getenv("ALLOWED_ORIGINS"); raw != "" {
		for _, o := range strings.Split(raw, ",") {
			if o = strings.TrimSpace(o); o != "" {
				set[o] = true
			}
		}
	}
	return set
}

func corsMiddleware(next http.Handler) http.Handler {
	origins := allowedOrigins()
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if origin := r.Header.Get("Origin"); origins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-Token")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
