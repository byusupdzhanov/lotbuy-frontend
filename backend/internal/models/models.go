package models

import (
	"encoding/json"
	"time"
)

type Request struct {
	ID              int64      `db:"id" json:"id"`
	Title           string     `db:"title" json:"title"`
	Description     *string    `db:"description" json:"description,omitempty"`
	BudgetAmount    float64    `db:"budget_amount" json:"budgetAmount"`
	CurrencyCode    string     `db:"currency_code" json:"currencyCode"`
	BuyerID         *int64     `db:"buyer_user_id" json:"buyerId,omitempty"`
	BuyerName       string     `db:"buyer_name" json:"buyerName"`
	BuyerAvatar     *string    `db:"buyer_avatar_url" json:"buyerAvatarUrl,omitempty"`
	BuyerRating     *float64   `db:"buyer_rating" json:"buyerRating,omitempty"`
	ImageURL        *string    `db:"image_url" json:"imageUrl,omitempty"`
	Category        *string    `db:"category" json:"category,omitempty"`
	Subcategory     *string    `db:"subcategory" json:"subcategory,omitempty"`
	LocationCity    *string    `db:"location_city" json:"locationCity,omitempty"`
	LocationRegion  *string    `db:"location_region" json:"locationRegion,omitempty"`
	LocationCountry *string    `db:"location_country" json:"locationCountry,omitempty"`
	DeadlineAt      *time.Time `db:"deadline_at" json:"deadlineAt,omitempty"`
	Status          string     `db:"status" json:"status"`
	CreatedAt       time.Time  `db:"created_at" json:"createdAt"`
	UpdatedAt       time.Time  `db:"updated_at" json:"updatedAt"`
}

type Offer struct {
	ID           int64     `db:"id" json:"id"`
	RequestID    int64     `db:"request_id" json:"requestId"`
	SellerID     *int64    `db:"seller_user_id" json:"sellerId,omitempty"`
	SellerName   string    `db:"seller_name" json:"sellerName"`
	SellerAvatar *string   `db:"seller_avatar_url" json:"sellerAvatarUrl,omitempty"`
	SellerRating *float64  `db:"seller_rating" json:"sellerRating,omitempty"`
	PriceAmount  float64   `db:"price_amount" json:"priceAmount"`
	CurrencyCode string    `db:"currency_code" json:"currencyCode"`
	Message      *string   `db:"message" json:"message,omitempty"`
	Status       string    `db:"status" json:"status"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time `db:"updated_at" json:"updatedAt"`
}

type Notification struct {
	ID        int64           `db:"id" json:"id"`
	UserID    int64           `db:"user_id" json:"userId"`
	Type      string          `db:"type" json:"type"`
	Title     string          `db:"title" json:"title"`
	Body      *string         `db:"body" json:"body,omitempty"`
	Metadata  json.RawMessage `db:"metadata" json:"metadata,omitempty"`
	IsRead    bool            `db:"is_read" json:"isRead"`
	CreatedAt time.Time       `db:"created_at" json:"createdAt"`
}

type OfferMessage struct {
	ID           int64     `db:"id" json:"id"`
	OfferID      int64     `db:"offer_id" json:"offerId"`
	SenderUserID int64     `db:"sender_user_id" json:"senderUserId"`
	Body         *string   `db:"body" json:"body,omitempty"`
	Attachment   *string   `db:"attachment_url" json:"attachmentUrl,omitempty"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
}

type Deal struct {
        ID              int64      `db:"id" json:"id"`
        RequestID       int64      `db:"request_id" json:"requestId"`
        OfferID         int64      `db:"offer_id" json:"offerId"`
        Status          string     `db:"status" json:"status"`
        TotalAmount     float64    `db:"total_amount" json:"totalAmount"`
        CurrencyCode    string     `db:"currency_code" json:"currencyCode"`
        DueAt           *time.Time `db:"due_at" json:"dueAt,omitempty"`
        LastMessageText *string    `db:"last_message_text" json:"lastMessageText,omitempty"`
        LastMessageAt   *time.Time `db:"last_message_at" json:"lastMessageAt,omitempty"`
        DisputeReason   *string    `db:"dispute_reason" json:"disputeReason,omitempty"`
        DisputeOpenedBy *int64     `db:"dispute_opened_by" json:"disputeOpenedBy,omitempty"`
        DisputeOpenedAt *time.Time `db:"dispute_opened_at" json:"disputeOpenedAt,omitempty"`
        CompletedAt     *time.Time `db:"completed_at" json:"completedAt,omitempty"`
        BuyerRating     *int       `db:"buyer_rating" json:"buyerRating,omitempty"`
        SellerRating    *int       `db:"seller_rating" json:"sellerRating,omitempty"`
        CreatedAt       time.Time  `db:"created_at" json:"createdAt"`
        UpdatedAt       time.Time  `db:"updated_at" json:"updatedAt"`
}

type DealMilestone struct {
	ID          int64      `db:"id" json:"id"`
	DealID      int64      `db:"deal_id" json:"dealId"`
	Label       string     `db:"label" json:"label"`
	Position    int        `db:"position" json:"position"`
	Completed   bool       `db:"completed" json:"completed"`
	CompletedAt *time.Time `db:"completed_at" json:"completedAt,omitempty"`
	CreatedAt   time.Time  `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time  `db:"updated_at" json:"updatedAt"`
}

type DealDetails struct {
        Deal
        Request    Request          `json:"request"`
        Seller     OfferParticipant `json:"seller"`
        Buyer      BuyerParticipant `json:"buyer"`
        Offer      OfferSummary     `json:"offer"`
        Milestones []DealMilestone  `json:"milestones"`
        BuyerUserID *int64          `json:"buyerUserId,omitempty"`
        SellerUserID *int64         `json:"sellerUserId,omitempty"`
}

type OfferParticipant struct {
	Name   string   `json:"name"`
	Avatar *string  `json:"avatarUrl,omitempty"`
	Rating *float64 `json:"rating,omitempty"`
}

type BuyerParticipant struct {
	Name   string   `json:"name"`
	Avatar *string  `json:"avatarUrl,omitempty"`
	Rating *float64 `json:"rating,omitempty"`
}

type OfferSummary struct {
	ID           int64   `json:"id"`
	PriceAmount  float64 `json:"priceAmount"`
	CurrencyCode string  `json:"currencyCode"`
	Message      *string `json:"message,omitempty"`
	Status       string  `json:"status"`
}

type User struct {
        ID           int64     `db:"id" json:"id"`
        Email        string    `db:"email" json:"email"`
        FullName     string    `db:"full_name" json:"fullName"`
        PasswordHash string    `db:"password_hash" json:"-"`
        Role         string    `db:"role" json:"role"`
        AvatarURL    *string   `db:"avatar_url" json:"avatarUrl,omitempty"`
        CompletedDeals int     `db:"completed_deals" json:"completedDeals"`
        RatingTotal    int     `db:"rating_total" json:"-"`
        RatingCount    int     `db:"rating_count" json:"-"`
        CreatedAt    time.Time `db:"created_at" json:"createdAt"`
        UpdatedAt    time.Time `db:"updated_at" json:"updatedAt"`
}

type PublicUser struct {
        ID        int64   `json:"id"`
        Email     string  `json:"email"`
        FullName  string  `json:"fullName"`
        Role      string  `json:"role"`
        AvatarURL *string `json:"avatarUrl,omitempty"`
        CompletedDeals int    `json:"completedDeals"`
        Rating          *float64 `json:"rating,omitempty"`
}

func (u User) Public() PublicUser {
        var rating *float64
        if u.RatingCount > 0 {
                value := float64(u.RatingTotal) / float64(u.RatingCount)
                rating = &value
        }
        return PublicUser{
                ID:        u.ID,
                Email:     u.Email,
                FullName:  u.FullName,
                Role:      u.Role,
                AvatarURL: u.AvatarURL,
                CompletedDeals: u.CompletedDeals,
                Rating:         rating,
        }
}
