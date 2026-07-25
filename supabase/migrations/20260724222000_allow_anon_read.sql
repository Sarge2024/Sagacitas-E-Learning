-- Create policies to allow anon (unauthenticated) users to SELECT from catalog tables.
-- This ensures the frontend client using the anon key can load the catalog.

CREATE POLICY "Anonymous users can view courses" 
    ON public.courses FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can view course categories" 
    ON public.course_categories FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can view disciplines" 
    ON public.disciplines FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can view lessons" 
    ON public.lessons FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can view discipline lessons" 
    ON public.discipline_lessons FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can view questions" 
    ON public.questions FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can view instructors" 
    ON public.instructors FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can view classes" 
    ON public.classes FOR SELECT TO anon USING (true);
