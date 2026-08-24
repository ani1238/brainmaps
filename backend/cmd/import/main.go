// Command import loads a BrainMaps v12 concept JSON (glossaries + per-station
// question pools) into the payload-driven question schema (migration 021).
//
//	go run ./cmd/import -file content/concept_xxx.json \
//	  -subject science -board CBSE -grade 6 -chapter-number 4
//
// It is idempotent: the concept, glossary, station_config and question rows are
// upserted, and the concept's existing questions are replaced so re-running with
// edited content is safe. Connects with DATABASE_URL as the migration/owner role.
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/joho/godotenv"
)

type conceptFile struct {
	ConceptID             string            `json:"concept_id"`
	ConceptName           string            `json:"concept_name"`
	Subject               string            `json:"subject"`
	Chapter               string            `json:"chapter"`
	SourceSection         string            `json:"source_section"`
	EngineVersion         string            `json:"engine_version"`
	BloomByStation        map[string]string `json:"bloom_by_station"`
	MisconceptionGlossary map[string]string `json:"misconception_tag_glossary"`
	KeyConceptGlossary    map[string]string `json:"key_concept_glossary"`
	Stations              map[string]struct {
		PoolSize    int              `json:"pool_size"`
		SessionSize int              `json:"session_size"`
		Items       []map[string]any `json:"items"`
	} `json:"stations"`
}

// station JSON key → questions.level value.
var stationLevel = map[string]string{
	"L1": "level1", "L2": "level2", "L3": "level3",
	"Strengthen": "strengthen", "Revise": "revise",
}

func main() {
	file := flag.String("file", "", "path to concept JSON")
	subject := flag.String("subject", "science", "subject_key")
	board := flag.String("board", "CBSE", "board")
	grade := flag.Int("grade", 6, "grade")
	chapterNumber := flag.Int("chapter-number", 1, "chapter number")
	chapterName := flag.String("chapter-name", "", "chapter display name (defaults to JSON chapter)")
	engineTypeFlag := flag.String("engine-type", "", "concept engine type (inferred from subject when omitted)")
	dsn := flag.String("dsn", "", "Postgres DSN (defaults to DATABASE_URL)")
	additive := flag.Bool("additive", false,
		"augment an existing concept: leave its concepts/chapters row and any legacy "+
			"(payload='{}') questions untouched, replacing only v12 payload rows")
	flag.Parse()

	if *file == "" {
		fatal("missing -file")
	}
	_ = godotenv.Load()
	conn := *dsn
	if conn == "" {
		conn = os.Getenv("DATABASE_URL")
	}
	if conn == "" {
		fatal("no DSN: pass -dsn or set DATABASE_URL")
	}

	raw, err := os.ReadFile(*file)
	must(err)
	var cf conceptFile
	must(json.Unmarshal(raw, &cf))
	if cf.ConceptID == "" {
		fatal("concept_id is empty")
	}
	resolvedChapterName := strings.TrimSpace(*chapterName)
	if resolvedChapterName == "" {
		resolvedChapterName = cf.Chapter
	}
	engineType := strings.TrimSpace(*engineTypeFlag)
	if engineType == "" {
		engineType = inferEngineType(*subject)
	}

	ctx := context.Background()
	db, err := pgx.Connect(ctx, conn)
	must(err)
	defer db.Close(ctx)

	tx, err := db.Begin(ctx)
	must(err)
	defer tx.Rollback(ctx)

	chapterID := fmt.Sprintf("%s_%s_g%d_ch%02d", strings.ToLower(*board), *subject, *grade, *chapterNumber)

	if *additive {
		// Augment an existing concept: never create/rewrite its concepts or chapters
		// row, so its curriculum metadata (name, chapter, recap, checklist, …) is
		// preserved. Require it to already exist.
		var exists bool
		must(tx.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM concepts WHERE id=$1)`, cf.ConceptID).Scan(&exists))
		if !exists {
			fatal("additive import: concept " + cf.ConceptID + " does not exist; run a full import first")
		}
	} else {
		// chapter (upsert)
		_, err = tx.Exec(ctx, `
			INSERT INTO chapters (id, subject_key, board, grade, number, name, order_idx)
			VALUES ($1,$2,$3,$4,$5,$6,$7)
			ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
			chapterID, *subject, *board, *grade, *chapterNumber, resolvedChapterName, *chapterNumber)
		must(err)

		// concept (upsert)
		meta, _ := json.Marshal(map[string]any{
			"engine_version":   cf.EngineVersion,
			"source_section":   cf.SourceSection,
			"bloom_by_station": cf.BloomByStation,
		})
		_, err = tx.Exec(ctx, `
			INSERT INTO concepts (id, subject_key, chapter_id, name, order_idx, engine_type, board, grade, metadata)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
			ON CONFLICT (id) DO UPDATE SET
			  name = EXCLUDED.name, chapter_id = EXCLUDED.chapter_id, metadata = EXCLUDED.metadata,
			  updated_at = now()`,
			cf.ConceptID, *subject, chapterID, cf.ConceptName, 0, engineType, *board, *grade, meta)
		must(err)
	}

	// glossaries — replace for this concept
	_, err = tx.Exec(ctx, `DELETE FROM misconception_tags WHERE concept_id=$1`, cf.ConceptID)
	must(err)
	for tag, desc := range cf.MisconceptionGlossary {
		_, err = tx.Exec(ctx, `INSERT INTO misconception_tags (concept_id, tag, description) VALUES ($1,$2,$3)`,
			cf.ConceptID, tag, desc)
		must(err)
	}
	_, err = tx.Exec(ctx, `DELETE FROM concept_key_concepts WHERE concept_id=$1`, cf.ConceptID)
	must(err)
	for key, desc := range cf.KeyConceptGlossary {
		_, err = tx.Exec(ctx, `INSERT INTO concept_key_concepts (concept_id, key, description) VALUES ($1,$2,$3)`,
			cf.ConceptID, key, desc)
		must(err)
	}

	// Questions + station_config — replace the active pool for this concept.
	// Historical session_answers reference question IDs, so old rows must not be
	// deleted. Retire them and reactivate/upsert every item in the incoming bank.
	// In additive mode, legacy payload-less rows remain active.
	if *additive {
		_, err = tx.Exec(ctx, `
			UPDATE questions SET is_active=false
			WHERE concept_id=$1 AND payload <> '{}'::jsonb`, cf.ConceptID)
	} else {
		_, err = tx.Exec(ctx, `UPDATE questions SET is_active=false WHERE concept_id=$1`, cf.ConceptID)
	}
	must(err)
	_, err = tx.Exec(ctx, `DELETE FROM station_config WHERE concept_id=$1`, cf.ConceptID)
	must(err)

	total := 0
	for st, sv := range cf.Stations {
		level, ok := stationLevel[st]
		if !ok {
			fatal("unknown station " + st)
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO station_config (concept_id, level, pool_size, session_size, bloom)
			VALUES ($1,$2,$3,$4,$5)`,
			cf.ConceptID, level, sv.PoolSize, sv.SessionSize, cf.BloomByStation[st])
		must(err)

		for idx, item := range sv.Items {
			sourceID, _ := item["id"].(string)
			typ, _ := item["type"].(string)
			if sourceID == "" || typ == "" {
				fatal("item missing id/type in station " + st)
			}
			id := globallyUniqueQuestionID(cf.ConceptID, sourceID)
			item["id"] = id
			payload, err := json.Marshal(item)
			must(err)
			_, err = tx.Exec(ctx, `
				INSERT INTO questions
					(id, concept_id, type, level, text, explanation, key_concepts, order_idx, payload, is_active)
				VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
				ON CONFLICT (id) DO UPDATE SET
					concept_id = EXCLUDED.concept_id,
					type = EXCLUDED.type,
					level = EXCLUDED.level,
					text = EXCLUDED.text,
					explanation = EXCLUDED.explanation,
					key_concepts = EXCLUDED.key_concepts,
					order_idx = EXCLUDED.order_idx,
					payload = EXCLUDED.payload,
					is_active = true`,
				id, cf.ConceptID, dbType(typ), level, displayText(item),
				strPtr(item, "explanation"), keyConcepts(item), idx, payload)
			must(err)
			total++
		}
	}

	must(tx.Commit(ctx))
	fmt.Printf("imported concept %q: %d questions, %d tags, %d key-concepts, %d stations\n",
		cf.ConceptID, total, len(cf.MisconceptionGlossary), len(cf.KeyConceptGlossary), len(cf.Stations))
}

// dbType maps a lowercase JSON item type to the uppercase questions.type enum.
func dbType(t string) string { return strings.ToUpper(t) }

func globallyUniqueQuestionID(conceptID, sourceID string) string {
	if strings.HasPrefix(sourceID, conceptID) {
		return sourceID
	}
	return conceptID + "__" + sourceID
}

func inferEngineType(subject string) string {
	switch subject {
	case "english_vocab":
		return "ENGLISH_VOCAB"
	case "english_grammar":
		return "ENGLISH_GRAMMAR"
	case "english_lit":
		return "ENGLISH_LITERATURE"
	case "english_writing":
		return "ENGLISH_WRITING"
	case "english_rc":
		return "ENGLISH_COMPREHENSION"
	case "english":
		fatal("subject english is ambiguous; use an english_* track subject")
	}
	return "CONCEPTUAL"
}

// displayText picks the most prompt-like field for the flat questions.text column
// (used by search / legacy review); the full structure lives in payload.
func displayText(item map[string]any) string {
	for _, k := range []string{"prompt", "statement", "scenario", "assertion_text", "data_context", "explanation_frame", "claim", "text"} {
		if v, ok := item[k].(string); ok && v != "" {
			return v
		}
	}
	return ""
}

func strPtr(item map[string]any, k string) *string {
	if v, ok := item[k].(string); ok && v != "" {
		return &v
	}
	return nil
}

func keyConcepts(item map[string]any) []string {
	raw, ok := item["key_concepts"].([]any)
	if !ok {
		return []string{}
	}
	out := make([]string, 0, len(raw))
	for _, v := range raw {
		if s, ok := v.(string); ok {
			out = append(out, s)
		}
	}
	return out
}

func must(err error) {
	if err != nil {
		fatal(err.Error())
	}
}
func fatal(msg string) {
	fmt.Fprintln(os.Stderr, "import: "+msg)
	os.Exit(1)
}
