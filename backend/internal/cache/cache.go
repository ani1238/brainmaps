// Package cache is a thin, optional Redis cache layer. Every operation degrades
// gracefully: if REDIS_URL is unset or Redis is unreachable, the cache is simply
// disabled and callers fall through to their source of truth (Postgres). Nothing
// in the app depends on the cache being available.
package cache

import (
	"context"
	"encoding/json"
	"os"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

var client *redis.Client

// Connect initialises the Redis client from REDIS_URL. A missing URL or a failed
// ping leaves the cache disabled (not an error) — the app runs fine without it.
func Connect(ctx context.Context) {
	url := os.Getenv("REDIS_URL")
	if url == "" {
		return
	}
	opt, err := redis.ParseURL(url)
	if err != nil {
		return
	}
	// Keep Redis off the request hot path: tight timeouts so a slow/unavailable
	// cache never delays a response — we just fall back to Postgres. In
	// production the app and Redis are co-located (sub-ms); REDIS_TIMEOUT_MS can
	// raise this when accessing Redis over a higher-latency link (e.g. a tunnel).
	opMs := 250
	if v := os.Getenv("REDIS_TIMEOUT_MS"); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			opMs = n
		}
	}
	opt.DialTimeout = 5 * time.Second
	opt.ReadTimeout = time.Duration(opMs) * time.Millisecond
	opt.WriteTimeout = time.Duration(opMs) * time.Millisecond
	opt.MaxRetries = -1

	c := redis.NewClient(opt)
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := c.Ping(pingCtx).Err(); err != nil {
		_ = c.Close()
		return
	}
	client = c
}

// Enabled reports whether a live Redis connection is available.
func Enabled() bool { return client != nil }

// GetJSON unmarshals a cached value into dst. Returns false on miss, disabled
// cache, or any error (caller should then compute from source).
func GetJSON(ctx context.Context, key string, dst any) bool {
	if client == nil {
		return false
	}
	b, err := client.Get(ctx, key).Bytes()
	if err != nil {
		return false
	}
	if err := json.Unmarshal(b, dst); err != nil {
		return false
	}
	return true
}

// SetJSON stores v as JSON under key with a TTL. Best-effort: errors are ignored.
func SetJSON(ctx context.Context, key string, v any, ttl time.Duration) {
	if client == nil {
		return
	}
	b, err := json.Marshal(v)
	if err != nil {
		return
	}
	_ = client.Set(ctx, key, b, ttl).Err()
}

// Del removes one or more keys (best-effort). Used to bust stale entries.
func Del(ctx context.Context, keys ...string) {
	if client == nil || len(keys) == 0 {
		return
	}
	_ = client.Del(ctx, keys...).Err()
}

// BustStudent invalidates every per-student read-cache entry. Call this whenever
// a student's progress changes (e.g. on session completion) so the dashboard,
// today queues and brain-map markers reflect it immediately rather than after
// the TTL. Best-effort and bounded so it never blocks the caller.
func BustStudent(ctx context.Context, studentID string) {
	if client == nil || studentID == "" {
		return
	}
	bustCtx, cancel := context.WithTimeout(ctx, 1*time.Second)
	defer cancel()

	keys := []string{"dash:" + studentID, "today:" + studentID}

	// chapters:<sid>:<subject> — one per subject; SCAN and collect the matches.
	iter := client.Scan(bustCtx, 0, "chapters:"+studentID+":*", 100).Iterator()
	for iter.Next(bustCtx) {
		keys = append(keys, iter.Val())
	}
	_ = client.Del(bustCtx, keys...).Err()
}
