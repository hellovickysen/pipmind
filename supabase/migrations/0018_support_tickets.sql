-- Migration 0018: Support tickets system
create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,
  category text not null check (category in ('bug', 'platform_issue', 'feature_request', 'general_support', 'account_billing')),
  subject text not null,
  description text not null,
  screenshot_url text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  admin_reply text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table support_tickets enable row level security;

-- Users can read their own tickets
create policy "Users can read own tickets"
  on support_tickets for select
  using (auth.uid() = user_id);

-- Users can create tickets
create policy "Users can insert own tickets"
  on support_tickets for insert
  with check (auth.uid() = user_id);

-- Index for admin queries
create index if not exists idx_support_tickets_status on support_tickets(status);
create index if not exists idx_support_tickets_created on support_tickets(created_at desc);
create index if not exists idx_support_tickets_user on support_tickets(user_id);
