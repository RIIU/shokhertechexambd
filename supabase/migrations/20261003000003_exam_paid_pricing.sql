-- Add is_paid and price columns to exams table
ALTER TABLE exams ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS price INT DEFAULT 0;

-- Create enrollments table for paid exams
CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'bkash',
  sender_phone TEXT,
  trx_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exam_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_exam ON enrollments(user_id, exam_id);
