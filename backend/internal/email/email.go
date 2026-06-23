// Package email sends transactional email. If RESEND_API_KEY is set it delivers
// via Resend's HTTP API; otherwise it logs the message (useful for local dev
// and as a safe default before an email provider is configured).
package email

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

// SendPasswordReset emails a password-reset link to the recipient. It never
// returns an error to the caller's user-facing flow for delivery problems;
// callers should log but still respond 200 to avoid leaking account existence.
func SendPasswordReset(ctx context.Context, to, resetURL string) error {
	subject := "Reset your BrainMaps password"
	html := fmt.Sprintf(
		`<p>We received a request to reset your BrainMaps password.</p>`+
			`<p><a href="%s">Click here to choose a new password</a>. `+
			`This link expires in 1 hour.</p>`+
			`<p>If you didn't request this, you can ignore this email.</p>`,
		resetURL,
	)
	return send(ctx, to, subject, html, "Reset your BrainMaps password: "+resetURL)
}

func send(ctx context.Context, to, subject, html, logLine string) error {
	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		// No provider configured — log the link so the flow is testable.
		log.Printf("[email:log-only] to=%s subject=%q | %s", to, subject, logLine)
		return nil
	}

	from := os.Getenv("EMAIL_FROM")
	if from == "" {
		from = "BrainMaps <onboarding@resend.dev>"
	}

	payload, _ := json.Marshal(map[string]any{
		"from":    from,
		"to":      []string{to},
		"subject": subject,
		"html":    html,
	})

	reqCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(reqCtx, http.MethodPost,
		"https://api.resend.com/emails", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return fmt.Errorf("resend: status %d", resp.StatusCode)
	}
	return nil
}
