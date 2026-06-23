-- 0009_expense_tracker.sql
-- Phase 7A: Prop Firm Expense Tracker — expenses and payouts

-- 1. Expenses table (challenge fees, renewals, activations)
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  firm_name text not null,
  account_type text check (account_type in ('futures', 'cfd')),
  account_size text,
  purchase_type text check (purchase_type in ('new', 'renewal', 'activation')),
  account_cost numeric,
  num_accounts int default 1,
  total_cost numeric not null,
  expense_date date default current_date,
  created_at timestamptz default now()
);

-- 2. Payouts table
create table if not exists payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  firm_name text not null,
  amount numeric not null,
  payout_date date default current_date,
  notes text,
  created_at timestamptz default now()
);

-- 3. RLS
alter table expenses enable row level security;

create policy "Users can view own expenses"
  on expenses for select using (auth.uid() = user_id);
create policy "Users can insert own expenses"
  on expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses"
  on expenses for update using (auth.uid() = user_id);
create policy "Users can delete own expenses"
  on expenses for delete using (auth.uid() = user_id);

alter table payouts enable row level security;

create policy "Users can view own payouts"
  on payouts for select using (auth.uid() = user_id);
create policy "Users can insert own payouts"
  on payouts for insert with check (auth.uid() = user_id);
create policy "Users can update own payouts"
  on payouts for update using (auth.uid() = user_id);
create policy "Users can delete own payouts"
  on payouts for delete using (auth.uid() = user_id);

-- 4. Indexes
create index if not exists idx_expenses_user_id on expenses(user_id);
create index if not exists idx_expenses_user_firm on expenses(user_id, firm_name);
create index if not exists idx_payouts_user_id on payouts(user_id);
