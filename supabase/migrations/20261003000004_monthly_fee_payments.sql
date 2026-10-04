-- Create payments table for monthly fee subscriptions and exam access requests
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'monthly',
  exam_id TEXT,
  exam_title TEXT,
  amount INT NOT NULL DEFAULT 299,
  method TEXT NOT NULL DEFAULT 'bkash',
  sender_phone TEXT NOT NULL,
  trx_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  valid_until TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_trx ON payments(trx_id);
