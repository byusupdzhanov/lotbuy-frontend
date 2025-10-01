package store

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/jmoiron/sqlx"

	"lotbuy-backend/internal/models"
)

var (
	ErrOfferUnavailable = errors.New("offer is not available")
	ErrRequestClosed    = errors.New("request is not accepting new deals")
)

func (s *Store) GetDeal(ctx context.Context, id int64) (*models.Deal, error) {
	query := `SELECT id, request_id, offer_id, status, total_amount, currency_code,
                     due_at, last_message_text, last_message_at, created_at, updated_at
              FROM deals WHERE id = $1`
	var deal models.Deal
	if err := s.db.QueryRowxContext(ctx, query, id).StructScan(&deal); err != nil {
		return nil, err
	}
	return &deal, nil
}

func (s *Store) ListDeals(ctx context.Context) ([]models.DealDetails, error) {
	query := `SELECT id FROM deals ORDER BY created_at DESC`
	rows, err := s.db.QueryxContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deals []models.DealDetails
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		detail, err := s.GetDealDetails(ctx, id)
		if err != nil {
			return nil, err
		}
		deals = append(deals, *detail)
	}
	return deals, rows.Err()
}

func (s *Store) GetDealDetails(ctx context.Context, id int64) (*models.DealDetails, error) {
	deal, err := s.GetDeal(ctx, id)
	if err != nil {
		return nil, err
	}

	req, err := s.GetRequest(ctx, deal.RequestID)
	if err != nil {
		return nil, err
	}

	offer, err := s.GetOffer(ctx, deal.OfferID)
	if err != nil {
		return nil, err
	}

	milestones, err := s.ListDealMilestones(ctx, deal.ID)
	if err != nil {
		return nil, err
	}

	detail := models.DealDetails{
		Deal:    *deal,
		Request: *req,
		Offer: models.OfferSummary{
			ID:           offer.ID,
			PriceAmount:  offer.PriceAmount,
			CurrencyCode: offer.CurrencyCode,
			Message:      offer.Message,
			Status:       offer.Status,
		},
		Seller: models.OfferParticipant{
			Name:   offer.SellerName,
			Avatar: offer.SellerAvatar,
			Rating: offer.SellerRating,
		},
		Buyer: models.BuyerParticipant{
			Name:   req.BuyerName,
			Avatar: req.BuyerAvatar,
			Rating: req.BuyerRating,
		},
		Milestones: milestones,
	}

	return &detail, nil
}

func (s *Store) CreateDealFromOffer(ctx context.Context, offerID int64) (*models.DealDetails, error) {
	tx, err := s.db.BeginTxx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, err
	}
	committed := false
	defer func() {
		if !committed {
			_ = tx.Rollback()
		}
	}()

	var offer models.Offer
	if err = tx.QueryRowxContext(ctx, `
        SELECT id, request_id, seller_name, seller_avatar_url, seller_rating,
               price_amount, currency_code, message, status, created_at, updated_at
        FROM offers WHERE id = $1 FOR UPDATE
    `, offerID).StructScan(&offer); err != nil {
		return nil, err
	}

	if offer.Status != "pending" {
		return nil, ErrOfferUnavailable
	}

	var req models.Request
	if err = tx.QueryRowxContext(ctx, `
        SELECT id, title, description, budget_amount, currency_code, buyer_name,
               buyer_avatar_url, buyer_rating, image_url, status, created_at, updated_at
        FROM requests WHERE id = $1 FOR UPDATE
    `, offer.RequestID).StructScan(&req); err != nil {
		return nil, err
	}

	if req.Status != "open" {
		return nil, ErrRequestClosed
	}

	now := time.Now()
	dueAt := now.Add(48 * time.Hour)
	var deal models.Deal
	if err = tx.QueryRowxContext(ctx, `
        INSERT INTO deals (
            request_id, offer_id, status, total_amount, currency_code, due_at,
            last_message_text, last_message_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, request_id, offer_id, status, total_amount, currency_code,
                  due_at, last_message_text, last_message_at, created_at, updated_at
    `,
		offer.RequestID,
		offer.ID,
		"awaiting_payment",
		offer.PriceAmount,
		offer.CurrencyCode,
		dueAt,
		"Offer accepted. Waiting for payment.",
		now,
	).StructScan(&deal); err != nil {
		return nil, err
	}

	if _, err = tx.ExecContext(ctx, `UPDATE offers SET status = 'accepted', updated_at = NOW() WHERE id = $1`, offer.ID); err != nil {
		return nil, err
	}

	if _, err = tx.ExecContext(ctx, `UPDATE requests SET status = 'in_progress', updated_at = NOW() WHERE id = $1`, req.ID); err != nil {
		return nil, err
	}

	if err = insertDefaultMilestones(ctx, tx, deal.ID, now); err != nil {
		return nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}
	committed = true

	return s.GetDealDetails(ctx, deal.ID)
}

func insertDefaultMilestones(ctx context.Context, tx *sqlx.Tx, dealID int64, acceptedAt time.Time) error {
	milestones := []struct {
		Label       string
		Position    int
		Completed   bool
		CompletedAt *time.Time
	}{
		{Label: "Offer accepted", Position: 1, Completed: true, CompletedAt: &acceptedAt},
		{Label: "Payment", Position: 2, Completed: false, CompletedAt: nil},
		{Label: "Shipment", Position: 3, Completed: false, CompletedAt: nil},
		{Label: "Confirmation", Position: 4, Completed: false, CompletedAt: nil},
	}

	for _, m := range milestones {
		if _, err := tx.ExecContext(ctx, `
            INSERT INTO deal_milestones (deal_id, label, position, completed, completed_at)
            VALUES ($1, $2, $3, $4, $5)
        `, dealID, m.Label, m.Position, m.Completed, m.CompletedAt); err != nil {
			return err
		}
	}
	return nil
}

func (s *Store) ListDealMilestones(ctx context.Context, dealID int64) ([]models.DealMilestone, error) {
	rows, err := s.db.QueryxContext(ctx, `
        SELECT id, deal_id, label, position, completed, completed_at, created_at, updated_at
        FROM deal_milestones WHERE deal_id = $1 ORDER BY position ASC
    `, dealID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var milestones []models.DealMilestone
	for rows.Next() {
		var m models.DealMilestone
		if err := rows.StructScan(&m); err != nil {
			return nil, err
		}
		milestones = append(milestones, m)
	}
	return milestones, rows.Err()
}

func (s *Store) UpdateDealStatus(ctx context.Context, id int64, status string) error {
	_, err := s.db.ExecContext(ctx, `UPDATE deals SET status = $1, updated_at = NOW() WHERE id = $2`, status, id)
	return err
}

func (s *Store) SetMilestoneCompleted(ctx context.Context, milestoneID int64, completed bool) error {
	var completedAt *time.Time
	if completed {
		t := time.Now()
		completedAt = &t
	}
	_, err := s.db.ExecContext(ctx, `
        UPDATE deal_milestones
        SET completed = $1,
            completed_at = $2,
            updated_at = NOW()
        WHERE id = $3
    `, completed, completedAt, milestoneID)
	return err
}
