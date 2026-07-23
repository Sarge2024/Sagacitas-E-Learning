-- Rename tables to adopt the "Disciplines" nomenclature
ALTER TABLE public.lesson_groups RENAME TO disciplines;
ALTER TABLE public.lesson_group_items RENAME TO discipline_lessons;

-- Rename foreign key columns
ALTER TABLE public.discipline_lessons RENAME COLUMN lesson_group_id TO discipline_id;

-- Drop old RLS policies (using the new table names as the target)
DROP POLICY IF EXISTS "Authenticated users can view lesson groups" ON public.disciplines;
DROP POLICY IF EXISTS "Authenticated users can view lesson group items" ON public.discipline_lessons;

-- Create new RLS policies with correct names
CREATE POLICY "Authenticated users can view disciplines" ON public.disciplines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view discipline lessons" ON public.discipline_lessons FOR SELECT TO authenticated USING (true);

-- Rename Triggers
ALTER TRIGGER on_lesson_group_updated ON public.disciplines RENAME TO on_discipline_updated;
