-- Add session and trade_date columns to trades table
-- Run in Supabase Dashboard → SQL Editor → New query → paste → Run

ALTER TABLE trades ADD COLUMN IF NOT EXISTS session text;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS trade_date date;

-- Backfill trade_date from closed_at or created_at for existing trades
UPDATE trades
SET trade_date = (COALESCE(closed_at, created_at))::date
WHERE trade_date IS NULL;

-- Verify
SELECT id, pair, session, trade_date FROM trades LIMIT 10;
