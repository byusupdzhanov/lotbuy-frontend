CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    budget_amount NUMERIC(12,2) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_avatar_url TEXT,
    buyer_rating NUMERIC(3,2),
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    seller_name TEXT NOT NULL,
    seller_avatar_url TEXT,
    seller_rating NUMERIC(3,2),
    price_amount NUMERIC(12,2) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    due_at TIMESTAMPTZ,
    last_message_text TEXT,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS deals_offer_id_idx ON deals(offer_id);

CREATE TABLE IF NOT EXISTS deal_milestones (
    id SERIAL PRIMARY KEY,
    deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    position INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS deal_milestones_deal_id_position_idx ON deal_milestones(deal_id, position);
