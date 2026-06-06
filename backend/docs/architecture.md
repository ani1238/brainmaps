# System Architecture

## Component Overview

```mermaid
graph TB
    subgraph Client["🌐 Client (Vercel — brainmaps.in)"]
        FE["Next.js 16 App\nReact 19 · Tailwind v4"]
    end

    subgraph API["⚙️ Go API (Fly.io / Railway)"]
        Router["chi Router\n:8080"]
        Handlers["Handlers\nconcepts · sessions · today"]
        Grader["AI Grader\ngoroutine pool"]
    end

    subgraph Data["💾 Data Layer"]
        Neon["Neon Postgres\nserverless · free tier\n3 GB storage"]
    end

    subgraph AI["🤖 AI (Google AI Studio)"]
        Gemini["Gemini Flash 2.0\n1,500 req/day free\nJSON mode"]
    end

    FE -->|"GET /api/v1/concepts\nPOST /api/v1/sessions"| Router
    Router --> Handlers
    Handlers -->|pgx pool\nmax 5 conns| Neon
    Handlers -->|"session complete\n→ go gradeOpenAnswers()"| Grader
    Grader -->|"HTTPS POST\ngenerateContent"| Gemini
    Grader -->|"UPDATE session_answers\nUPDATE concept_progress"| Neon
```

## Request Lifecycle

```mermaid
sequenceDiagram
    participant B as Browser (Next.js)
    participant G as Go API
    participant DB as Neon Postgres
    participant AI as Gemini Flash

    B->>G: POST /api/v1/sessions/complete
    G->>DB: INSERT session_answers (MCQ + open text)
    G->>DB: SELECT is_correct FROM mcq_options
    G-->>B: {score: 0.67, aiGrading: true} (instant)

    Note over G,AI: Non-blocking goroutine starts here

    G->>AI: grade FEYNMAN answer
    AI-->>G: {score: 0.82, feedback: "Great explanation!"}
    G->>DB: UPDATE session_answers SET ai_score
    G->>DB: SELECT last 5 session scores
    G->>DB: UPDATE concept_progress (new EMA + state)
```

## Directory Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go            ← entry point, graceful shutdown
├── internal/
│   ├── api/
│   │   ├── router.go          ← chi routes + CORS middleware
│   │   └── handlers/
│   │       ├── concepts.go    ← GET /concepts, GET /concepts/{id}/questions
│   │       ├── sessions.go    ← POST /sessions, POST /sessions/{id}/complete
│   │       └── today.go       ← GET /today (fix queue + revise queue)
│   ├── db/
│   │   └── db.go              ← pgxpool initialisation
│   ├── grade/
│   │   └── grader.go          ← Gemini API call + EMA recomputation
│   └── models/
│       └── models.go          ← all shared types
├── migrations/
│   ├── 001_schema.sql         ← tables + indexes
│   └── 002_seed_tapestry.sql  ← Tapestry of the Past question data
├── docs/                      ← you are here
├── go.mod
├── go.sum
└── .env.example
```

## Hosting Plan (zero cost to start)

| Service | What runs there | Free limit |
|---|---|---|
| **Vercel** | Next.js frontend | 100 GB bandwidth/month |
| **Fly.io** | Go API (256 MB RAM, shared CPU) | 3 shared VMs free |
| **Neon** | Postgres database | 3 GB storage, scales to zero |
| **Google AI Studio** | Gemini Flash grading | 1,500 requests/day |

Scale path: Neon → paid plan at >3 GB. Gemini → paid at >1,500 req/day (~150 active students doing 10 open questions each).
