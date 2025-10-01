package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"errors"
	"strings"
)

func HashPassword(password string) (string, error) {
	if password == "" {
		return "", errors.New("empty password")
	}
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	sum := sha256.Sum256(append(salt, []byte(password)...))
	return hex.EncodeToString(salt) + "$" + hex.EncodeToString(sum[:]), nil
}

func ComparePassword(hashed string, password string) bool {
	parts := strings.Split(hashed, "$")
	if len(parts) != 2 {
		return false
	}
	salt, err := hex.DecodeString(parts[0])
	if err != nil {
		return false
	}
	expected, err := hex.DecodeString(parts[1])
	if err != nil {
		return false
	}
	sum := sha256.Sum256(append(salt, []byte(password)...))
	return subtle.ConstantTimeCompare(sum[:], expected) == 1
}
