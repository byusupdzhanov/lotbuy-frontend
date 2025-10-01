package handlers

import (
        "errors"
        "net/http"
        "strings"

        "lotbuy-backend/internal/httputil"
        "lotbuy-backend/internal/models"
        "lotbuy-backend/internal/store"
)

type updateDealPayload struct {
        Action  string `json:"action"`
        Reason  string `json:"reason"`
        Rating  *int   `json:"rating"`
        Comment string `json:"comment"`
}

func (a *API) handleListDeals(w http.ResponseWriter, r *http.Request) {
        user, ok := a.requireAuth(w, r)
        if !ok {
                return
        }
        deals, err := a.Store.ListDealsForUser(r.Context(), user.ID)
        if err != nil {
                httputil.Error(w, http.StatusInternalServerError, err.Error())
                return
        }
        httputil.JSON(w, http.StatusOK, deals)
}

func (a *API) handleGetDeal(w http.ResponseWriter, r *http.Request) {
        user, ok := a.requireAuth(w, r)
        if !ok {
                return
        }
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
        if !a.canAccessDeal(deal, user.ID) {
                httputil.Error(w, http.StatusForbidden, "not allowed to view this deal")
                return
        }
        httputil.JSON(w, http.StatusOK, deal)
}

func (a *API) handleUpdateDeal(w http.ResponseWriter, r *http.Request) {
        user, ok := a.requireAuth(w, r)
        if !ok {
                return
        }
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

        var detail *models.DealDetails
        switch payload.Action {
        case "mark_shipped":
                detail, err = a.Store.MarkDealShipped(r.Context(), dealID, user.ID)
        case "submit_payment":
                detail, err = a.Store.SubmitDealPayment(r.Context(), dealID, user.ID)
        case "confirm_delivery":
                detail, err = a.Store.ConfirmDealCompletion(r.Context(), dealID, user.ID)
        case "open_dispute":
                if payload.Reason == "" {
                        payload.Reason = "Deal dispute opened"
                }
                detail, err = a.Store.OpenDealDispute(r.Context(), dealID, user.ID, payload.Reason)
        case "rate_counterparty":
                if payload.Rating == nil {
                        httputil.Error(w, http.StatusBadRequest, "rating is required")
                        return
                }
                comment := strings.TrimSpace(payload.Comment)
                var commentPtr *string
                if comment != "" {
                        commentPtr = &comment
                }
                detail, err = a.Store.AddDealFeedback(r.Context(), store.DealFeedbackParams{
                        DealID:     dealID,
                        ReviewerID: user.ID,
                        Rating:     *payload.Rating,
                        Comment:    commentPtr,
                })
        default:
                httputil.Error(w, http.StatusBadRequest, "unsupported action")
                return
        }

        if err != nil {
                status := http.StatusInternalServerError
                if errors.Is(err, store.ErrDealUnauthorized) {
                        status = http.StatusForbidden
                } else if errors.Is(err, store.ErrMilestoneDone) {
                        status = http.StatusConflict
                }
                httputil.Error(w, status, err.Error())
                return
        }
        httputil.JSON(w, http.StatusOK, detail)
}

func (a *API) handleCompleteMilestone(w http.ResponseWriter, r *http.Request) {
        httputil.Error(w, http.StatusGone, "milestone endpoint is deprecated")
}

func (a *API) canAccessDeal(detail *models.DealDetails, userID int64) bool {
        if detail == nil {
                return false
        }
        if detail.BuyerUserID != nil && *detail.BuyerUserID == userID {
                return true
        }
        if detail.SellerUserID != nil && *detail.SellerUserID == userID {
                return true
        }
        return false
}
