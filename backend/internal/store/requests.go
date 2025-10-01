package store

import (
	"context"
	"strings"

	"lotbuy-backend/internal/models"
)

type CreateRequestParams struct {
	Title        string
	Description  *string
	BudgetAmount float64
	CurrencyCode string
	BuyerName    string
	BuyerAvatar  *string
	BuyerRating  *float64
	ImageURL     *string
}

type ListRequestsParams struct {
	Status *string
}

func (s *Store) CreateRequest(ctx context.Context, params CreateRequestParams) (*models.Request, error) {
	query := `
        INSERT INTO requests (
            title, description, budget_amount, currency_code, buyer_name,
            buyer_avatar_url, buyer_rating, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, title, description, budget_amount, currency_code, buyer_name,
                  buyer_avatar_url, buyer_rating, image_url, status, created_at, updated_at
    `

	var req models.Request
	if err := s.db.QueryRowxContext(ctx, query,
		params.Title,
		params.Description,
		params.BudgetAmount,
		strings.ToUpper(params.CurrencyCode),
		params.BuyerName,
		params.BuyerAvatar,
		params.BuyerRating,
		params.ImageURL,
	).StructScan(&req); err != nil {
		return nil, err
	}

	return &req, nil
}

func (s *Store) ListRequests(ctx context.Context, params ListRequestsParams) ([]models.Request, error) {
	base := `SELECT id, title, description, budget_amount, currency_code, buyer_name,
                    buyer_avatar_url, buyer_rating, image_url, status, created_at, updated_at
             FROM requests`
	var args []interface{}
	if params.Status != nil {
		base += " WHERE status = $1"
		args = append(args, *params.Status)
	}
	base += " ORDER BY created_at DESC"

	rows, err := s.db.QueryxContext(ctx, base, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	requests := []models.Request{}
	for rows.Next() {
		var r models.Request
		if err := rows.StructScan(&r); err != nil {
			return nil, err
		}
		requests = append(requests, r)
	}

	return requests, rows.Err()
}

func (s *Store) GetRequest(ctx context.Context, id int64) (*models.Request, error) {
	query := `SELECT id, title, description, budget_amount, currency_code, buyer_name,
                     buyer_avatar_url, buyer_rating, image_url, status, created_at, updated_at
              FROM requests WHERE id = $1`

	var req models.Request
	if err := s.db.QueryRowxContext(ctx, query, id).StructScan(&req); err != nil {
		return nil, err
	}
	return &req, nil
}

func (s *Store) UpdateRequestStatus(ctx context.Context, id int64, status string) error {
	_, err := s.db.ExecContext(ctx, `UPDATE requests SET status = $1, updated_at = NOW() WHERE id = $2`, status, id)
	return err
}
