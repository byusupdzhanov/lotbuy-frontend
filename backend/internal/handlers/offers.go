package handlers

import (
	"errors"
	"net/http"

	"lotbuy-backend/internal/httputil"
	"lotbuy-backend/internal/store"
)

type createOfferPayload struct {
	PriceAmount  float64 `json:"priceAmount"`
	CurrencyCode string  `json:"currencyCode"`
	Message      *string `json:"message"`
}

func (p createOfferPayload) validate() error {
	if p.CurrencyCode == "" {
		return errors.New("currencyCode is required")
	}
	if p.PriceAmount <= 0 {
		return errors.New("priceAmount must be greater than zero")
	}
	return nil
}

func (a *API) handleCreateOffer(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireAuth(w, r)
	if !ok {
		return
	}

	requestID, err := parseID(r, "requestID")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	var payload createOfferPayload
	if err := decodeJSON(r, &payload); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := payload.validate(); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	sellerName := user.FullName
	if sellerName == "" {
		sellerName = user.Email
	}

	offer, err := a.Store.CreateOffer(r.Context(), store.CreateOfferParams{
		RequestID:    requestID,
		SellerName:   sellerName,
		SellerAvatar: user.AvatarURL,
		SellerRating: nil,
		PriceAmount:  payload.PriceAmount,
		CurrencyCode: payload.CurrencyCode,
		Message:      payload.Message,
	})
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	httputil.JSON(w, http.StatusCreated, offer)
}

func (a *API) handleListOffers(w http.ResponseWriter, r *http.Request) {
	requestID, err := parseID(r, "requestID")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	offers, err := a.Store.ListOffersByRequest(r.Context(), requestID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	httputil.JSON(w, http.StatusOK, offers)
}

func (a *API) handleAcceptOffer(w http.ResponseWriter, r *http.Request) {
	offerID, err := parseID(r, "offerID")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	deal, err := a.Store.CreateDealFromOffer(r.Context(), offerID)
	if err != nil {
		status := http.StatusInternalServerError
		switch err {
		case store.ErrOfferUnavailable:
			status = http.StatusConflict
		case store.ErrRequestClosed:
			status = http.StatusConflict
		}
		httputil.Error(w, status, err.Error())
		return
	}

	httputil.JSON(w, http.StatusCreated, deal)
}
