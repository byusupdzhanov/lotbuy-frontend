# Lotbuy Backend

This directory contains a Go HTTP API for powering the Lotbuy marketplace experience. It provides endpoints to manage purchase requests, offers from sellers, and the lifecycle of deals once an offer is accepted.

## Features

- REST API built with Go's standard `net/http` stack and PostgreSQL.
- Endpoints for creating and listing purchase requests, submitting offers, accepting offers, and tracking deal milestones.
- Lightweight CORS and logging middleware suitable for local development with the frontend.

## Getting started

### Prerequisites

- Go 1.22+
- PostgreSQL 13+ (or a compatible service such as Supabase/RDS)

### Environment variables

The server expects the following variables:

| Variable | Description | Default |
| --- | --- | --- |
| `LOTBUY_DATABASE_URL` | PostgreSQL connection string | _required_ |
| `LOTBUY_HTTP_ADDR` | Address/port to bind the API server | `:8080` |
| `LOTBUY_AUTH_SECRET` | HMAC secret for signing auth tokens | `dev-secret-change-me` |

### Database schema

Apply the migrations in the `migrations/` folder before running the server. A simple example with the `psql` CLI:

```bash
psql "$LOTBUY_DATABASE_URL" -f migrations/0001_init.sql
```

The initial schema creates the following tables:

- `users` — registered marketplace accounts with secure password hashes, display name, avatar, and role (`buyer` or `seller`).

- `requests` — purchase intents created by buyers, including budget, currency, and buyer profile information.
- `offers` — seller proposals attached to a request.
- `deals` — binding agreements generated when a buyer accepts an offer. Stores status, total amount, currency, due dates, and the latest communication summary.
- `deal_milestones` — ordered checkpoints for each deal (offer accepted, payment, shipment, confirmation) with completion tracking.

### Running locally

```bash
export LOTBUY_DATABASE_URL="postgres://user:password@localhost:5432/lotbuy?sslmode=disable"
go run ./cmd/server
```

The API will be available at `http://localhost:8080/api`.

### Useful endpoints

| Method & Path | Description |
| --- | --- |
| `GET /api/health` | Health probe |
| `POST /api/auth/register` | Sign up a new user |
| `POST /api/auth/login` | Authenticate a user and receive a signed session token |
| `GET /api/requests` | List requests |
| `POST /api/requests` | Create a new request |
| `GET /api/requests/{id}` | View request details |
| `POST /api/requests/{id}/offers` | Submit a seller offer |
| `GET /api/requests/{id}/offers` | List offers for a request |
| `POST /api/offers/{id}/accept` | Accept an offer and open a deal |
| `GET /api/deals` | List deals with nested request/offer data |
| `GET /api/deals/{id}` | Fetch a single deal |
| `PATCH /api/deals/{id}` | Update deal status |
| `POST /api/deals/{dealId}/milestones/{milestoneId}/complete` | Mark a milestone as completed |

The responses are JSON-encoded and ready to be consumed by the frontend.
