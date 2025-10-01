package httputil

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

func JSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if payload != nil {
		_ = json.NewEncoder(w).Encode(payload)
	}
}

func Error(w http.ResponseWriter, status int, msg string) {
	JSON(w, status, ErrorResponse{Error: msg})
}
