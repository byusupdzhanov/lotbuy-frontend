package store

import (
        "context"
        "database/sql"
        "errors"
        "fmt"
        "strings"
        "time"

        "github.com/jmoiron/sqlx"

        "lotbuy-backend/internal/models"
)

var (
        ErrOfferUnavailable = errors.New("offer is not available")
        ErrRequestClosed    = errors.New("request is not accepting new deals")
        ErrDealUnauthorized = errors.New("not authorized to update this deal")
        ErrMilestoneDone    = errors.New("milestone already completed")
)

func (s *Store) GetDeal(ctx context.Context, id int64) (*models.Deal, error) {
        query := `SELECT id, request_id, offer_id, status, total_amount, currency_code,
                     due_at, last_message_text, last_message_at,
                     dispute_reason, dispute_opened_by, dispute_opened_at,
                     completed_at, buyer_rating, seller_rating,
                     created_at, updated_at
              FROM deals WHERE id = $1`
	var deal models.Deal
	if err := s.db.QueryRowxContext(ctx, query, id).StructScan(&deal); err != nil {
		return nil, err
	}
	return &deal, nil
}

func (s *Store) ListDealsForUser(ctx context.Context, userID int64) ([]models.DealDetails, error) {
        query := `
        SELECT d.id
        FROM deals d
        INNER JOIN requests r ON r.id = d.request_id
        INNER JOIN offers o ON o.id = d.offer_id
        WHERE (r.buyer_user_id = $1 OR o.seller_user_id = $1)
        ORDER BY d.created_at DESC`
        rows, err := s.db.QueryxContext(ctx, query, userID)
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
                BuyerUserID: req.BuyerID,
                SellerUserID: offer.SellerID,
        }

        return &detail, nil
}

type dealContext struct {
        Deal    models.Deal
        Request models.Request
        Offer   models.Offer
}

func (s *Store) loadDealContext(ctx context.Context, tx *sqlx.Tx, dealID int64) (*dealContext, error) {
        var deal models.Deal
        if err := tx.QueryRowxContext(ctx, `SELECT id, request_id, offer_id, status, total_amount, currency_code,
                due_at, last_message_text, last_message_at,
                dispute_reason, dispute_opened_by, dispute_opened_at,
                completed_at, buyer_rating, seller_rating,
                created_at, updated_at
            FROM deals WHERE id = $1 FOR UPDATE`, dealID).StructScan(&deal); err != nil {
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

        return &dealContext{Deal: deal, Request: *req, Offer: *offer}, nil
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
                  due_at, last_message_text, last_message_at,
                  dispute_reason, dispute_opened_by, dispute_opened_at,
                  completed_at, buyer_rating, seller_rating,
                  created_at, updated_at
    `,
                offer.RequestID,
                offer.ID,
                "awaiting_shipment",
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
                {Label: "Shipment", Position: 2, Completed: false, CompletedAt: nil},
                {Label: "Payment", Position: 3, Completed: false, CompletedAt: nil},
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

func participantRole(ctx *dealContext, userID int64) (isBuyer bool, isSeller bool) {
        if ctx.Request.BuyerID != nil && *ctx.Request.BuyerID == userID {
                isBuyer = true
        }
        if ctx.Offer.SellerID != nil && *ctx.Offer.SellerID == userID {
                isSeller = true
        }
        return
}

func (s *Store) MarkDealShipped(ctx context.Context, dealID, userID int64) (*models.DealDetails, error) {
        tx, err := s.db.BeginTxx(ctx, nil)
        if err != nil {
                return nil, err
        }
        committed := false
        defer func() {
                if !committed {
                        _ = tx.Rollback()
                }
        }()

        data, err := s.loadDealContext(ctx, tx, dealID)
        if err != nil {
                return nil, err
        }
        _, isSeller := participantRole(data, userID)
        if !isSeller {
                return nil, ErrDealUnauthorized
        }

        milestone, err := s.getMilestoneForUpdate(ctx, tx, dealID, "Shipment")
        if err != nil {
                return nil, err
        }
        if milestone.Completed {
                return nil, ErrMilestoneDone
        }

        if err := s.completeMilestone(ctx, tx, milestone.ID); err != nil {
                return nil, err
        }

        if _, err := tx.ExecContext(ctx, `
        UPDATE deals
        SET status = 'awaiting_payment',
            last_message_text = 'Seller confirmed shipment.',
            last_message_at = NOW(),
            updated_at = NOW()
        WHERE id = $1`, dealID); err != nil {
                return nil, err
        }

        if err := tx.Commit(); err != nil {
                return nil, err
        }
        committed = true

        return s.GetDealDetails(ctx, dealID)
}

func (s *Store) SubmitDealPayment(ctx context.Context, dealID, userID int64) (*models.DealDetails, error) {
        tx, err := s.db.BeginTxx(ctx, nil)
        if err != nil {
                return nil, err
        }
        committed := false
        defer func() {
                if !committed {
                        _ = tx.Rollback()
                }
        }()

        data, err := s.loadDealContext(ctx, tx, dealID)
        if err != nil {
                return nil, err
        }
        isBuyer, _ := participantRole(data, userID)
        if !isBuyer {
                return nil, ErrDealUnauthorized
        }

        milestone, err := s.getMilestoneForUpdate(ctx, tx, dealID, "Payment")
        if err != nil {
                return nil, err
        }
        if milestone.Completed {
                return nil, ErrMilestoneDone
        }

        if err := s.completeMilestone(ctx, tx, milestone.ID); err != nil {
                return nil, err
        }

        if _, err := tx.ExecContext(ctx, `
        UPDATE deals
        SET status = 'awaiting_confirmation',
            last_message_text = 'Buyer submitted payment.',
            last_message_at = NOW(),
            updated_at = NOW()
        WHERE id = $1`, dealID); err != nil {
                return nil, err
        }

        if err := tx.Commit(); err != nil {
                return nil, err
        }
        committed = true

        return s.GetDealDetails(ctx, dealID)
}

func (s *Store) ConfirmDealCompletion(ctx context.Context, dealID, userID int64) (*models.DealDetails, error) {
        tx, err := s.db.BeginTxx(ctx, nil)
        if err != nil {
                return nil, err
        }
        committed := false
        defer func() {
                if !committed {
                        _ = tx.Rollback()
                }
        }()

        data, err := s.loadDealContext(ctx, tx, dealID)
        if err != nil {
                return nil, err
        }
        _, isSeller := participantRole(data, userID)
        if !isSeller {
                return nil, ErrDealUnauthorized
        }

        milestone, err := s.getMilestoneForUpdate(ctx, tx, dealID, "Confirmation")
        if err != nil {
                return nil, err
        }
        if milestone.Completed {
                return nil, ErrMilestoneDone
        }

        if err := s.completeMilestone(ctx, tx, milestone.ID); err != nil {
                return nil, err
        }

        now := time.Now()
        if _, err := tx.ExecContext(ctx, `
        UPDATE deals
        SET status = 'completed',
            completed_at = $2,
            last_message_text = 'Seller confirmed receipt of payment.',
            last_message_at = $2,
            updated_at = $2
        WHERE id = $1`, dealID, now); err != nil {
                return nil, err
        }

        if _, err := tx.ExecContext(ctx, `UPDATE requests SET status = 'completed', updated_at = NOW() WHERE id = $1`, data.Deal.RequestID); err != nil {
                return nil, err
        }
        if _, err := tx.ExecContext(ctx, `UPDATE offers SET status = 'completed', updated_at = NOW() WHERE id = $1`, data.Deal.OfferID); err != nil {
                return nil, err
        }

        if data.Request.BuyerID != nil {
                if _, err := tx.ExecContext(ctx, `UPDATE users SET completed_deals = completed_deals + 1 WHERE id = $1`, *data.Request.BuyerID); err != nil {
                        return nil, err
                }
        }
        if data.Offer.SellerID != nil {
                if _, err := tx.ExecContext(ctx, `UPDATE users SET completed_deals = completed_deals + 1 WHERE id = $1`, *data.Offer.SellerID); err != nil {
                        return nil, err
                }
        }

        if err := tx.Commit(); err != nil {
                return nil, err
        }
        committed = true

        return s.GetDealDetails(ctx, dealID)
}

func (s *Store) getMilestoneForUpdate(ctx context.Context, tx *sqlx.Tx, dealID int64, label string) (*models.DealMilestone, error) {
        var milestone models.DealMilestone
        if err := tx.QueryRowxContext(ctx, `
        SELECT id, deal_id, label, position, completed, completed_at, created_at, updated_at
        FROM deal_milestones
        WHERE deal_id = $1 AND label = $2
        FOR UPDATE
    `, dealID, label).StructScan(&milestone); err != nil {
                return nil, err
        }
        return &milestone, nil
}

func (s *Store) completeMilestone(ctx context.Context, tx *sqlx.Tx, milestoneID int64) error {
        now := time.Now()
        _, err := tx.ExecContext(ctx, `
        UPDATE deal_milestones
        SET completed = TRUE,
            completed_at = $1,
            updated_at = $1
        WHERE id = $2
    `, now, milestoneID)
        return err
}

func (s *Store) OpenDealDispute(ctx context.Context, dealID, userID int64, reason string) (*models.DealDetails, error) {
        tx, err := s.db.BeginTxx(ctx, nil)
        if err != nil {
                return nil, err
        }
        committed := false
        defer func() {
                if !committed {
                        _ = tx.Rollback()
                }
        }()

        data, err := s.loadDealContext(ctx, tx, dealID)
        if err != nil {
                return nil, err
        }
        isBuyer, isSeller := participantRole(data, userID)
        if !isBuyer && !isSeller {
                return nil, ErrDealUnauthorized
        }

        trimmed := strings.TrimSpace(reason)
        if trimmed == "" {
                trimmed = "Dispute opened"
        }

        now := time.Now()
        if _, err := tx.ExecContext(ctx, `
        UPDATE deals
        SET status = 'in_dispute',
            dispute_reason = $2,
            dispute_opened_by = $3,
            dispute_opened_at = $4,
            last_message_text = $2,
            last_message_at = $4,
            updated_at = $4
        WHERE id = $1`, dealID, trimmed, userID, now); err != nil {
                return nil, err
        }

        if _, err := tx.ExecContext(ctx, `UPDATE requests SET status = 'in_dispute', updated_at = NOW() WHERE id = $1`, data.Deal.RequestID); err != nil {
                return nil, err
        }

        if err := tx.Commit(); err != nil {
                return nil, err
        }
        committed = true

        return s.GetDealDetails(ctx, dealID)
}

type DealFeedbackParams struct {
        DealID     int64
        ReviewerID int64
        Rating     int
        Comment    *string
}

func (s *Store) AddDealFeedback(ctx context.Context, params DealFeedbackParams) (*models.DealDetails, error) {
        if params.Rating < 1 || params.Rating > 5 {
                return nil, fmt.Errorf("rating must be between 1 and 5")
        }

        tx, err := s.db.BeginTxx(ctx, nil)
        if err != nil {
                return nil, err
        }
        committed := false
        defer func() {
                if !committed {
                        _ = tx.Rollback()
                }
        }()

        data, err := s.loadDealContext(ctx, tx, params.DealID)
        if err != nil {
                return nil, err
        }
        isBuyer, isSeller := participantRole(data, params.ReviewerID)
        if !isBuyer && !isSeller {
                return nil, ErrDealUnauthorized
        }
        if data.Deal.Status != "completed" {
                return nil, fmt.Errorf("deal must be completed before leaving feedback")
        }

        var revieweeID int64
        targetColumn := "seller_rating"
        if isSeller {
                if data.Request.BuyerID == nil {
                        return nil, fmt.Errorf("deal is missing buyer")
                }
                revieweeID = *data.Request.BuyerID
                targetColumn = "buyer_rating"
        } else {
                if data.Offer.SellerID == nil {
                        return nil, fmt.Errorf("deal is missing seller")
                }
                revieweeID = *data.Offer.SellerID
        }

        var previous *int
        var previousValue sql.NullInt64
        if err := tx.QueryRowxContext(ctx, `SELECT rating FROM deal_feedback WHERE deal_id = $1 AND reviewer_user_id = $2`, params.DealID, params.ReviewerID).Scan(&previousValue); err != nil {
                if !errors.Is(err, sql.ErrNoRows) {
                        return nil, err
                }
        } else if previousValue.Valid {
                val := int(previousValue.Int64)
                previous = &val
        }

        var commentPtr *string
        var commentValue string
        if params.Comment != nil {
                trimmed := strings.TrimSpace(*params.Comment)
                if trimmed != "" {
                        commentValue = trimmed
                        commentPtr = &commentValue
                }
        }

        if _, err := tx.ExecContext(ctx, `
        INSERT INTO deal_feedback (deal_id, reviewer_user_id, reviewee_user_id, rating, comment)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (deal_id, reviewer_user_id)
        DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = NOW()
    `, params.DealID, params.ReviewerID, revieweeID, params.Rating, commentPtr); err != nil {
                return nil, err
        }

        if previous != nil {
                diff := params.Rating - *previous
                if _, err := tx.ExecContext(ctx, `UPDATE users SET rating_total = rating_total + $1 WHERE id = $2`, diff, revieweeID); err != nil {
                        return nil, err
                }
        } else {
                if _, err := tx.ExecContext(ctx, `UPDATE users SET rating_total = rating_total + $1, rating_count = rating_count + 1 WHERE id = $2`, params.Rating, revieweeID); err != nil {
                        return nil, err
                }
        }

        if _, err := tx.ExecContext(ctx, fmt.Sprintf(`UPDATE deals SET %s = $1, updated_at = NOW() WHERE id = $2`, targetColumn), params.Rating, params.DealID); err != nil {
                return nil, err
        }

        if err := tx.Commit(); err != nil {
                return nil, err
        }
        committed = true

        return s.GetDealDetails(ctx, params.DealID)
}
