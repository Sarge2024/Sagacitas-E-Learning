DROP POLICY IF EXISTS "rls_courses_select" ON public.courses;
CREATE POLICY "rls_courses_select"
  ON public.courses FOR SELECT TO anon, authenticated
  USING (
    course_type IN ('avulso', 'formador')
    OR lower(public.current_user_role()) IN ('admin', 'administrador', 'master', 'admin master', 'instructor', 'instrutor', 'operator', 'gestor', 'operador')
    OR (
      course_type IN ('empresarial', 'sistema') 
      AND company_id::TEXT = public.current_company_id()
    )
  );
