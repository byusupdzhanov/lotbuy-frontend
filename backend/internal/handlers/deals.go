package handlers

import (
	"io"
	"net/http"

	"lotbuy-backend/internal/httputil"
)

type updateDealPayload struct {
	Status string `json:"status"`
}

type completeMilestonePayload struct {
	Completed bool `json:"completed"`
}

func (a *API) handleListDeals(w http.ResponseWriter, r *http.Request) {
	deals, err := a.Store.ListDeals(r.Context())
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.JSON(w, http.StatusOK, deals)
}

func (a *API) handleGetDeal(w http.ResponseWriter, r *http.Request) {
	dealID, err := parseID(r, "dealID")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	deal, err := a.Store.GetDealDetails(r.Context(), dealID)
	if err != nil {
		httputil.Error(w, http.StatusNotFound, err.Error())
		return
	}
	httputil.JSON(w, http.StatusOK, deal)
}

func (a *API) handleUpdateDeal(w http.ResponseWriter, r *http.Request) {
	dealID, err := parseID(r, "dealID")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	var payload updateDealPayload
	if err := decodeJSON(r, &payload); err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	if payload.Status == "" {
		httputil.Error(w, http.StatusBadRequest, "status is required")
		return
	}

	if err := a.Store.UpdateDealStatus(r.Context(), dealID, payload.Status); err != nil {
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	deal, err := a.Store.GetDealDetails(r.Context(), dealID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	httputil.JSON(w, http.StatusOK, deal)
}

func (a *API) handleCompleteMilestone(w http.ResponseWriter, r *http.Request) {
	milestoneID, err := parseID(r, "milestoneID")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	payload := completeMilestonePayload{Completed: true}
	if err := decodeJSON(r, &payload); err != nil {
		if err != io.EOF {
			httputil.Error(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	if err := a.Store.SetMilestoneCompleted(r.Context(), milestoneID, payload.Completed); err != nil {
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	dealID, err := parseID(r, "dealID")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	deal, err := a.Store.GetDealDetails(r.Context(), dealID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	httputil.JSON(w, http.StatusOK, deal)
}
