package handlers

import (
	"bytes"
	"encoding/base64"
	"net/http/httptest"
	"testing"
)

func TestNewSessionToken(t *testing.T) {
	tokenA, hashA, err := newSessionToken()
	if err != nil {
		t.Fatal(err)
	}
	tokenB, hashB, err := newSessionToken()
	if err != nil {
		t.Fatal(err)
	}

	if tokenA == tokenB || bytes.Equal(hashA, hashB) {
		t.Fatal("session tokens must be unique")
	}
	raw, err := base64.RawURLEncoding.DecodeString(tokenA)
	if err != nil {
		t.Fatalf("token is not URL-safe base64: %v", err)
	}
	if len(raw) != 32 {
		t.Fatalf("token entropy = %d bytes, want 32", len(raw))
	}
	if bytes.Equal([]byte(tokenA), hashA) {
		t.Fatal("stored hash must not equal the plaintext token")
	}
	if !bytes.Equal(sessionTokenHash(tokenA), hashA) {
		t.Fatal("token hash is not deterministic")
	}
}

func TestRequestSessionTokenHash(t *testing.T) {
	req := httptest.NewRequest("GET", "/api/v1/sessions/id/review", nil)
	if _, ok := requestSessionTokenHash(req); ok {
		t.Fatal("missing token should be rejected")
	}

	req.Header.Set(sessionTokenHeader, " test-token ")
	got, ok := requestSessionTokenHash(req)
	if !ok {
		t.Fatal("present token should be accepted")
	}
	if !bytes.Equal(got, sessionTokenHash("test-token")) {
		t.Fatal("header token was not trimmed and hashed")
	}
}
