package store

import (
	"context"
	"database/sql"
	"errors"

	"lotbuy-backend/internal/models"
)

var ErrMessageNotAllowed = errors.New("user is not allowed to post in this conversation")

type CreateOfferMessageParams struct {
	OfferID       int64
	SenderUserID  int64
	Body          *string
	AttachmentURL *string
}

func (s *Store) getOfferParticipants(ctx context.Context, offerID int64) (buyerID *int64, sellerID *int64, err error) {
	query := `
        SELECT r.buyer_user_id, o.seller_user_id
        FROM offers o
        INNER JOIN requests r ON r.id = o.request_id
        WHERE o.id = $1
    `
	var bID, sID sql.NullInt64
	if err = s.db.QueryRowxContext(ctx, query, offerID).Scan(&bID, &sID); err != nil {
		return nil, nil, err
	}
	if bID.Valid {
		v := bID.Int64
		buyerID = &v
	}
	if sID.Valid {
		v := sID.Int64
		sellerID = &v
	}
	return buyerID, sellerID, nil
}

func (s *Store) ListOfferMessages(ctx context.Context, offerID int64) ([]models.OfferMessage, error) {
	query := `SELECT id, offer_id, sender_user_id, body, attachment_url, created_at
              FROM offer_messages WHERE offer_id = $1 ORDER BY created_at ASC`

	rows, err := s.db.QueryxContext(ctx, query, offerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.OfferMessage
	for rows.Next() {
		var msg models.OfferMessage
		if err := rows.StructScan(&msg); err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}
	return messages, rows.Err()
}

func (s *Store) CreateOfferMessage(ctx context.Context, params CreateOfferMessageParams) (*models.OfferMessage, error) {
	buyerID, sellerID, err := s.getOfferParticipants(ctx, params.OfferID)
	if err != nil {
		return nil, err
	}
	allowed := false
	if buyerID != nil && *buyerID == params.SenderUserID {
		allowed = true
	}
	if !allowed && sellerID != nil && *sellerID == params.SenderUserID {
		allowed = true
	}
	if !allowed {
		return nil, ErrMessageNotAllowed
	}

	query := `
        INSERT INTO offer_messages (offer_id, sender_user_id, body, attachment_url)
        VALUES ($1, $2, $3, $4)
        RETURNING id, offer_id, sender_user_id, body, attachment_url, created_at
    `

	var msg models.OfferMessage
	if err := s.db.QueryRowxContext(ctx, query,
		params.OfferID,
		params.SenderUserID,
		params.Body,
		params.AttachmentURL,
	).StructScan(&msg); err != nil {
		return nil, err
	}
	return &msg, nil
}

func (s *Store) CountIncomingMessages(ctx context.Context, userID int64) (int, error) {
	query := `
        SELECT COUNT(*)
        FROM offer_messages m
        INNER JOIN offers o ON o.id = m.offer_id
        INNER JOIN requests r ON r.id = o.request_id
        WHERE m.sender_user_id <> $1
          AND (o.seller_user_id = $1 OR r.buyer_user_id = $1)
          AND m.created_at >= NOW() - INTERVAL '7 days'
    `
	var count int
	if err := s.db.QueryRowxContext(ctx, query, userID).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}
