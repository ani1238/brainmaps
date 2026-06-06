# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Cache deps separately from source so rebuilds are fast
COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server ./cmd/server/main.go

# ── Stage 2: minimal runtime ──────────────────────────────────────────────────
FROM alpine:3.21

# ca-certificates needed for TLS connections (Neon, Gemini)
RUN apk add --no-cache ca-certificates

WORKDIR /app
COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
