INSERT INTO requests (id, title, description, budget_amount, currency_code, buyer_name, buyer_avatar_url, buyer_rating, image_url, status, created_at, updated_at)
VALUES
  (
    1,
    'Looking for MacBook Pro M3 Max 32GB',
    'Need a brand new or lightly used MacBook Pro with AppleCare.',
    10000.00,
    'USD',
    'Denis Ivanov',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop&crop=face',
    4.9,
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    'in_progress',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 days'
  ),
  (
    2,
    'Need 6 ergonomic office chairs',
    'Looking for bulk order with quick delivery in EU.',
    1500.00,
    'USD',
    'Maria Gomez',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    4.8,
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
    'completed',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '3 days'
  );

INSERT INTO offers (id, request_id, seller_name, seller_avatar_url, seller_rating, price_amount, currency_code, message, status, created_at, updated_at)
VALUES
  (
    1,
    1,
    'Elena Petrova',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=80&h=80&fit=crop&crop=face',
    4.7,
    9800.00,
    'USD',
    'Brand new MacBook available with AppleCare. Ships within 48 hours.',
    'accepted',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 days'
  ),
  (
    2,
    2,
    'Workspace Supplies LLC',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop&crop=face',
    4.6,
    1320.00,
    'USD',
    'Can ship from warehouse tomorrow with tracking provided.',
    'accepted',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '8 days'
  );

INSERT INTO deals (id, request_id, offer_id, status, total_amount, currency_code, due_at, last_message_text, last_message_at, created_at, updated_at)
VALUES
  (
    1,
    1,
    1,
    'awaiting_payment',
    9800.00,
    'USD',
    NOW() + INTERVAL '12 hours',
    'Payment request sent. Waiting for buyer confirmation.',
    NOW() - INTERVAL '15 minutes',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '15 minutes'
  ),
  (
    2,
    2,
    2,
    'completed',
    1320.00,
    'USD',
    NOW() - INTERVAL '8 days',
    'Deal completed. Leave a review for the seller?',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '2 days'
  );

INSERT INTO deal_milestones (deal_id, label, position, completed, completed_at)
VALUES
  (1, 'Offer accepted', 1, TRUE, NOW() - INTERVAL '2 days'),
  (1, 'Payment', 2, FALSE, NULL),
  (1, 'Shipment', 3, FALSE, NULL),
  (1, 'Confirmation', 4, FALSE, NULL),
  (2, 'Offer accepted', 1, TRUE, NOW() - INTERVAL '10 days'),
  (2, 'Payment', 2, TRUE, NOW() - INTERVAL '9 days'),
  (2, 'Shipment', 3, TRUE, NOW() - INTERVAL '8 days'),
  (2, 'Confirmation', 4, TRUE, NOW() - INTERVAL '2 days');

SELECT setval('requests_id_seq', (SELECT MAX(id) FROM requests));
SELECT setval('offers_id_seq', (SELECT MAX(id) FROM offers));
SELECT setval('deals_id_seq', (SELECT MAX(id) FROM deals));
SELECT setval('deal_milestones_id_seq', (SELECT MAX(id) FROM deal_milestones));
