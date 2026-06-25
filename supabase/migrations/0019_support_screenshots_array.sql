-- Migration 0019: Support multiple screenshots per ticket
alter table support_tickets add column if not exists screenshot_urls jsonb default '[]'::jsonb;
