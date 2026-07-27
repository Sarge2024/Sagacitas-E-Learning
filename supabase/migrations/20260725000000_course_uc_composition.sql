-- Migration: Associate Knowledge Units (UCs) to Courses
-- Creates an intermediary table for Course <-> UC composition

CREATE TABLE IF NOT EXISTS public.course_knowledge_units (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  uc_id          TEXT NOT NULL,              -- Logical reference to UC (mock or future table)
  sequence_order INTEGER NOT NULL DEFAULT 0, -- Position within the course curriculum
  aula_group     INTEGER,                    -- Optional: group number when multiple UCs share one Aula
  created_at     TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  
  UNIQUE(course_id, uc_id)
);

-- Enable Row Level Security
ALTER TABLE public.course_knowledge_units ENABLE ROW LEVEL SECURITY;

-- Read policy: anyone can view
CREATE POLICY "Allow read course_knowledge_units"
  ON public.course_knowledge_units
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Write policy: authenticated users can manage
CREATE POLICY "Allow write course_knowledge_units"
  ON public.course_knowledge_units
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
