-- 0016_referral_trigger.sql
-- Move referral reward logic to a database trigger.
-- Runs inside PostgreSQL on every trade insert — 100% reliable.

create or replace function check_referral_reward()
returns trigger
language plpgsql
security definer
as $$
declare
  v_referred_by text;
  v_referral_id uuid;
  v_referrer_id uuid;
  v_reward_given boolean;
  v_trade_count int;
begin
  -- Get the user prefs
  select referred_by into v_referred_by
  from user_preferences
  where user_id = NEW.user_id;

  -- Not referred? Skip.
  if v_referred_by is null then
    return NEW;
  end if;

  -- Get referral record
  select id, referrer_id, reward_given
  into v_referral_id, v_referrer_id, v_reward_given
  from referrals
  where referred_user_id = NEW.user_id
  limit 1;

  -- No record or already rewarded? Skip.
  if v_referral_id is null or v_reward_given = true then
    return NEW;
  end if;

  -- Count trades (including this new one)
  select count(*) into v_trade_count
  from trades
  where user_id = NEW.user_id;

  -- Need 3+ trades
  if v_trade_count < 3 then
    return NEW;
  end if;

  -- Credit both users 
  update user_preferences
  set referral_balance = coalesce(referral_balance, 0) + 1
  where user_id = NEW.user_id;

  update user_preferences
  set referral_balance = coalesce(referral_balance, 0) + 1
  where user_id = v_referrer_id;

  -- Mark as completed
  update referrals
  set status = 'completed', reward_given = true
  where id = v_referral_id;

  return NEW;
end;
$$;

-- Drop old trigger if exists, then create
drop trigger if exists trg_referral_reward on trades;

create trigger trg_referral_reward
  after insert on trades
  for each row
  execute function check_referral_reward();
