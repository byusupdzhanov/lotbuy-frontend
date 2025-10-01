package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"lotbuy-backend/internal/httputil"
	"lotbuy-backend/internal/server"
	"lotbuy-backend/internal/store"
)

type API struct {
	Store *store.Store
}

func NewAPI(s *store.Store) *API {
	return &API{Store: s}
}

func (a *API) RegisterRoutes(r *server.Router) {
	r.Handle(http.MethodGet, "/api/health", a.handleHealth)

	r.Handle(http.MethodGet, "/api/requests", a.handleListRequests)
	r.Handle(http.MethodPost, "/api/requests", a.handleCreateRequest)
	r.Handle(http.MethodGet, "/api/requests/:requestID", a.handleGetRequest)
	r.Handle(http.MethodGet, "/api/requests/:requestID/offers", a.handleListOffers)
	r.Handle(http.MethodPost, "/api/requests/:requestID/offers", a.handleCreateOffer)

	r.Handle(http.MethodPost, "/api/offers/:offerID/accept", a.handleAcceptOffer)

	r.Handle(http.MethodGet, "/api/deals", a.handleListDeals)
	r.Handle(http.MethodGet, "/api/deals/:dealID", a.handleGetDeal)
	r.Handle(http.MethodPatch, "/api/deals/:dealID", a.handleUpdateDeal)
	r.Handle(http.MethodPost, "/api/deals/:dealID/milestones/:milestoneID/complete", a.handleCompleteMilestone)
}

func parseID(r *http.Request, key string) (int64, error) {
	idStr := server.Param(r, key)
	if idStr == "" {
		return 0, errors.New("missing id")
	}
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func decodeJSON(r *http.Request, dest interface{}) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(dest)
}

func (a *API) handleHealth(w http.ResponseWriter, r *http.Request) {
	httputil.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
