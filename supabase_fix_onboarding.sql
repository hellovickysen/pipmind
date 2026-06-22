-- Fix: ensure existing users have onboarding_complete = true
-- so the sidebar shows correctly.
-- Run in Supabase Dashboard → SQL Editor

-- Insert a preferences row for any user who doesn't have one yet,
-- and mark them as onboarded (they're existing users, not new signups).
INSERT INTO user_preferences (user_id, onboarding_complete)
SELECT id, true FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_preferences)
ON CONFLICT (user_id) DO UPDATE SET onboarding_complete = true;

-- Also set any existing rows that have null or false
UPDATE user_preferences SET onboarding_complete = true
WHERE onboarding_complete IS NOT true;

-- Verify
SELECT user_id, onboarding_complete FROM user_preferences;
