// Package ai provides a small JSON-mode text completion helper that fans out
// across the configured providers (Groq → Gemini → OpenAI), returning the first
// success. It is shared by the grader and the parent-report generator.
package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

// Stable default models. Each can be overridden at runtime via env so model
// migrations do not require a redeploy.
const (
	defaultGroqModel   = "llama-3.3-70b-versatile"
	defaultGeminiModel = "gemini-3.1-flash-lite"
	defaultOpenAIModel = "gpt-5.4-mini"
)

func configuredModel(envKey, fallback string) string {
	if model := strings.TrimSpace(os.Getenv(envKey)); model != "" {
		return model
	}
	return fallback
}

// Complete sends the prompt through the configured providers in order and
// returns the first successful JSON text response. A single provider's
// quota/outage falls through to the next.
func Complete(ctx context.Context, prompt string) (string, error) {
	if key := os.Getenv("GROQ_API_KEY"); key != "" {
		text, err := callGroqRaw(ctx, key, prompt)
		if err == nil {
			return text, nil
		}
		log.Printf("[ai] groq failed, falling back: %v", err)
	}
	if key := os.Getenv("GEMINI_API_KEY"); key != "" {
		text, err := callGeminiRaw(ctx, key, prompt)
		if err == nil {
			return text, nil
		}
		log.Printf("[ai] gemini failed, falling back: %v", err)
	}
	if key := os.Getenv("OPENAI_API_KEY"); key != "" {
		return callOpenAIRaw(ctx, key, prompt)
	}
	return "", fmt.Errorf("no AI provider configured (set GROQ_API_KEY, GEMINI_API_KEY or OPENAI_API_KEY)")
}

func callGroqRaw(ctx context.Context, apiKey, prompt string) (string, error) {
	payload := map[string]any{
		"model":           configuredModel("GROQ_MODEL", defaultGroqModel),
		"messages":        []map[string]any{{"role": "user", "content": prompt}},
		"response_format": map[string]any{"type": "json_object"},
		"temperature":     0.2,
		"max_tokens":      2048,
	}
	body, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.groq.com/openai/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("groq %d: %s", resp.StatusCode, raw)
	}
	var r struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(raw, &r); err != nil {
		return "", err
	}
	if len(r.Choices) == 0 || strings.TrimSpace(r.Choices[0].Message.Content) == "" {
		return "", fmt.Errorf("groq: empty response: %s", raw)
	}
	return r.Choices[0].Message.Content, nil
}

func callOpenAIRaw(ctx context.Context, apiKey, prompt string) (string, error) {
	payload := map[string]any{
		"model": configuredModel("OPENAI_MODEL", defaultOpenAIModel),
		"input": prompt,
		"text": map[string]any{
			"format": map[string]any{"type": "json_object"},
		},
		"max_output_tokens": 8192,
	}
	body, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.openai.com/v1/responses", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("openai %d: %s", resp.StatusCode, raw)
	}
	var r struct {
		OutputText string `json:"output_text"`
		Output     []struct {
			Type    string `json:"type"`
			Content []struct {
				Type string `json:"type"`
				Text string `json:"text"`
			} `json:"content"`
		} `json:"output"`
	}
	if err := json.Unmarshal(raw, &r); err != nil {
		return "", err
	}
	if strings.TrimSpace(r.OutputText) != "" {
		return r.OutputText, nil
	}
	for _, o := range r.Output {
		if o.Type != "message" {
			continue
		}
		for _, c := range o.Content {
			if c.Type == "output_text" && strings.TrimSpace(c.Text) != "" {
				return c.Text, nil
			}
		}
	}
	return "", fmt.Errorf("openai: empty response: %s", raw)
}

func callGeminiRaw(ctx context.Context, apiKey, prompt string) (string, error) {
	payload := map[string]any{
		"contents": []map[string]any{
			{"parts": []map[string]any{{"text": prompt}}},
		},
		"generationConfig": map[string]any{
			"responseMimeType": "application/json",
			"maxOutputTokens":  8192,
			"temperature":      0.2,
		},
	}
	body, _ := json.Marshal(payload)
	model := configuredModel("GEMINI_MODEL", defaultGeminiModel)
	url := "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-goog-api-key", apiKey)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("gemini %d: %s", resp.StatusCode, raw)
	}
	var geminiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.Unmarshal(raw, &geminiResp); err != nil {
		return "", err
	}
	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("empty gemini response")
	}
	return geminiResp.Candidates[0].Content.Parts[0].Text, nil
}
