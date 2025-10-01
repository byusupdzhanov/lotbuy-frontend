ALTER TABLE requests ADD COLUMN IF NOT EXISTS buyer_user_id INTEGER REFERENCES users(id);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS location_region TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS location_country TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS deadline_at TIMESTAMPTZ;

ALTER TABLE offers ADD COLUMN IF NOT EXISTS seller_user_id INTEGER REFERENCES users(id);

CREATE TABLE IF NOT EXISTS offer_messages (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    sender_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS offer_messages_offer_id_created_idx
    ON offer_messages(offer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    metadata JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_created_idx
    ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_id_unread_idx
    ON notifications(user_id) WHERE NOT is_read;
