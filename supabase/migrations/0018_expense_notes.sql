-- Add optional notes field to expenses table
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS notes text;