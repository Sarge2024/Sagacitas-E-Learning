-- 1. Create Instructors table
CREATE TABLE public.instructors (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Virtual Classes (Turmas)
CREATE TABLE public.classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discipline_id UUID NOT NULL REFERENCES public.disciplines(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES public.instructors(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_students INTEGER NOT NULL DEFAULT 100,
    status TEXT DEFAULT 'active'::text CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Class Enrollments (Matrículas dos Alunos nas Turmas)
CREATE TABLE public.class_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(class_id, student_id) -- Impede que o mesmo aluno seja matriculado 2x na mesma turma
);

-- 4. Enable Row Level Security
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Instructors: Anyone authenticated can see instructors (for catalogs)
CREATE POLICY "Authenticated users can view instructors" ON public.instructors FOR SELECT TO authenticated USING (true);
-- Classes: Authenticated users can view classes
CREATE POLICY "Authenticated users can view classes" ON public.classes FOR SELECT TO authenticated USING (true);
-- Enrollments: Students can only view their own enrollments, Instructors can view enrollments of their classes
CREATE POLICY "Students can view their own enrollments" ON public.class_enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Instructors can view enrollments for their classes" ON public.class_enrollments FOR SELECT USING (
    class_id IN (SELECT id FROM public.classes WHERE instructor_id = auth.uid())
);

-- 6. Logic to enforce Max Students (Lotação Máxima)
CREATE OR REPLACE FUNCTION public.check_class_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    capacity_limit INTEGER;
BEGIN
    -- Busca a capacidade e quantos já estão matriculados
    SELECT max_students INTO capacity_limit FROM public.classes WHERE id = NEW.class_id;
    SELECT count(*) INTO current_count FROM public.class_enrollments WHERE class_id = NEW.class_id;
    
    IF current_count >= capacity_limit THEN
        RAISE EXCEPTION 'A turma já atingiu o limite técnico de % alunos.', capacity_limit;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_class_capacity
    BEFORE INSERT ON public.class_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.check_class_capacity();

-- 7. Triggers for 'updated_at'
CREATE TRIGGER on_instructor_updated BEFORE UPDATE ON public.instructors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER on_class_updated BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
