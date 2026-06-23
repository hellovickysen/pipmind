-- Migration: Remove unused profiles table
-- The app uses auth.users + user_preferences, never reads from profiles.
-- The handle_new_user() trigger inserted into profiles on signup — update it
-- to only create the free subscription row.

-- Step 1: Update the trigger function to stop inserting into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (new.id, 'free', 'active');
  RETURN new;
END;
$$;

-- Step 2: Drop the profiles table (and its RLS policy)
DROP POLICY IF EXISTS "own profile" ON public.profiles;
DROP TABLE IF EXISTS public.profiles;
