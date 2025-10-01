package store

import (
	"context"

	"lotbuy-backend/internal/models"
)

type UserStats struct {
	ActiveLots          int `json:"activeLots"`
	PendingOffers       int `json:"pendingOffers"`
	ActiveDeals         int `json:"activeDeals"`
	CompletedDeals      int `json:"completedDeals"`
	OffersMade          int `json:"offersMade"`
	UnreadNotifications int `json:"unreadNotifications"`
	IncomingMessages    int `json:"incomingMessages"`
}

type PendingOfferWithRequest struct {
	Offer        models.Offer `json:"offer"`
	RequestTitle string       `json:"requestTitle"`
	RequestImage *string      `json:"requestImage,omitempty"`
}

func (s *Store) GetUserStats(ctx context.Context, userID int64) (UserStats, error) {
	var stats UserStats

	if err := s.db.QueryRowxContext(ctx,
		`SELECT COUNT(*) FROM requests WHERE buyer_user_id = $1 AND status IN ('open','in_progress')`,
		userID,
	).Scan(&stats.ActiveLots); err != nil {
		return stats, err
	}

	if err := s.db.QueryRowxContext(ctx,
		`SELECT COUNT(*) FROM offers o INNER JOIN requests r ON r.id = o.request_id WHERE r.buyer_user_id = $1 AND o.status = 'pending'`,
		userID,
	).Scan(&stats.PendingOffers); err != nil {
		return stats, err
	}

	if err := s.db.QueryRowxContext(ctx,
		`SELECT COUNT(*) FROM deals d INNER JOIN requests r ON r.id = d.request_id WHERE r.buyer_user_id = $1 AND d.status <> 'completed'`,
		userID,
	).Scan(&stats.ActiveDeals); err != nil {
		return stats, err
	}

	if err := s.db.QueryRowxContext(ctx,
		`SELECT COUNT(*) FROM deals d INNER JOIN requests r ON r.id = d.request_id WHERE r.buyer_user_id = $1 AND d.status = 'completed'`,
		userID,
	).Scan(&stats.CompletedDeals); err != nil {
		return stats, err
	}

	if err := s.db.QueryRowxContext(ctx,
		`SELECT COUNT(*) FROM offers WHERE seller_user_id = $1`,
		userID,
	).Scan(&stats.OffersMade); err != nil {
		return stats, err
	}

	unread, err := s.CountUnreadNotifications(ctx, userID)
	if err != nil {
		return stats, err
	}
	stats.UnreadNotifications = unread

	incoming, err := s.CountIncomingMessages(ctx, userID)
	if err != nil {
		return stats, err
	}
	stats.IncomingMessages = incoming

	return stats, nil
}

func (s *Store) ListPendingOffersWithRequest(ctx context.Context, buyerID int64, limit int) ([]PendingOfferWithRequest, error) {
	if limit <= 0 {
		limit = 10
	}
	query := `
        SELECT o.id, o.request_id, o.seller_user_id, o.seller_name, o.seller_avatar_url, o.seller_rating,
               o.price_amount, o.currency_code, o.message, o.status, o.created_at, o.updated_at,
               r.title, r.image_url
        FROM offers o
        INNER JOIN requests r ON r.id = o.request_id
        WHERE r.buyer_user_id = $1 AND o.status = 'pending'
        ORDER BY o.created_at DESC
        LIMIT $2
    `

	rows, err := s.db.QueryxContext(ctx, query, buyerID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []PendingOfferWithRequest
	for rows.Next() {
		var offer models.Offer
		var title string
		var image *string
		if err := rows.Scan(
			&offer.ID,
			&offer.RequestID,
			&offer.SellerID,
			&offer.SellerName,
			&offer.SellerAvatar,
			&offer.SellerRating,
			&offer.PriceAmount,
			&offer.CurrencyCode,
			&offer.Message,
			&offer.Status,
			&offer.CreatedAt,
			&offer.UpdatedAt,
			&title,
			&image,
		); err != nil {
			return nil, err
		}
		results = append(results, PendingOfferWithRequest{
			Offer:        offer,
			RequestTitle: title,
			RequestImage: image,
		})
	}
	return results, rows.Err()
}
