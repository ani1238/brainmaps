package handlers

import (
	"log"
	"net/http"
)

// serverErr logs the real error server-side and returns a generic 500 to the
// client, so internal details (SQL text, driver errors, schema) never leak.
func serverErr(w http.ResponseWriter, err error) {
	log.Printf("handler 500: %v", err)
	http.Error(w, "something went wrong", http.StatusInternalServerError)
}
