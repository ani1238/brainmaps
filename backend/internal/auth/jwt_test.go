package auth

import (
	"testing"
)

func TestAccessTokenRoundTrip(t *testing.T) {
	t.Setenv("JWT_SECRET", "test-secret-at-least-16-chars-long")

	tok, err := MintAccessToken("user-123", "stu-456")
	if err != nil {
		t.Fatalf("mint: %v", err)
	}
	c, err := VerifyAccessToken(tok)
	if err != nil {
		t.Fatalf("verify: %v", err)
	}
	if c.Sub != "user-123" || c.Sid != "stu-456" {
		t.Fatalf("claims mismatch: %+v", c)
	}
}

func TestVerifyRejectsTamper(t *testing.T) {
	t.Setenv("JWT_SECRET", "test-secret-at-least-16-chars-long")
	tok, _ := MintAccessToken("user-123", "stu-456")

	if _, err := VerifyAccessToken(tok + "x"); err == nil {
		t.Fatal("expected tampered token to fail")
	}
	// Wrong secret must fail.
	t.Setenv("JWT_SECRET", "a-totally-different-secret-value-x")
	if _, err := VerifyAccessToken(tok); err == nil {
		t.Fatal("expected wrong-secret verification to fail")
	}
}

func TestRefreshTokenHashing(t *testing.T) {
	plain, hash, err := NewRefreshToken()
	if err != nil {
		t.Fatalf("new refresh: %v", err)
	}
	if len(plain) == 0 || len(hash) != 32 {
		t.Fatalf("bad refresh token plain=%d hash=%d", len(plain), len(hash))
	}
	again := HashToken(plain)
	if string(again) != string(hash) {
		t.Fatal("HashToken not deterministic")
	}
}

func TestMissingSecret(t *testing.T) {
	t.Setenv("JWT_SECRET", "")
	if _, err := MintAccessToken("u", "s"); err == nil {
		t.Fatal("expected error when JWT_SECRET unset")
	}
}
