-- 0020_notifications.sql
-- Notification system for PropLogAI

-- ─── Table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text        NOT NULL,
  title       text        NOT NULL,
  message     text,
  is_read     boolean     DEFAULT false NOT NULL,
  metadata    jsonb       DEFAULT '{}'::jsonb,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications (user_id, created_at DESC);

-- ─── RLS ────────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Helper: look up user ID by email (for admin notifications) ─
CREATE OR REPLACE FUNCTION get_user_id_by_email(target_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = auth, public
AS $$
  SELECT id FROM auth.users WHERE email = target_email LIMIT 1;
$$;

-- ─── Verify ─────────────────────────────────────────────────
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
