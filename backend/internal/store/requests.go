package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"lotbuy-backend/internal/models"
)

type CreateRequestParams struct {
	Title           string
	Description     *string
	BudgetAmount    float64
	CurrencyCode    string
	BuyerID         int64
	BuyerName       string
	BuyerAvatar     *string
	BuyerRating     *float64
	ImageURL        *string
	Category        *string
	Subcategory     *string
	LocationCity    *string
	LocationRegion  *string
	LocationCountry *string
	DeadlineAt      *time.Time
}

type ListRequestsParams struct {
	Status   *string
	BuyerID  *int64
	Limit    *int
	OnlyOpen bool
}

type UpdateRequestParams struct {
	ID              int64
	BuyerID         int64
	Title           *string
	Description     *sql.NullString
	BudgetAmount    *float64
	CurrencyCode    *string
	ImageURL        *sql.NullString
	Category        *sql.NullString
	Subcategory     *sql.NullString
	LocationCity    *sql.NullString
	LocationRegion  *sql.NullString
	LocationCountry *sql.NullString
	DeadlineAt      *sql.NullTime
}

func (s *Store) CreateRequest(ctx context.Context, params CreateRequestParams) (*models.Request, error) {
	query := `
        INSERT INTO requests (
            title, description, budget_amount, currency_code, buyer_user_id, buyer_name,
            buyer_avatar_url, buyer_rating, image_url, category, subcategory,
            location_city, location_region, location_country, deadline_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id, title, description, budget_amount, currency_code, buyer_user_id, buyer_name,
                  buyer_avatar_url, buyer_rating, image_url, category, subcategory,
                  location_city, location_region, location_country, deadline_at,
                  status, created_at, updated_at
    `

	var req models.Request
	if err := s.db.QueryRowxContext(ctx, query,
		params.Title,
		params.Description,
		params.BudgetAmount,
		strings.ToUpper(params.CurrencyCode),
		params.BuyerID,
		params.BuyerName,
		params.BuyerAvatar,
		params.BuyerRating,
		params.ImageURL,
		params.Category,
		params.Subcategory,
		params.LocationCity,
		params.LocationRegion,
		params.LocationCountry,
		params.DeadlineAt,
	).StructScan(&req); err != nil {
		return nil, err
	}

	return &req, nil
}

func (s *Store) ListRequests(ctx context.Context, params ListRequestsParams) ([]models.Request, error) {
	base := `SELECT id, title, description, budget_amount, currency_code, buyer_user_id, buyer_name,
                    buyer_avatar_url, buyer_rating, image_url, category, subcategory,
                    location_city, location_region, location_country, deadline_at,
                    status, created_at, updated_at
             FROM requests`
	var clauses []string
	var args []interface{}
	idx := 1
	if params.Status != nil {
		clauses = append(clauses, "status = $"+strconv.Itoa(idx))
		args = append(args, *params.Status)
		idx++
	}
	if params.OnlyOpen {
		clauses = append(clauses, "status = 'open'")
	}
	if params.BuyerID != nil {
		clauses = append(clauses, "buyer_user_id = $"+strconv.Itoa(idx))
		args = append(args, *params.BuyerID)
		idx++
	}
	if len(clauses) > 0 {
		base += " WHERE " + strings.Join(clauses, " AND ")
	}
	base += " ORDER BY created_at DESC"
	if params.Limit != nil && *params.Limit > 0 {
		base += " LIMIT $" + strconv.Itoa(idx)
		args = append(args, *params.Limit)
	}

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
	query := `SELECT id, title, description, budget_amount, currency_code, buyer_user_id, buyer_name,
                     buyer_avatar_url, buyer_rating, image_url, category, subcategory,
                     location_city, location_region, location_country, deadline_at,
                     status, created_at, updated_at
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

func (s *Store) UpdateRequest(ctx context.Context, params UpdateRequestParams) (*models.Request, error) {
	setClauses := make([]string, 0, 12)
	args := make([]interface{}, 0, 14)
	idx := 1

	if params.Title != nil {
		setClauses = append(setClauses, fmt.Sprintf("title = $%d", idx))
		args = append(args, *params.Title)
		idx++
	}
	if params.Description != nil {
		setClauses = append(setClauses, fmt.Sprintf("description = $%d", idx))
		args = append(args, params.Description)
		idx++
	}
	if params.BudgetAmount != nil {
		setClauses = append(setClauses, fmt.Sprintf("budget_amount = $%d", idx))
		args = append(args, *params.BudgetAmount)
		idx++
	}
	if params.CurrencyCode != nil {
		setClauses = append(setClauses, fmt.Sprintf("currency_code = $%d", idx))
		args = append(args, strings.ToUpper(*params.CurrencyCode))
		idx++
	}
	if params.ImageURL != nil {
		setClauses = append(setClauses, fmt.Sprintf("image_url = $%d", idx))
		args = append(args, params.ImageURL)
		idx++
	}
	if params.Category != nil {
		setClauses = append(setClauses, fmt.Sprintf("category = $%d", idx))
		args = append(args, params.Category)
		idx++
	}
	if params.Subcategory != nil {
		setClauses = append(setClauses, fmt.Sprintf("subcategory = $%d", idx))
		args = append(args, params.Subcategory)
		idx++
	}
	if params.LocationCity != nil {
		setClauses = append(setClauses, fmt.Sprintf("location_city = $%d", idx))
		args = append(args, params.LocationCity)
		idx++
	}
	if params.LocationRegion != nil {
		setClauses = append(setClauses, fmt.Sprintf("location_region = $%d", idx))
		args = append(args, params.LocationRegion)
		idx++
	}
	if params.LocationCountry != nil {
		setClauses = append(setClauses, fmt.Sprintf("location_country = $%d", idx))
		args = append(args, params.LocationCountry)
		idx++
	}
	if params.DeadlineAt != nil {
		setClauses = append(setClauses, fmt.Sprintf("deadline_at = $%d", idx))
		args = append(args, params.DeadlineAt)
		idx++
	}

	if len(setClauses) == 0 {
		return nil, errors.New("no fields to update")
	}

	setClauses = append(setClauses, "updated_at = NOW()")

	args = append(args, params.ID, params.BuyerID)

	query := fmt.Sprintf(`UPDATE requests SET %s WHERE id = $%d AND buyer_user_id = $%d
                RETURNING id, title, description, budget_amount, currency_code, buyer_user_id, buyer_name,
                          buyer_avatar_url, buyer_rating, image_url, category, subcategory,
                          location_city, location_region, location_country, deadline_at,
                          status, created_at, updated_at`,
		strings.Join(setClauses, ", "), idx, idx+1)

	var req models.Request
	if err := s.db.QueryRowxContext(ctx, query, args...).StructScan(&req); err != nil {
		return nil, err
	}

	return &req, nil
}

func (s *Store) DeleteRequest(ctx context.Context, id, buyerID int64) error {
	res, err := s.db.ExecContext(ctx, `DELETE FROM requests WHERE id = $1 AND buyer_user_id = $2`, id, buyerID)
	if err != nil {
		return err
	}
	if rows, err := res.RowsAffected(); err == nil && rows == 0 {
		return sql.ErrNoRows
	}
	return err
}
