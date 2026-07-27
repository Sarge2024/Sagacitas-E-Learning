-- =============================================================================
-- Migration to fix role matching in RLS for courses
-- =============================================================================

DROP POLICY IF EXISTS "rls_courses_select" ON public.courses;

CREATE POLICY "rls_courses_select"
  ON public.courses FOR SELECT TO anon, authenticated
  USING (
    course_type IN ('avulso', 'formador')
    OR public.current_user_role() IN ('admin', 'Administrador', 'instructor', 'Instrutor', 'operator', 'Gestor', 'Operador')
    OR (
      course_type IN ('empresarial', 'sistema') 
      AND company_id::TEXT = public.current_company_id()
    )
  );
