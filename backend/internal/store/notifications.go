package store

import (
	"context"

	"lotbuy-backend/internal/models"
)

type CreateNotificationParams struct {
	UserID   int64
	Type     string
	Title    string
	Body     *string
	Metadata []byte
}

func (s *Store) CreateNotification(ctx context.Context, params CreateNotificationParams) (*models.Notification, error) {
	query := `
        INSERT INTO notifications (user_id, type, title, body, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, type, title, body, metadata, is_read, created_at
    `

	var notif models.Notification
	if err := s.db.QueryRowxContext(ctx, query,
		params.UserID,
		params.Type,
		params.Title,
		params.Body,
		params.Metadata,
	).StructScan(&notif); err != nil {
		return nil, err
	}
	return &notif, nil
}

func (s *Store) ListNotifications(ctx context.Context, userID int64, unreadOnly bool, limit int) ([]models.Notification, error) {
	query := `
        SELECT id, user_id, type, title, body, metadata, is_read, created_at
        FROM notifications
        WHERE user_id = $1
    `
	args := []interface{}{userID}
	if unreadOnly {
		query += " AND NOT is_read"
	}
	query += " ORDER BY created_at DESC"
	if limit > 0 {
		query += " LIMIT $2"
		args = append(args, limit)
	}

	rows, err := s.db.QueryxContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var n models.Notification
		if err := rows.StructScan(&n); err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}
	return notifications, rows.Err()
}

func (s *Store) MarkNotificationRead(ctx context.Context, userID, notificationID int64) error {
	_, err := s.db.ExecContext(ctx,
		`UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
		notificationID,
		userID,
	)
	return err
}

func (s *Store) CountUnreadNotifications(ctx context.Context, userID int64) (int, error) {
	query := `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND NOT is_read`
	var count int
	if err := s.db.QueryRowxContext(ctx, query, userID).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}
