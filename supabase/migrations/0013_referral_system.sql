-- 0013_referral_system.sql
-- Referral System: unique links, $1 credit on 3rd trade, credit balance

-- Referral codes (one per user)
create table if not exists referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text unique not null,
  created_at timestamptz default now()
);

-- Referral tracking
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_user_id uuid references auth.users(id) on delete set null,
  referred_email text,
  status text default 'pending' check (status in ('pending', 'completed')),
  reward_given boolean default false,
  created_at timestamptz default now()
);

-- Add referral columns to user_preferences
alter table user_preferences
  add column if not exists referral_balance numeric default 0,
  add column if not exists referred_by text;

-- RLS
alter table referral_codes enable row level security;

create policy "Users can view own referral code"
  on referral_codes for select using (auth.uid() = user_id);
create policy "Users can create own referral code"
  on referral_codes for insert with check (auth.uid() = user_id);

alter table referrals enable row level security;

create policy "Referrers can view own referrals"
  on referrals for select using (auth.uid() = referrer_id);
create policy "System can insert referrals"
  on referrals for insert with check (auth.uid() = referrer_id or auth.uid() = referred_user_id);
create policy "System can update referrals"
  on referrals for update using (auth.uid() = referrer_id or auth.uid() = referred_user_id);

-- Indexes
create index if not exists idx_referral_codes_user on referral_codes(user_id);
create index if not exists idx_referral_codes_code on referral_codes(code);
create index if not exists idx_referrals_referrer on referrals(referrer_id);
create index if not exists idx_referrals_referred on referrals(referred_user_id);
