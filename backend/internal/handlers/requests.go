package handlers

import (
	"errors"
	"net/http"

	"lotbuy-backend/internal/httputil"
	"lotbuy-backend/internal/store"
)

type createRequestPayload struct {
	Title        string   `json:"title"`
	Description  *string  `json:"description"`
	BudgetAmount float64  `json:"budgetAmount"`
	CurrencyCode string   `json:"currencyCode"`
	BuyerName    string   `json:"buyerName"`
	BuyerAvatar  *string  `json:"buyerAvatarUrl"`
	BuyerRating  *float64 `json:"buyerRating"`
	ImageURL     *string  `json:"imageUrl"`
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
	if p.BuyerName == "" {
		return errors.New("buyerName is required")
	}
	return nil
}

func (a *API) handleCreateRequest(w http.ResponseWriter, r *http.Request) {
	var payload createRequestPayload
	if err := decodeJSON(r, &payload); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := payload.validate(); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	req, err := a.Store.CreateRequest(r.Context(), store.CreateRequestParams{
		Title:        payload.Title,
		Description:  payload.Description,
		BudgetAmount: payload.BudgetAmount,
		CurrencyCode: payload.CurrencyCode,
		BuyerName:    payload.BuyerName,
		BuyerAvatar:  payload.BuyerAvatar,
		BuyerRating:  payload.BuyerRating,
		ImageURL:     payload.ImageURL,
	})
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	httputil.JSON(w, http.StatusCreated, req)
}

func (a *API) handleListRequests(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	var params store.ListRequestsParams
	if status != "" {
		params.Status = &status
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
