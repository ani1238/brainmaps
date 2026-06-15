package handlers

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"net/http"
	"strings"
)

const sessionTokenHeader = "X-Session-Token"

func newSessionToken() (string, []byte, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", nil, err
	}
	token := base64.RawURLEncoding.EncodeToString(raw)
	return token, sessionTokenHash(token), nil
}

func sessionTokenHash(token string) []byte {
	sum := sha256.Sum256([]byte(token))
	return sum[:]
}

func requestSessionTokenHash(r *http.Request) ([]byte, bool) {
	token := strings.TrimSpace(r.Header.Get(sessionTokenHeader))
	if token == "" {
		return nil, false
	}
	return sessionTokenHash(token), true
}
