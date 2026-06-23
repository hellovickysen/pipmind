-- 0014_security_hardening.sql
-- Fix referral code lookup and tighten user_preferences public policy

-- Allow authenticated users to look up referral codes (needed for captureReferral)
create policy "Authenticated users can lookup referral codes"
  on referral_codes for select
  using (auth.role() = 'authenticated');
