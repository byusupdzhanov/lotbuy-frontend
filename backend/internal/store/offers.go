package store

import (
	"context"
	"strings"

	"lotbuy-backend/internal/models"
)

type CreateOfferParams struct {
	RequestID    int64
	SellerName   string
	SellerAvatar *string
	SellerRating *float64
	PriceAmount  float64
	CurrencyCode string
	Message      *string
}

func (s *Store) CreateOffer(ctx context.Context, params CreateOfferParams) (*models.Offer, error) {
	query := `
        INSERT INTO offers (
            request_id, seller_name, seller_avatar_url, seller_rating,
            price_amount, currency_code, message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, request_id, seller_name, seller_avatar_url, seller_rating,
                  price_amount, currency_code, message, status, created_at, updated_at
    `

	var offer models.Offer
	if err := s.db.QueryRowxContext(ctx, query,
		params.RequestID,
		params.SellerName,
		params.SellerAvatar,
		params.SellerRating,
		params.PriceAmount,
		strings.ToUpper(params.CurrencyCode),
		params.Message,
	).StructScan(&offer); err != nil {
		return nil, err
	}

	return &offer, nil
}

func (s *Store) GetOffer(ctx context.Context, id int64) (*models.Offer, error) {
	query := `SELECT id, request_id, seller_name, seller_avatar_url, seller_rating,
                     price_amount, currency_code, message, status, created_at, updated_at
              FROM offers WHERE id = $1`

	var offer models.Offer
	if err := s.db.QueryRowxContext(ctx, query, id).StructScan(&offer); err != nil {
		return nil, err
	}
	return &offer, nil
}

func (s *Store) ListOffersByRequest(ctx context.Context, requestID int64) ([]models.Offer, error) {
	query := `SELECT id, request_id, seller_name, seller_avatar_url, seller_rating,
                     price_amount, currency_code, message, status, created_at, updated_at
              FROM offers WHERE request_id = $1 ORDER BY created_at DESC`

	rows, err := s.db.QueryxContext(ctx, query, requestID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var offers []models.Offer
	for rows.Next() {
		var o models.Offer
		if err := rows.StructScan(&o); err != nil {
			return nil, err
		}
		offers = append(offers, o)
	}
	return offers, rows.Err()
}

func (s *Store) UpdateOfferStatus(ctx context.Context, id int64, status string) error {
	_, err := s.db.ExecContext(ctx, `UPDATE offers SET status = $1, updated_at = NOW() WHERE id = $2`, status, id)
	return err
}
