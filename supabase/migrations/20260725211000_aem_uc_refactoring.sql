-- AEM-UC Refactoring (Arquitetura Educacional Modular Orientada a Unidades de Conhecimento)

-- 1. Remover tabelas monolíticas antigas (Disciplines, Lesson Groups e suas pontes)
-- O usuário aprovou a substituição da estrutura estática pela nova estrutura de UCs.
DROP TABLE IF EXISTS public.discipline_lessons CASCADE;
DROP TABLE IF EXISTS public.disciplines CASCADE;
DROP TABLE IF EXISTS public.lesson_group_items CASCADE;
DROP TABLE IF EXISTS public.lesson_groups CASCADE;

-- 2. Limpar e Refatorar course_knowledge_units para apontar pra UC real (UUID)
TRUNCATE TABLE public.course_knowledge_units CASCADE;

ALTER TABLE public.course_knowledge_units 
    DROP CONSTRAINT IF EXISTS course_knowledge_units_course_id_uc_id_key,
    DROP COLUMN uc_id,
    ADD COLUMN uc_id UUID NOT NULL REFERENCES public.knowledge_units(id) ON DELETE CASCADE,
    ADD UNIQUE(course_id, uc_id);

-- 3. Criar Objetos de Aprendizagem (OAs)
CREATE TABLE public.learning_objects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    knowledge_unit_id UUID NOT NULL REFERENCES public.knowledge_units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    bloom_level INTEGER CHECK (bloom_level >= 1 AND bloom_level <= 6),
    object_type TEXT NOT NULL CHECK (object_type IN ('video', 'reading', 'quiz', 'dre_simulation', 'case_study', 'interactive')),
    content_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_learning_objects_tenant ON public.learning_objects(tenant_id);

-- Habilitar RLS em learning_objects
ALTER TABLE public.learning_objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read learning_objects"
  ON public.learning_objects FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert learning_objects"
  ON public.learning_objects FOR INSERT TO authenticated
  WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE users.id = auth.uid()::text));

CREATE POLICY "Allow update learning_objects"
  ON public.learning_objects FOR UPDATE TO authenticated
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE users.id = auth.uid()::text));

CREATE POLICY "Allow delete learning_objects"
  ON public.learning_objects FOR DELETE TO authenticated
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE users.id = auth.uid()::text));


-- 4. Refatorar Lessons (Tornar apenas contêiner operacional)
ALTER TABLE public.lessons
    DROP COLUMN IF EXISTS content,
    DROP COLUMN IF EXISTS video_url;

-- 5. Criar Tabela Pivot N x N (lesson_learning_objects)
CREATE TABLE public.lesson_learning_objects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    learning_object_id UUID NOT NULL REFERENCES public.learning_objects(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(lesson_id, learning_object_id)
);

-- Habilitar RLS em lesson_learning_objects
ALTER TABLE public.lesson_learning_objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read lesson_learning_objects"
  ON public.lesson_learning_objects FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Allow write lesson_learning_objects"
  ON public.lesson_learning_objects FOR ALL TO authenticated
  USING (true);
