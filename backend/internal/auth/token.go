package auth

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"
	"time"
)

type TokenManager struct {
	secret []byte
	ttl    time.Duration
}

func NewTokenManager(secret string, ttl time.Duration) *TokenManager {
	if ttl <= 0 {
		ttl = 24 * time.Hour
	}
	return &TokenManager{secret: []byte(secret), ttl: ttl}
}

func (t *TokenManager) Issue(userID int64, email, name, role string) (string, error) {
	expires := time.Now().Add(t.ttl).Unix()
	nonce := make([]byte, 16)
	if _, err := rand.Read(nonce); err != nil {
		return "", err
	}

	payload := fmt.Sprintf("%d|%d|%s", userID, expires, base64.StdEncoding.EncodeToString(nonce))
	mac := hmac.New(sha256.New, t.secret)
	mac.Write([]byte(payload))
	signature := base64.StdEncoding.EncodeToString(mac.Sum(nil))

	token := fmt.Sprintf("%s|%s", payload, signature)
	return base64.StdEncoding.EncodeToString([]byte(token)), nil
}

func Parse(token string, secret string) (userID int64, expires time.Time, ok bool) {
	data, err := base64.StdEncoding.DecodeString(token)
	if err != nil {
		return 0, time.Time{}, false
	}
	parts := strings.Split(string(data), "|")
	if len(parts) != 4 {
		return 0, time.Time{}, false
	}

	payload := strings.Join(parts[:3], "|")
	sig := parts[3]

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	expected := base64.StdEncoding.EncodeToString(mac.Sum(nil))
	if !hmac.Equal([]byte(expected), []byte(sig)) {
		return 0, time.Time{}, false
	}

	id, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil {
		return 0, time.Time{}, false
	}
	exp, err := strconv.ParseInt(parts[1], 10, 64)
	if err != nil {
		return 0, time.Time{}, false
	}

	return id, time.Unix(exp, 0), true
}
