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
	r.Use(securityHeaders)
	r.Use(corsMiddleware)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	r.Route("/api/v1", func(r chi.Router) {
		// ── Public: auth (rate-limited per IP to slow brute force / abuse) ────
		authLimiter := newIPLimiter(60, 20) // ~60/min, burst 20 — generous for real users
		r.Group(func(r chi.Router) {
			r.Use(authLimiter.middleware)
			r.Post("/auth/register", handlers.RegisterUser)
			r.Post("/auth/login", handlers.LoginUser)
			r.Post("/auth/refresh", handlers.RefreshSession) // rotate refresh -> new access
			r.Post("/auth/logout", handlers.LogoutUser)      // graceful; ok without valid token
			r.Post("/auth/forgot", handlers.ForgotPassword)  // request a reset link
			r.Post("/auth/reset", handlers.ResetPassword)    // consume reset token
		})

		// ── Public: enrollment lead capture (login/enroll form) ───────────────
		r.Post("/leads", handlers.CreateLead)

		// ── Protected: all data routes require a valid user session ──────────
		r.Group(func(r chi.Router) {
			r.Use(authmw.RequireAuth)
			r.Use(authmw.RLSContext) // per-request transaction + RLS identity (app.student_id)

			// Authenticated learner profile (class + board + 1:1 student id)
			r.Get("/auth/me", handlers.Me)

			// Parent report (PIN-gated)
			r.Post("/auth/parent-pin", handlers.SetParentPin)
			r.Get("/report/status", handlers.ReportStatus)
			r.Post("/report", handlers.GetParentReport)
			r.Post("/report/generate", handlers.GenerateParentReport) // on-demand fresh report
			r.Post("/report/item", handlers.GetParentReportItem)      // open a past report by id

			// Curriculum (no student required)
			r.Get("/chapters", handlers.GetChapters)
			r.Get("/concepts", handlers.GetConcepts)
			r.Get("/concepts/{id}", handlers.GetConcept)
			r.Get("/concepts/{id}/questions", handlers.GetConceptQuestions)
			r.Get("/concepts/{id}/sessions", handlers.ListConceptSessions) // past attempts (student-scoped)

			// Session flow (student-scoped; ownership validated per handler)
			r.Post("/sessions", handlers.StartSession)
			r.Post("/sessions/{id}/complete", handlers.CompleteSession)
			r.Get("/sessions/{id}", handlers.GetSession)
			r.Get("/sessions/{id}/review", handlers.GetSessionReview)
			r.Get("/sessions/{id}/report", handlers.GetSessionReportByStudent) // review a past owned session

			// Today's plan + dashboard/progress summary
			r.Get("/today", handlers.GetToday)
			r.Get("/dashboard", handlers.GetDashboard)

			// Student planner / calendar
			r.Get("/plan", handlers.GetPlan)
			r.Post("/plan/generate", handlers.GeneratePlan)
			r.Post("/plan/settings", handlers.SavePlanSettings)
			r.Get("/plan/agenda", handlers.GetAgenda)
			r.Get("/plan/items", handlers.GetPlanItems)
			r.Get("/plan/calendar", handlers.GetCalendar)
			r.Post("/plan/item/move", handlers.MovePlanItem)
			r.Post("/plan/item/skip", handlers.SkipPlanItem)
			r.Post("/plan/reflow", handlers.ReflowPlan)
			r.Get("/plan/leaves", handlers.GetLeaves)
			r.Post("/plan/leave", handlers.AddLeave)
			r.Post("/plan/leave/remove", handlers.RemoveLeave)
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

// securityHeaders adds conservative response headers on every API response.
func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("Cross-Origin-Resource-Policy", "same-origin")
		w.Header().Set("X-Robots-Tag", "noindex")
		next.ServeHTTP(w, r)
	})
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
