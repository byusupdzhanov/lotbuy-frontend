package handlers

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"lotbuy-backend/internal/auth"
	"lotbuy-backend/internal/httputil"
	"lotbuy-backend/internal/models"
	"lotbuy-backend/internal/server"
	"lotbuy-backend/internal/store"
)

type API struct {
	Store  *store.Store
	Tokens *auth.TokenManager
}

func NewAPI(s *store.Store, tokens *auth.TokenManager) *API {
	return &API{Store: s, Tokens: tokens}
}

func (a *API) RegisterRoutes(r *server.Router) {
	r.Handle(http.MethodGet, "/api/health", a.handleHealth)

	r.Handle(http.MethodPost, "/api/auth/register", a.handleRegister)
	r.Handle(http.MethodPost, "/api/auth/login", a.handleLogin)
	r.Handle(http.MethodPost, "/api/auth/logout", a.handleLogout)

	r.Handle(http.MethodGet, "/api/me", a.handleGetMe)
	r.Handle(http.MethodPatch, "/api/me", a.handleUpdateMe)

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

	r.Handle(http.MethodPost, "/api/uploads", a.handleUpload)
}

func (a *API) requireAuth(w http.ResponseWriter, r *http.Request) (*models.User, bool) {
	if a.Tokens == nil {
		httputil.Error(w, http.StatusUnauthorized, "authentication disabled")
		return nil, false
	}
	header := r.Header.Get("Authorization")
	if header == "" {
		httputil.Error(w, http.StatusUnauthorized, "authorization header required")
		return nil, false
	}

	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		httputil.Error(w, http.StatusUnauthorized, "invalid authorization header")
		return nil, false
	}

	userID, expires, ok := a.Tokens.Parse(strings.TrimSpace(parts[1]))
	if !ok {
		httputil.Error(w, http.StatusUnauthorized, "invalid token")
		return nil, false
	}
	if time.Now().After(expires) {
		httputil.Error(w, http.StatusUnauthorized, "token expired")
		return nil, false
	}

	user, err := a.Store.GetUserByID(r.Context(), userID)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to load user")
		return nil, false
	}
	if user == nil {
		httputil.Error(w, http.StatusUnauthorized, "user not found")
		return nil, false
	}
	return user, true
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

type registerRequest struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Role      string `json:"userType"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	Token string            `json:"token"`
	User  models.PublicUser `json:"user"`
}

func (a *API) handleHealth(w http.ResponseWriter, r *http.Request) {
	httputil.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a *API) handleRegister(w http.ResponseWriter, r *http.Request) {
	if a.Tokens == nil {
		httputil.Error(w, http.StatusInternalServerError, "auth not configured")
		return
	}

	var payload registerRequest
	if err := decodeJSON(r, &payload); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	first := strings.TrimSpace(payload.FirstName)
	last := strings.TrimSpace(payload.LastName)
	email := strings.ToLower(strings.TrimSpace(payload.Email))
	password := strings.TrimSpace(payload.Password)

	if first == "" {
		httputil.Error(w, http.StatusBadRequest, "first name is required")
		return
	}
	if last == "" {
		httputil.Error(w, http.StatusBadRequest, "last name is required")
		return
	}
	if email == "" {
		httputil.Error(w, http.StatusBadRequest, "email is required")
		return
	}
	if password == "" {
		httputil.Error(w, http.StatusBadRequest, "password is required")
		return
	}
	if len(password) < 8 {
		httputil.Error(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}

	role := strings.ToLower(strings.TrimSpace(payload.Role))
	if role != "seller" {
		role = "buyer"
	}

	ctx := r.Context()
	existing, err := a.Store.GetUserByEmail(ctx, email)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to check existing users")
		return
	}
	if existing != nil {
		httputil.Error(w, http.StatusConflict, "user with this email already exists")
		return
	}

	hash, err := auth.HashPassword(password)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to secure password")
		return
	}

	fullName := strings.TrimSpace(first + " " + last)
	user, err := a.Store.CreateUser(ctx, store.CreateUserParams{
		Email:        email,
		FullName:     fullName,
		PasswordHash: hash,
		Role:         role,
	})
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to create user")
		return
	}

	token, err := a.Tokens.Issue(user.ID, user.Email, user.FullName, user.Role)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to issue token")
		return
	}

	httputil.JSON(w, http.StatusCreated, authResponse{
		Token: token,
		User:  user.Public(),
	})
}

func (a *API) handleLogin(w http.ResponseWriter, r *http.Request) {
	if a.Tokens == nil {
		httputil.Error(w, http.StatusInternalServerError, "auth not configured")
		return
	}

	var payload loginRequest
	if err := decodeJSON(r, &payload); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	email := strings.ToLower(strings.TrimSpace(payload.Email))
	password := strings.TrimSpace(payload.Password)
	if email == "" || password == "" {
		httputil.Error(w, http.StatusBadRequest, "email and password are required")
		return
	}

	ctx := r.Context()
	user, err := a.Store.GetUserByEmail(ctx, email)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to load user")
		return
	}
	if user == nil {
		httputil.Error(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	if !auth.ComparePassword(user.PasswordHash, password) {
		httputil.Error(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	token, err := a.Tokens.Issue(user.ID, user.Email, user.FullName, user.Role)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to issue token")
		return
	}

	httputil.JSON(w, http.StatusOK, authResponse{
		Token: token,
		User:  user.Public(),
	})
}

func (a *API) handleLogout(w http.ResponseWriter, r *http.Request) {
	// Stateless tokens do not require explicit revocation for now.
	w.WriteHeader(http.StatusNoContent)
}

func (a *API) handleGetMe(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireAuth(w, r)
	if !ok {
		return
	}
	httputil.JSON(w, http.StatusOK, user.Public())
}

type updateMePayload struct {
	FullName  *string `json:"fullName"`
	AvatarURL *string `json:"avatarUrl"`
}

func (a *API) handleUpdateMe(w http.ResponseWriter, r *http.Request) {
	user, ok := a.requireAuth(w, r)
	if !ok {
		return
	}

	var payload updateMePayload
	if err := decodeJSON(r, &payload); err != nil {
		httputil.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	params := store.UpdateUserProfileParams{UserID: user.ID}
	if payload.FullName != nil {
		trimmed := strings.TrimSpace(*payload.FullName)
		if trimmed == "" {
			httputil.Error(w, http.StatusBadRequest, "fullName cannot be empty")
			return
		}
		params.FullName = &trimmed
	}
	if payload.AvatarURL != nil {
		trimmed := strings.TrimSpace(*payload.AvatarURL)
		if trimmed == "" {
			params.AvatarURL = nil
		} else {
			params.AvatarURL = &trimmed
		}
	}

	updated, err := a.Store.UpdateUserProfile(r.Context(), params)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to update profile")
		return
	}

	httputil.JSON(w, http.StatusOK, updated.Public())
}

func (a *API) handleUpload(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		httputil.Error(w, http.StatusBadRequest, "failed to parse upload")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		httputil.Error(w, http.StatusBadRequest, "file is required")
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		httputil.Error(w, http.StatusInternalServerError, "failed to read file")
		return
	}
	if len(data) == 0 {
		httputil.Error(w, http.StatusBadRequest, "file is empty")
		return
	}

	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = http.DetectContentType(data)
	}
	encoded := base64.StdEncoding.EncodeToString(data)
	url := "data:" + contentType + ";base64," + encoded

	httputil.JSON(w, http.StatusCreated, map[string]string{"url": url})
}
