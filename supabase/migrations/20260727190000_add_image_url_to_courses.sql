-- Add image_url column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS image_url TEXT;

-- For UI fallback consistency, if we wanted to backfill existing rows we could do so here, 
-- but it's handled in the frontend logic.
