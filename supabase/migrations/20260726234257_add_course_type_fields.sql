-- =============================================================================
-- Migração: Adiciona campos de tipo de curso e políticas restritivas
-- =============================================================================

ALTER TABLE public.courses
ADD COLUMN course_type VARCHAR(50) CHECK (course_type IN ('avulso', 'sistema', 'formador', 'empresarial')) DEFAULT 'avulso',
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
ADD COLUMN system_name TEXT;

-- Funções para buscar custom headers enviados pelo PostgREST
CREATE OR REPLACE FUNCTION public.current_company_id() RETURNS TEXT AS $$
  SELECT current_setting('request.headers', true)::json->>'x-company-id';
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION public.current_user_role() RETURNS TEXT AS $$
  SELECT current_setting('request.headers', true)::json->>'x-user-role';
$$ LANGUAGE SQL STABLE;

-- Substituir a política pública genérica por uma restrita aos tipos de curso
DROP POLICY IF EXISTS "rls_courses_select_public" ON public.courses;
DROP POLICY IF EXISTS "rls_courses_select" ON public.courses;

CREATE POLICY "rls_courses_select"
  ON public.courses FOR SELECT TO anon, authenticated
  USING (
    course_type IN ('avulso', 'formador')
    OR public.current_user_role() IN ('admin', 'instructor', 'operator')
    OR (
      course_type IN ('empresarial', 'sistema') 
      AND company_id::TEXT = public.current_company_id()
    )
  );
