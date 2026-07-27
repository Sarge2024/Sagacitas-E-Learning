-- Refactor to many-to-many relationship for sovereign lessons and add question bank

-- 1. Alter Courses to add status
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'::text CHECK (status IN ('active', 'blocked', 'cancelled'));

-- 2. Alter Lessons to make them independent
ALTER TABLE public.lessons 
DROP COLUMN IF EXISTS lesson_group_id,
DROP COLUMN IF EXISTS sequence_order;

-- 3. Create Lesson Group Items (Many-to-Many junction)
CREATE TABLE IF NOT EXISTS public.lesson_group_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_group_id UUID NOT NULL REFERENCES public.lesson_groups(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE RESTRICT,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Questions table (Flexible structure)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL, 
    statement TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, 
    correct_answer JSONB, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable RLS and setup policies for new tables
ALTER TABLE public.lesson_group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view lesson group items" ON public.lesson_group_items;
CREATE POLICY "Authenticated users can view lesson group items" ON public.lesson_group_items FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view questions" ON public.questions;
CREATE POLICY "Authenticated users can view questions" ON public.questions FOR SELECT TO authenticated USING (true);

-- 6. Block DELETE on Lessons
CREATE OR REPLACE FUNCTION public.prevent_lesson_deletion()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Aulas são conhecimento universal e não podem ser apagadas. Altere seu agrupamento ou conteúdo.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS block_lesson_delete ON public.lessons;
CREATE TRIGGER block_lesson_delete
    BEFORE DELETE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_lesson_deletion();

-- 7. Trigger for updated_at on questions
DROP TRIGGER IF EXISTS on_question_updated ON public.questions;
CREATE TRIGGER on_question_updated BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
