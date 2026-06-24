-- 0017_beta_counter.sql
-- Site settings table for admin-controlled values (beta counter, etc.)

create table if not exists site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- Seed the beta counter
insert into site_settings (key, value) values ('beta_count', '15')
on conflict (key) do nothing;

-- RLS: anyone can read, only admin can update
alter table site_settings enable row level security;

create policy "Anyone can read site settings"
  on site_settings for select
  using (true);

create policy "Only admin can update site settings"
  on site_settings for update
  using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

create policy "Only admin can insert site settings"
  on site_settings for insert
  with check (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));
