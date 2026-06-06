# AI Grading Pipeline

Only three question types need AI: **FEYNMAN**, **BLURT**, and **ACTIVE_RECALL**.
MCQ and DESCRIPTIVE are either auto-graded or self-assessed.

## Why each type needs AI

| Type | What the student does | Why AI? |
|---|---|---|
| `FEYNMAN` | Explain concept to an imaginary friend | Open-ended — no single right answer; AI checks if key concepts are covered clearly |
| `BLURT` | Brain-dump everything they remember in 3 mins | Completeness check against the concept's topic |
| `ACTIVE_RECALL` | Apply concept to a new real-world scenario | Reasoning quality — did they use the concept correctly? |
| `MCQ` | Pick A/B/C/D | Instant DB lookup — no AI needed |
| `DESCRIPTIVE` | Short written answer | Rubric hint shown to student; self-assessed |

## Grading Pipeline

```mermaid
flowchart TD
    A["POST /sessions/id/complete"] --> B["Insert all answers to DB"]
    B --> C["Grade MCQ instantly\n(SELECT is_correct from mcq_options)"]
    C --> D["Return MCQ score to student\n← instant response"]

    D --> E{Has open-ended\nanswers?}
    E -- No --> F["go RecomputeSession()\nupdate EMA with MCQ score"]
    E -- Yes --> G["go GradeOpenAnswers()\nnon-blocking goroutine"]

    G --> H["Load ungraded answers\nfrom session_answers"]
    H --> I["For each FEYNMAN / BLURT / ACTIVE_RECALL"]
    I --> J["buildPrompt()\ntype + concept + question\n+ key_concepts + student text"]
    J --> K["POST to Gemini Flash 2.0\ngemini-2.0-flash:generateContent\nJSON mode, temp=0.2"]
    K --> L{"API success?"}
    L -- Yes --> M["Parse {score, feedback}\nclamp score to [0,1]"]
    L -- No --> N["Fallback: score=0.5\nfeedback='Try again!'"]
    M --> O["UPDATE session_answers\nSET ai_score, ai_feedback, ai_graded_at"]
    N --> O
    O --> P{More answers\nto grade?}
    P -- Yes --> I
    P -- No --> Q["RecomputeSession()\nfinal EMA + concept_progress"]

    style D fill:#22c55e,color:#fff
    style K fill:#4F46E5,color:#fff
    style Q fill:#f97316,color:#fff
```

## Prompt Design

The prompt is built by `buildPrompt()` in `internal/grade/grader.go`. Key decisions:

### FEYNMAN prompt

```
You are grading a Class 6 Indian student's answer for the BrainMaps learning app.

Concept: Ancient Texts of India
Question type: FEYNMAN
Question: Your friend asks "Why did ancient Indians memorise the Vedas instead
          of writing them down right away?" Explain two possible reasons.
Key concepts that should be covered:
  writing was rare and expensive — palm leaves hard to prepare in large numbers;
  oral tradition was trusted — trained reciters memorised word for word;
  sacred sound considered essential — reading seen as less reliable;
  this was the culture before printing existed

Student's answer: [student text]

Score criteria (0.0–1.0):
- 0.8–1.0: covers all key concepts clearly and simply, like explaining to a friend
- 0.5–0.8: covers most key concepts but unclear or incomplete
- 0.2–0.5: partially correct but missing major ideas
- 0.0–0.2: off-topic or fundamentally wrong

Be encouraging. The feedback must be one short sentence (max 15 words) for a 12-year-old.
Return ONLY valid JSON: {"score": 0.XX, "feedback": "..."}
```

### BLURT prompt

```
...
Question type: BLURT
Question: Write everything you remember about [blurt topic]

Score criteria (0.0–1.0):
- 0.8–1.0: comprehensive brain-dump covering most key facts
- 0.5–0.8: good recall but missing some important points
- 0.2–0.5: partial recall — only a few facts mentioned
- 0.0–0.2: almost nothing relevant recalled
...
```

### Gemini API settings

| Setting | Value | Reason |
|---|---|---|
| Model | `gemini-2.0-flash` | Fastest + cheapest; 1500 req/day free |
| `responseMimeType` | `application/json` | Forces structured output, no parsing ambiguity |
| `temperature` | `0.2` | Low randomness → consistent scores |
| `maxOutputTokens` | `256` | Score + one sentence only |

## EMA Recomputation After Grading

```mermaid
flowchart LR
    A["Last 5 sessions\n(most recent first)"] --> B

    subgraph B["EMA Weights"]
        direction TB
        W1["Session -1\n× 0.35"]
        W2["Session -2\n× 0.25"]
        W3["Session -3\n× 0.20"]
        W4["Session -4\n× 0.12"]
        W5["Session -5\n× 0.08"]
    end

    B --> C["Sum ÷ total weight\n= EMA score 0–1"]
    C --> D{EMA threshold}
    D -->|"≥ 0.80"| E["STRONG 💪"]
    D -->|"≥ 0.45"| F["DEVELOPING 📈"]
    D -->|"≥ 0.25"| G["WEAK ⚠️"]
    D -->|"< 0.25"| H["VERY_WEAK 🔴"]

    style E fill:#22c55e,color:#fff
    style F fill:#f59e0b,color:#fff
    style G fill:#f97316,color:#fff
    style H fill:#ef4444,color:#fff
```

## Failure Handling

| Failure | Behaviour |
|---|---|
| Gemini API timeout (>10s) | Goroutine context cancelled; fallback score 0.5 used |
| HTTP 429 rate limit | Fallback score 0.5 + "We'll grade this later" feedback |
| Malformed JSON from Gemini | `json.Unmarshal` error → fallback 0.5 |
| DB write failure | Log error; session still marked complete with MCQ score |

The student always gets their MCQ result immediately. AI grading failure only means the open-ended component defaults to 0.5 (neutral) — the session is never stuck.
