-- Allow anon to write to course_knowledge_units for development
CREATE POLICY "Allow anon write course_knowledge_units"
  ON public.course_knowledge_units
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
