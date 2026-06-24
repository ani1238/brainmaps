package api

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

// ipLimiter is a tiny in-memory token-bucket rate limiter keyed by client IP,
// used to slow brute-force / abuse on the public auth endpoints. It is
// deliberately generous so real users are never blocked; it only trips on
// clearly abusive request rates. (Per-instance; good enough as a first guard.)
type ipLimiter struct {
	mu      sync.Mutex
	buckets map[string]*tokenBucket
	rate    float64 // tokens added per second
	burst   float64 // max tokens
}

type tokenBucket struct {
	tokens float64
	last   time.Time
}

func newIPLimiter(perMinute, burst float64) *ipLimiter {
	l := &ipLimiter{
		buckets: make(map[string]*tokenBucket),
		rate:    perMinute / 60.0,
		burst:   burst,
	}
	go l.janitor()
	return l
}

func (l *ipLimiter) allow(key string) bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	b, ok := l.buckets[key]
	if !ok {
		l.buckets[key] = &tokenBucket{tokens: l.burst - 1, last: now}
		return true
	}
	b.tokens += now.Sub(b.last).Seconds() * l.rate
	if b.tokens > l.burst {
		b.tokens = l.burst
	}
	b.last = now
	if b.tokens < 1 {
		return false
	}
	b.tokens--
	return true
}

// janitor drops idle buckets so the map can't grow without bound.
func (l *ipLimiter) janitor() {
	for range time.Tick(5 * time.Minute) {
		l.mu.Lock()
		cutoff := time.Now().Add(-10 * time.Minute)
		for k, b := range l.buckets {
			if b.last.Before(cutoff) {
				delete(l.buckets, k)
			}
		}
		l.mu.Unlock()
	}
}

func (l *ipLimiter) middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !l.allow(clientIP(r)) {
			w.Header().Set("Retry-After", "30")
			http.Error(w, "too many requests", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// clientIP resolves the real client IP behind Fly's proxy.
func clientIP(r *http.Request) string {
	if ip := r.Header.Get("Fly-Client-IP"); ip != "" {
		return ip
	}
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return strings.TrimSpace(strings.Split(xff, ",")[0])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
