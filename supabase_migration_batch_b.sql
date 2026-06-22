-- Batch B migration: add screenshot_urls jsonb array to journal_entries
-- Run this in Supabase Dashboard → SQL Editor → New query → paste → Run

-- Add the new column
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS screenshot_urls jsonb DEFAULT '[]'::jsonb;

-- Migrate existing single screenshot_url data into the array
UPDATE journal_entries
SET screenshot_urls = jsonb_build_array(screenshot_url)
WHERE screenshot_url IS NOT NULL
  AND screenshot_url != ''
  AND (screenshot_urls IS NULL OR screenshot_urls = '[]'::jsonb);

-- Verify
SELECT id, screenshot_url, screenshot_urls FROM journal_entries LIMIT 10;
