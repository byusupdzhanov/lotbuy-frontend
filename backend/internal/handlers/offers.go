package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"lotbuy-backend/internal/httputil"
	"lotbuy-backend/internal/models"
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

	req, err := a.Store.GetRequest(r.Context(), requestID)
	if err != nil {
		httputil.Error(w, http.StatusNotFound, "request not found")
		return
	}
	if req.BuyerID != nil && *req.BuyerID == user.ID {
		httputil.Error(w, http.StatusForbidden, "request owners cannot create offers on their own lot")
		return
	}
	sellerName := user.FullName
	if sellerName == "" {
		sellerName = user.Email
	}

	offer, err := a.Store.CreateOffer(r.Context(), store.CreateOfferParams{
		RequestID:    requestID,
		SellerID:     user.ID,
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

	if req.BuyerID != nil {
		title := "New offer on " + req.Title
		body := sellerName + " submitted an offer."
		meta, _ := json.Marshal(map[string]interface{}{
			"offerId":   offer.ID,
			"requestId": requestID,
		})
		_, _ = a.Store.CreateNotification(r.Context(), store.CreateNotificationParams{
			UserID:   *req.BuyerID,
			Type:     "offer.received",
			Title:    title,
			Body:     &body,
			Metadata: meta,
		})
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

type messagePayload struct {
	Body          *string `json:"body"`
	AttachmentURL *string `json:"attachmentUrl"`
}

func (a *API) ensureOfferAccess(w http.ResponseWriter, r *http.Request, offerID int64, userID int64) (*models.Offer, *models.Request, bool) {
	offer, err := a.Store.GetOffer(r.Context(), offerID)
	if err != nil {
		httputil.Error(w, http.StatusNotFound, "offer not found")
		return nil, nil, false
	}
	req, err := a.Store.GetRequest(r.Context(), offer.RequestID)
	if err != nil {
		httputil.Error(w, http.StatusNotFound, "request not found")
		return nil, nil, false
	}
	sellerMatch := offer.SellerID != nil && *offer.SellerID == userID
	buyerMatch := req.BuyerID != nil && *req.BuyerID == userID
	if !sellerMatch && !buyerMatch {
		httputil.Error(w, http.StatusForbidden, "access denied")
		return nil, nil, false
	}
	return offer, req, true
}

func (a *API) handleListOfferMessages(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireAuth(w, r)
	if !ok {
		return
	}

	offerID, err := parseID(r, "offerID")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if _, _, allowed := a.ensureOfferAccess(w, r, offerID, user.ID); !allowed {
		return
	}

	messages, err := a.Store.ListOfferMessages(r.Context(), offerID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	httputil.JSON(w, http.StatusOK, messages)
}

func (a *API) handleCreateOfferMessage(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireAuth(w, r)
	if !ok {
		return
	}

	offerID, err := parseID(r, "offerID")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	offer, req, allowed := a.ensureOfferAccess(w, r, offerID, user.ID)
	if !allowed {
		return
	}

	var payload messagePayload
	if err := decodeJSON(r, &payload); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if (payload.Body == nil || strings.TrimSpace(*payload.Body) == "") && (payload.AttachmentURL == nil || strings.TrimSpace(*payload.AttachmentURL) == "") {
		httputil.Error(w, http.StatusBadRequest, "body or attachment is required")
		return
	}

	var trimmedBody *string
	if payload.Body != nil {
		trimmed := strings.TrimSpace(*payload.Body)
		if trimmed != "" {
			trimmedBody = &trimmed
		}
	}
	var attachment *string
	if payload.AttachmentURL != nil {
		trimmed := strings.TrimSpace(*payload.AttachmentURL)
		if trimmed != "" {
			attachment = &trimmed
		}
	}

	msg, err := a.Store.CreateOfferMessage(r.Context(), store.CreateOfferMessageParams{
		OfferID:       offerID,
		SenderUserID:  user.ID,
		Body:          trimmedBody,
		AttachmentURL: attachment,
	})
	if err != nil {
		if errors.Is(err, store.ErrMessageNotAllowed) {
			httputil.Error(w, http.StatusForbidden, err.Error())
			return
		}
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	var recipientID *int64
	if offer.SellerID != nil && *offer.SellerID != user.ID {
		recipientID = offer.SellerID
	} else if req.BuyerID != nil && *req.BuyerID != user.ID {
		recipientID = req.BuyerID
	}
	if recipientID != nil {
		body := user.FullName + " sent you a message"
		meta, _ := json.Marshal(map[string]interface{}{
			"offerId":   offerID,
			"requestId": offer.RequestID,
		})
		_, _ = a.Store.CreateNotification(r.Context(), store.CreateNotificationParams{
			UserID:   *recipientID,
			Type:     "message.new",
			Title:    "New message",
			Body:     &body,
			Metadata: meta,
		})
	}

	httputil.JSON(w, http.StatusCreated, msg)
}
