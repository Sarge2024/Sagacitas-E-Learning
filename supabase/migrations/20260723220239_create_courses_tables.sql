-- 1. Create Courses table
CREATE TABLE public.courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    level TEXT,
    description TEXT,
    duration_minutes INTEGER,
    status TEXT DEFAULT 'active'::text CHECK (status IN ('active', 'blocked', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Lesson Groups (Módulos/Agrupadores de curso)
CREATE TABLE public.lesson_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Lessons (Aulas Livres, Soberanas e Imutáveis)
CREATE TABLE public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Lesson Group Items (Tabela Ponte Many-to-Many)
CREATE TABLE public.lesson_group_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_group_id UUID NOT NULL REFERENCES public.lesson_groups(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE RESTRICT,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Questions (Banco de Questões universal por Aula)
CREATE TABLE public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL, -- ex: multiple_choice, true_false, association, fill_blanks, discursive, case_study
    statement TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Armazena opções, pares de associação ou templates lacunados
    correct_answer JSONB, -- Armazena a resolução, gabarito ou critério de nota
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies: Authenticated users can read everything in the catalog
CREATE POLICY "Authenticated users can view courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view lesson groups" ON public.lesson_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view lessons" ON public.lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view lesson group items" ON public.lesson_group_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view questions" ON public.questions FOR SELECT TO authenticated USING (true);

-- Block DELETE on Lessons to guarantee Knowledge Immutability
CREATE OR REPLACE FUNCTION public.prevent_lesson_deletion()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Aulas são conhecimento universal e não podem ser apagadas. Altere seu agrupamento ou conteúdo.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER block_lesson_delete
    BEFORE DELETE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_lesson_deletion();

-- Triggers for 'updated_at'
CREATE TRIGGER on_course_updated BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_lesson_group_updated BEFORE UPDATE ON public.lesson_groups FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_lesson_updated BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_question_updated BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
