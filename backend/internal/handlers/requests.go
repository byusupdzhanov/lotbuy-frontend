package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"lotbuy-backend/internal/httputil"
	"lotbuy-backend/internal/store"
)

type createRequestPayload struct {
	Title           string  `json:"title"`
	Description     *string `json:"description"`
	BudgetAmount    float64 `json:"budgetAmount"`
	CurrencyCode    string  `json:"currencyCode"`
	ImageURL        *string `json:"imageUrl"`
	Category        *string `json:"category"`
	Subcategory     *string `json:"subcategory"`
	LocationCity    *string `json:"locationCity"`
	LocationRegion  *string `json:"locationRegion"`
	LocationCountry *string `json:"locationCountry"`
	DeadlineAt      *string `json:"deadlineAt"`
}

func (p createRequestPayload) validate() error {
	if p.Title == "" {
		return errors.New("title is required")
	}
	if p.CurrencyCode == "" {
		return errors.New("currencyCode is required")
	}
	if p.BudgetAmount <= 0 {
		return errors.New("budgetAmount must be greater than zero")
	}
	return nil
}

func (a *API) handleCreateRequest(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireAuth(w, r)
	if !ok {
		return
	}

	var payload createRequestPayload
	if err := decodeJSON(r, &payload); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := payload.validate(); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	buyerName := user.FullName
	if buyerName == "" {
		buyerName = user.Email
	}
	var deadline *time.Time
	if payload.DeadlineAt != nil {
		trimmed := strings.TrimSpace(*payload.DeadlineAt)
		if trimmed != "" {
			if ts, err := time.Parse(time.RFC3339, trimmed); err == nil {
				deadline = &ts
			}
		}
	}

	req, err := a.Store.CreateRequest(r.Context(), store.CreateRequestParams{
		Title:           payload.Title,
		Description:     payload.Description,
		BudgetAmount:    payload.BudgetAmount,
		CurrencyCode:    payload.CurrencyCode,
		BuyerID:         user.ID,
		BuyerName:       buyerName,
		BuyerAvatar:     user.AvatarURL,
		BuyerRating:     nil,
		ImageURL:        payload.ImageURL,
		Category:        payload.Category,
		Subcategory:     payload.Subcategory,
		LocationCity:    payload.LocationCity,
		LocationRegion:  payload.LocationRegion,
		LocationCountry: payload.LocationCountry,
		DeadlineAt:      deadline,
	})
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	httputil.JSON(w, http.StatusCreated, req)
}

func (a *API) handleListRequests(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	owner := r.URL.Query().Get("owner")
	limitParam := r.URL.Query().Get("limit")
	var params store.ListRequestsParams
	if status != "" {
		params.Status = &status
	}

	if limitParam != "" {
		if v, err := strconv.Atoi(limitParam); err == nil {
			params.Limit = &v
		}
	}
	if owner == "me" {
		user, ok := a.requireAuth(w, r)
		if !ok {
			return
		}
		params.BuyerID = &user.ID
	}

	requests, err := a.Store.ListRequests(r.Context(), params)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	httputil.JSON(w, http.StatusOK, requests)
}

func (a *API) handleGetRequest(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r, "requestID")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	req, err := a.Store.GetRequest(r.Context(), id)
	if err != nil {
		httputil.Error(w, http.StatusNotFound, err.Error())
		return
	}

	httputil.JSON(w, http.StatusOK, req)
}

type updateRequestPayload struct {
	Title           *string          `json:"title"`
	Description     *json.RawMessage `json:"description"`
	BudgetAmount    *float64         `json:"budgetAmount"`
	CurrencyCode    *string          `json:"currencyCode"`
	ImageURL        *json.RawMessage `json:"imageUrl"`
	Category        *json.RawMessage `json:"category"`
	Subcategory     *json.RawMessage `json:"subcategory"`
	LocationCity    *json.RawMessage `json:"locationCity"`
	LocationRegion  *json.RawMessage `json:"locationRegion"`
	LocationCountry *json.RawMessage `json:"locationCountry"`
	DeadlineAt      *json.RawMessage `json:"deadlineAt"`
}

func (a *API) handleUpdateRequest(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireAuth(w, r)
	if !ok {
		return
	}

	id, err := parseID(r, "requestID")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	existing, err := a.Store.GetRequest(r.Context(), id)
	if err != nil {
		httputil.Error(w, http.StatusNotFound, "request not found")
		return
	}
	if existing.BuyerID == nil || *existing.BuyerID != user.ID {
		httputil.Error(w, http.StatusForbidden, "you do not have permission to update this request")
		return
	}

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	var payload updateRequestPayload
	if err := decoder.Decode(&payload); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	params := store.UpdateRequestParams{ID: id, BuyerID: user.ID}
	var updates int

	if payload.Title != nil {
		title := strings.TrimSpace(*payload.Title)
		if title == "" {
			httputil.Error(w, http.StatusBadRequest, "title cannot be empty")
			return
		}
		params.Title = &title
		updates++
	}

	if payload.BudgetAmount != nil {
		if *payload.BudgetAmount <= 0 {
			httputil.Error(w, http.StatusBadRequest, "budgetAmount must be greater than zero")
			return
		}
		params.BudgetAmount = payload.BudgetAmount
		updates++
	}

	if payload.CurrencyCode != nil {
		code := strings.ToUpper(strings.TrimSpace(*payload.CurrencyCode))
		if code == "" {
			httputil.Error(w, http.StatusBadRequest, "currencyCode cannot be empty")
			return
		}
		params.CurrencyCode = &code
		updates++
	}

	if payload.Description != nil {
		updates++
		if *payload.Description == nil {
			params.Description = &sql.NullString{Valid: false}
		} else {
			var value string
			if err := json.Unmarshal(*payload.Description, &value); err != nil {
				httputil.Error(w, http.StatusBadRequest, "description must be a string or null")
				return
			}
			value = strings.TrimSpace(value)
			if value == "" {
				params.Description = &sql.NullString{Valid: false}
			} else {
				params.Description = &sql.NullString{String: value, Valid: true}
			}
		}
	}
	if payload.ImageURL != nil {
		updates++
		if *payload.ImageURL == nil {
			params.ImageURL = &sql.NullString{Valid: false}
		} else {
			var value string
			if err := json.Unmarshal(*payload.ImageURL, &value); err != nil {
				httputil.Error(w, http.StatusBadRequest, "imageUrl must be a string or null")
				return
			}
			value = strings.TrimSpace(value)
			if value == "" {
				params.ImageURL = &sql.NullString{Valid: false}
			} else {
				params.ImageURL = &sql.NullString{String: value, Valid: true}
			}
		}
	}
	if payload.Category != nil {
		updates++
		if *payload.Category == nil {
			params.Category = &sql.NullString{Valid: false}
		} else {
			var value string
			if err := json.Unmarshal(*payload.Category, &value); err != nil {
				httputil.Error(w, http.StatusBadRequest, "category must be a string or null")
				return
			}
			value = strings.TrimSpace(value)
			if value == "" {
				params.Category = &sql.NullString{Valid: false}
			} else {
				params.Category = &sql.NullString{String: value, Valid: true}
			}
		}
	}
	if payload.Subcategory != nil {
		updates++
		if *payload.Subcategory == nil {
			params.Subcategory = &sql.NullString{Valid: false}
		} else {
			var value string
			if err := json.Unmarshal(*payload.Subcategory, &value); err != nil {
				httputil.Error(w, http.StatusBadRequest, "subcategory must be a string or null")
				return
			}
			value = strings.TrimSpace(value)
			if value == "" {
				params.Subcategory = &sql.NullString{Valid: false}
			} else {
				params.Subcategory = &sql.NullString{String: value, Valid: true}
			}
		}
	}
	if payload.LocationCity != nil {
		updates++
		if *payload.LocationCity == nil {
			params.LocationCity = &sql.NullString{Valid: false}
		} else {
			var value string
			if err := json.Unmarshal(*payload.LocationCity, &value); err != nil {
				httputil.Error(w, http.StatusBadRequest, "locationCity must be a string or null")
				return
			}
			value = strings.TrimSpace(value)
			if value == "" {
				params.LocationCity = &sql.NullString{Valid: false}
			} else {
				params.LocationCity = &sql.NullString{String: value, Valid: true}
			}
		}
	}
	if payload.LocationRegion != nil {
		updates++
		if *payload.LocationRegion == nil {
			params.LocationRegion = &sql.NullString{Valid: false}
		} else {
			var value string
			if err := json.Unmarshal(*payload.LocationRegion, &value); err != nil {
				httputil.Error(w, http.StatusBadRequest, "locationRegion must be a string or null")
				return
			}
			value = strings.TrimSpace(value)
			if value == "" {
				params.LocationRegion = &sql.NullString{Valid: false}
			} else {
				params.LocationRegion = &sql.NullString{String: value, Valid: true}
			}
		}
	}
	if payload.LocationCountry != nil {
		updates++
		if *payload.LocationCountry == nil {
			params.LocationCountry = &sql.NullString{Valid: false}
		} else {
			var value string
			if err := json.Unmarshal(*payload.LocationCountry, &value); err != nil {
				httputil.Error(w, http.StatusBadRequest, "locationCountry must be a string or null")
				return
			}
			value = strings.TrimSpace(value)
			if value == "" {
				params.LocationCountry = &sql.NullString{Valid: false}
			} else {
				params.LocationCountry = &sql.NullString{String: value, Valid: true}
			}
		}
	}
	if payload.DeadlineAt != nil {
		updates++
		if *payload.DeadlineAt == nil {
			params.DeadlineAt = &sql.NullTime{Valid: false}
		} else {
			var value string
			if err := json.Unmarshal(*payload.DeadlineAt, &value); err != nil {
				httputil.Error(w, http.StatusBadRequest, "deadlineAt must be an RFC3339 string or null")
				return
			}
			value = strings.TrimSpace(value)
			if value == "" {
				params.DeadlineAt = &sql.NullTime{Valid: false}
			} else {
				ts, err := time.Parse(time.RFC3339, value)
				if err != nil {
					httputil.Error(w, http.StatusBadRequest, "deadlineAt must be an RFC3339 string")
					return
				}
				params.DeadlineAt = &sql.NullTime{Time: ts, Valid: true}
			}
		}
	}

	if updates == 0 {
		httputil.Error(w, http.StatusBadRequest, "no fields provided for update")
		return
	}

	updated, err := a.Store.UpdateRequest(r.Context(), params)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			httputil.Error(w, http.StatusNotFound, "request not found")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	httputil.JSON(w, http.StatusOK, updated)
}

func (a *API) handleDeleteRequest(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireAuth(w, r)
	if !ok {
		return
	}

	id, err := parseID(r, "requestID")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	req, err := a.Store.GetRequest(r.Context(), id)
	if err != nil {
		httputil.Error(w, http.StatusNotFound, "request not found")
		return
	}
	if req.BuyerID == nil || *req.BuyerID != user.ID {
		httputil.Error(w, http.StatusForbidden, "you do not have permission to delete this request")
		return
	}

	if err := a.Store.DeleteRequest(r.Context(), id, user.ID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			httputil.Error(w, http.StatusNotFound, "request not found")
			return
		}
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusNoContent)
}