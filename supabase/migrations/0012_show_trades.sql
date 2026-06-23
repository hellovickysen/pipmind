-- 0012_show_trades.sql
-- Add show_trades toggle for public profile trade list

alter table user_preferences
  add column if not exists show_trades boolean default false;

-- Allow public read of trades for users who enabled trade list sharing
create policy "Public trade list access"
  on trades for select
  using (
    exists (
      select 1 from user_preferences
      where user_preferences.user_id = trades.user_id
      and user_preferences.share_code is not null
      and user_preferences.show_trades = true
    )
  );
