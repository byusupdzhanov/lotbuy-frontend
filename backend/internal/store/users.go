package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
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
        RETURNING id, email, full_name, password_hash, role, avatar_url,
                  completed_deals, rating_total, rating_count, created_at, updated_at
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
        query := `SELECT id, email, full_name, password_hash, role, avatar_url,
                     completed_deals, rating_total, rating_count, created_at, updated_at
              FROM users WHERE email = $1`

	var user models.User
	if err := s.db.GetContext(ctx, &user, query, strings.ToLower(email)); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (s *Store) GetUserByID(ctx context.Context, id int64) (*models.User, error) {
        query := `SELECT id, email, full_name, password_hash, role, avatar_url,
                     completed_deals, rating_total, rating_count, created_at, updated_at
              FROM users WHERE id = $1`

	var user models.User
	if err := s.db.GetContext(ctx, &user, query, id); err != nil {
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

type UpdateUserProfileParams struct {
	UserID    int64
	FullName  *string
	AvatarURL *string
}

func (s *Store) UpdateUserProfile(ctx context.Context, params UpdateUserProfileParams) (*models.User, error) {
	updates := make([]string, 0, 2)
	args := make([]interface{}, 0, 3)
	idx := 1

	if params.FullName != nil {
		updates = append(updates, fmt.Sprintf("full_name = $%d", idx))
		args = append(args, *params.FullName)
		idx++
	}
	if params.AvatarURL != nil {
		updates = append(updates, fmt.Sprintf("avatar_url = $%d", idx))
		args = append(args, params.AvatarURL)
		idx++
	}

	if len(updates) == 0 {
		return s.GetUserByID(ctx, params.UserID)
	}

	updates = append(updates, "updated_at = NOW()")
	args = append(args, params.UserID)
        query := fmt.Sprintf(`UPDATE users SET %s WHERE id = $%d RETURNING id, email, full_name, password_hash, role, avatar_url,
                  completed_deals, rating_total, rating_count, created_at, updated_at`,
		strings.Join(updates, ", "), idx)

	var user models.User
	if err := s.db.QueryRowxContext(ctx, query, args...).StructScan(&user); err != nil {
		return nil, err
	}
	return &user, nil
}
