package store

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"lotbuy-backend/internal/models"
)

type CreateUserParams struct {
	Email        string
	FullName     string
	PasswordHash string
	Role         string
	AvatarURL    *string
}

type UpdateUserAvatarParams struct {
	UserID    int64
	AvatarURL *string
}

func (s *Store) CreateUser(ctx context.Context, params CreateUserParams) (*models.User, error) {
	query := `
        INSERT INTO users (email, full_name, password_hash, role, avatar_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, full_name, password_hash, role, avatar_url, created_at, updated_at
    `

	var user models.User
	if err := s.db.QueryRowxContext(ctx, query,
		strings.ToLower(params.Email),
		params.FullName,
		params.PasswordHash,
		params.Role,
		params.AvatarURL,
	).StructScan(&user); err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *Store) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `SELECT id, email, full_name, password_hash, role, avatar_url, created_at, updated_at FROM users WHERE email = $1`

	var user models.User
	if err := s.db.GetContext(ctx, &user, query, strings.ToLower(email)); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (s *Store) UpdateUserAvatar(ctx context.Context, params UpdateUserAvatarParams) error {
	_, err := s.db.ExecContext(ctx,
		`UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2`,
		params.AvatarURL,
		params.UserID,
	)
	return err
}
