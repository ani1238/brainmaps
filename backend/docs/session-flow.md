# Session Flow

How a student moves from clicking "Start Level 1" to having their mastery state updated.

## Station State Machine

```mermaid
stateDiagram-v2
    direction LR

    [*] --> NOT_STARTED

    NOT_STARTED --> Level1 : click Start

    Level1 --> Level1_Fix : score < 0.60\n(Today's Fix queue)
    Level1 --> Level2 : score ≥ 0.60

    Level1_Fix --> Level1 : retry

    Level2 --> Level2_Fix : score < 0.60
    Level2 --> Level3 : score ≥ 0.60

    Level2_Fix --> Level2 : retry

    Level3 --> Level3_Fix : score < 0.60
    Level3 --> Strengthen : score ≥ 0.60

    Level3_Fix --> Level3 : retry

    Strengthen --> Revise : complete

    Revise --> Revise : SRS interval advances\n(1→3→7→21→60 days)
    Revise --> [*] : 60-day interval passed ✓
```

## Full Session Sequence

```mermaid
sequenceDiagram
    participant S as Student (browser)
    participant API as Go API
    participant DB as Neon Postgres
    participant AI as Gemini Flash

    S->>API: POST /sessions\n{studentId, conceptId, station: "level1"}
    API->>DB: INSERT sessions → returns sessionId
    API-->>S: {sessionId: "abc-123"}

    Note over S: Student works through 3 questions

    S->>API: POST /sessions/abc-123/complete\n{answers: [MCQ, FEYNMAN, DESCRIPTIVE]}
    
    API->>DB: INSERT session_answers (all 3)
    API->>DB: SELECT is_correct for MCQ option
    Note over API: MCQ score computed instantly
    
    API->>DB: UPDATE sessions SET score=0.67, completed_at=now()
    API-->>S: {score: 0.67, passed: false, aiGrading: true}
    Note over S: Student sees score immediately ✓

    par Async goroutine (non-blocking)
        API->>DB: SELECT open answers WHERE ai_graded_at IS NULL
        API->>AI: grade FEYNMAN answer\n(concept + key_concepts + student text)
        AI-->>API: {score: 0.78, feedback: "Good try, add more detail!"}
        API->>DB: UPDATE session_answers SET ai_score=0.78
        API->>DB: SELECT last 5 session scores
        Note over API: Compute EMA with weights [0.35,0.25,0.20,0.12,0.08]
        API->>DB: UPDATE concept_progress SET ema_score, state, l1_done
    end
```

## Strengthen Station — Interleaved Order

The Strengthen station serves all Level 1–3 questions in an **offset-rotated** order so the student can't predict difficulty:

```mermaid
graph LR
    subgraph "Round 1"
        L1_MCQ["L1 MCQ\n(easy)"]
        L2_DESC["L2 Descriptive\n(medium)"]
        L3_FEYN["L3 Feynman\n(hard)"]
    end
    subgraph "Round 2"
        L1_DESC["L1 Descriptive\n(easy)"]
        L2_FEYN["L2 Feynman\n(medium)"]
        L3_MCQ["L3 MCQ\n(hard)"]
    end
    subgraph "Round 3"
        L1_FEYN["L1 Feynman\n(easy)"]
        L2_MCQ["L2 MCQ\n(medium)"]
        L3_DESC["L3 Descriptive\n(hard)"]
    end
    subgraph "Final"
        BLURT["🧠 BLURT\n3-min brain dump"]
    end

    L1_MCQ --> L2_DESC --> L3_FEYN
    L3_FEYN --> L1_DESC --> L2_FEYN --> L3_MCQ
    L3_MCQ --> L1_FEYN --> L2_MCQ --> L3_DESC
    L3_DESC --> BLURT

    style BLURT fill:#4F46E5,color:#fff
```

Each round has **one question from each difficulty level** and **different types** — so the student's brain has to retrieve without the level-cue as a hint.

## Revise (SRS) Schedule

```mermaid
timeline
    title Spaced Repetition Intervals for a STRONG concept
    Day 1  : First Revise session\ninterval → 3 days
    Day 4  : Second Revise session\ninterval → 7 days
    Day 11 : Third Revise session\ninterval → 21 days
    Day 32 : Fourth Revise session\ninterval → 60 days
    Day 92 : Fifth Revise session\nconcept considered retained ✓
```

If the student **fails** a Revise session (score < 0.60), the interval resets to 1 day and the concept moves back to the Fix queue.
