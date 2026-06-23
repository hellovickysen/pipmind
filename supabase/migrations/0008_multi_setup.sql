-- 0008_multi_setup.sql
-- Allow multiple setups per trade (max 5). Stores array of setup UUIDs.
-- The existing setup (text) and setup_id (uuid) columns remain for backward compatibility.

alter table trades add column if not exists setup_ids jsonb default '[]'::jsonb;
