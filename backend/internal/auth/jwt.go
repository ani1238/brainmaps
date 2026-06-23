// Package auth provides stateless HS256 JWT access tokens and opaque,
// hashable refresh tokens. It depends only on the standard library, matching
// the project's hand-rolled PBKDF2 password hashing (no external JWT package).
package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"errors"
	"os"
	"strings"
	"time"
)

// AccessTokenTTL is the lifetime of a signed access token. Kept short because
// refresh tokens (stored server-side) allow silent renewal.
const AccessTokenTTL = 15 * time.Minute

// ErrInvalidToken is returned for any malformed, mis-signed, or expired token.
var ErrInvalidToken = errors.New("invalid token")

// Claims is the JWT payload. Sub is the user id; Sid is the 1:1 student id.
type Claims struct {
	Sub string `json:"sub"`
	Sid string `json:"sid"`
	Iat int64  `json:"iat"`
	Exp int64  `json:"exp"`
}

func secret() ([]byte, error) {
	s := os.Getenv("JWT_SECRET")
	if len(s) < 16 {
		return nil, errors.New("JWT_SECRET missing or shorter than 16 chars")
	}
	return []byte(s), nil
}

func b64(b []byte) string { return base64.RawURLEncoding.EncodeToString(b) }

// MintAccessToken builds and signs an HS256 JWT for the given user + student.
func MintAccessToken(userID, studentID string) (string, error) {
	key, err := secret()
	if err != nil {
		return "", err
	}
	now := time.Now()
	header := b64([]byte(`{"alg":"HS256","typ":"JWT"}`))
	cj, err := json.Marshal(Claims{
		Sub: userID,
		Sid: studentID,
		Iat: now.Unix(),
		Exp: now.Add(AccessTokenTTL).Unix(),
	})
	if err != nil {
		return "", err
	}
	signing := header + "." + b64(cj)
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(signing))
	return signing + "." + b64(mac.Sum(nil)), nil
}

// VerifyAccessToken validates the signature and expiry, returning the claims.
func VerifyAccessToken(token string) (*Claims, error) {
	key, err := secret()
	if err != nil {
		return nil, err
	}
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, ErrInvalidToken
	}
	signing := parts[0] + "." + parts[1]
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(signing))
	expected := b64(mac.Sum(nil))
	if subtle.ConstantTimeCompare([]byte(expected), []byte(parts[2])) != 1 {
		return nil, ErrInvalidToken
	}
	cj, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, ErrInvalidToken
	}
	var c Claims
	if err := json.Unmarshal(cj, &c); err != nil {
		return nil, ErrInvalidToken
	}
	if time.Now().Unix() >= c.Exp {
		return nil, ErrInvalidToken
	}
	return &c, nil
}

// NewRefreshToken returns a random opaque token and its SHA-256 hash. Only the
// hash is persisted (in auth_sessions.token_hash); the plain value goes to the
// client.
func NewRefreshToken() (plain string, hash []byte, err error) {
	raw := make([]byte, 32)
	if _, err = rand.Read(raw); err != nil {
		return
	}
	plain = base64.RawURLEncoding.EncodeToString(raw)
	hash = HashToken(plain)
	return
}

// HashToken returns the SHA-256 of an opaque token for constant-time lookup.
func HashToken(plain string) []byte {
	sum := sha256.Sum256([]byte(plain))
	return sum[:]
}
