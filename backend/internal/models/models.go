package models

import "time"

type Request struct {
	ID           int64     `db:"id" json:"id"`
	Title        string    `db:"title" json:"title"`
	Description  *string   `db:"description" json:"description,omitempty"`
	BudgetAmount float64   `db:"budget_amount" json:"budgetAmount"`
	CurrencyCode string    `db:"currency_code" json:"currencyCode"`
	BuyerName    string    `db:"buyer_name" json:"buyerName"`
	BuyerAvatar  *string   `db:"buyer_avatar_url" json:"buyerAvatarUrl,omitempty"`
	BuyerRating  *float64  `db:"buyer_rating" json:"buyerRating,omitempty"`
	ImageURL     *string   `db:"image_url" json:"imageUrl,omitempty"`
	Status       string    `db:"status" json:"status"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time `db:"updated_at" json:"updatedAt"`
}

type Offer struct {
	ID           int64     `db:"id" json:"id"`
	RequestID    int64     `db:"request_id" json:"requestId"`
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
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time `db:"updated_at" json:"updatedAt"`
}

type PublicUser struct {
	ID        int64   `json:"id"`
	Email     string  `json:"email"`
	FullName  string  `json:"fullName"`
	Role      string  `json:"role"`
	AvatarURL *string `json:"avatarUrl,omitempty"`
}

func (u User) Public() PublicUser {
	return PublicUser{
		ID:        u.ID,
		Email:     u.Email,
		FullName:  u.FullName,
		Role:      u.Role,
		AvatarURL: u.AvatarURL,
	}
}

