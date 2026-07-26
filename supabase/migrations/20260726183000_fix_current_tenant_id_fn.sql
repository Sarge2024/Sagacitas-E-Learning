-- =============================================================================
-- MIGRAÇÃO: CORREÇÃO DE POLÍTICAS RLS PARA CLIENT WEB (ANON)
-- 1. Permite extrair o tenant_id tanto de app.current_tenant_id (Node backend/scripts)
--    quanto do header customizado 'x-tenant-id' do PostgREST (Supabase Web Client).
-- 2. Permite que o papel 'anon' execute operações DML sob a restrição do tenant_id.
-- =============================================================================

-- 1. Atualizar função de resolução de tenant
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
DECLARE
  tenant_str TEXT;
BEGIN
  -- Tenta obter de app.current_tenant_id (Node.js/Backend/Scripts)
  tenant_str := current_setting('app.current_tenant_id', true);
  
  -- Tenta obter do header request.headers (PostgREST/Supabase Web Client)
  IF tenant_str IS NULL OR tenant_str = '' THEN
    BEGIN
      tenant_str := current_setting('request.headers', true)::json->>'x-tenant-id';
    EXCEPTION WHEN OTHERS THEN
      tenant_str := NULL;
    END;
  END IF;

  -- Fallback para o tenant padrão
  IF tenant_str IS NULL OR tenant_str = '' THEN
    tenant_str := '00000000-0000-0000-0000-000000000001';
  END IF;

  RETURN tenant_str::uuid;
END;
$$ LANGUAGE plpgsql STABLE;


-- 2. Atualizar Políticas de RLS da tabela 'courses'
DROP POLICY IF EXISTS "rls_courses_insert" ON public.courses;
CREATE POLICY "rls_courses_insert" ON public.courses 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "rls_courses_update" ON public.courses;
CREATE POLICY "rls_courses_update" ON public.courses 
  FOR UPDATE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "rls_courses_delete" ON public.courses;
CREATE POLICY "rls_courses_delete" ON public.courses 
  FOR DELETE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());


-- 3. Atualizar Políticas de RLS da tabela 'course_knowledge_units'
DROP POLICY IF EXISTS "rls_course_uc_select" ON public.course_knowledge_units;
CREATE POLICY "rls_course_uc_select" ON public.course_knowledge_units 
  FOR SELECT TO anon, authenticated 
  USING (true);

DROP POLICY IF EXISTS "rls_course_uc_write" ON public.course_knowledge_units;
CREATE POLICY "rls_course_uc_write" ON public.course_knowledge_units 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (true);

DROP POLICY IF EXISTS "rls_course_uc_update" ON public.course_knowledge_units;
CREATE POLICY "rls_course_uc_update" ON public.course_knowledge_units 
  FOR UPDATE TO anon, authenticated 
  USING (true);

DROP POLICY IF EXISTS "rls_course_uc_delete" ON public.course_knowledge_units;
CREATE POLICY "rls_course_uc_delete" ON public.course_knowledge_units 
  FOR DELETE TO anon, authenticated 
  USING (true);


-- 4. Atualizar Políticas de RLS da tabela 'knowledge_units'
DROP POLICY IF EXISTS "authenticated_select_knowledge_units" ON public.knowledge_units;
DROP POLICY IF EXISTS "select_knowledge_units" ON public.knowledge_units;
CREATE POLICY "select_knowledge_units" ON public.knowledge_units 
  FOR SELECT TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_insert_knowledge_units" ON public.knowledge_units;
DROP POLICY IF EXISTS "insert_knowledge_units" ON public.knowledge_units;
CREATE POLICY "insert_knowledge_units" ON public.knowledge_units 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_update_knowledge_units" ON public.knowledge_units;
DROP POLICY IF EXISTS "update_knowledge_units" ON public.knowledge_units;
CREATE POLICY "update_knowledge_units" ON public.knowledge_units 
  FOR UPDATE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_delete_knowledge_units" ON public.knowledge_units;
DROP POLICY IF EXISTS "delete_knowledge_units" ON public.knowledge_units;
CREATE POLICY "delete_knowledge_units" ON public.knowledge_units 
  FOR DELETE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());


-- 5. Habilitar RLS e criar Políticas na tabela 'uc_pmest_signatures'
ALTER TABLE public.uc_pmest_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_signatures" ON public.uc_pmest_signatures;
CREATE POLICY "select_signatures" ON public.uc_pmest_signatures 
  FOR SELECT TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "insert_signatures" ON public.uc_pmest_signatures;
CREATE POLICY "insert_signatures" ON public.uc_pmest_signatures 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "update_signatures" ON public.uc_pmest_signatures;
CREATE POLICY "update_signatures" ON public.uc_pmest_signatures 
  FOR UPDATE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "delete_signatures" ON public.uc_pmest_signatures;
CREATE POLICY "delete_signatures" ON public.uc_pmest_signatures 
  FOR DELETE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());


-- 6. Habilitar RLS e criar Políticas na tabela 'uc_subgroups'
ALTER TABLE public.uc_subgroups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_subgroups" ON public.uc_subgroups;
CREATE POLICY "select_subgroups" ON public.uc_subgroups 
  FOR SELECT TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "insert_subgroups" ON public.uc_subgroups;
CREATE POLICY "insert_subgroups" ON public.uc_subgroups 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "update_subgroups" ON public.uc_subgroups;
CREATE POLICY "update_subgroups" ON public.uc_subgroups 
  FOR UPDATE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "delete_subgroups" ON public.uc_subgroups;
CREATE POLICY "delete_subgroups" ON public.uc_subgroups 
  FOR DELETE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());


-- 7. Atualizar Políticas de RLS de Questionário
DROP POLICY IF EXISTS "authenticated_select_scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "select_scenarios" ON public.scenarios;
CREATE POLICY "select_scenarios" ON public.scenarios 
  FOR SELECT TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_insert_scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "insert_scenarios" ON public.scenarios;
CREATE POLICY "insert_scenarios" ON public.scenarios 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_update_scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "update_scenarios" ON public.scenarios;
CREATE POLICY "update_scenarios" ON public.scenarios 
  FOR UPDATE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_delete_scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "delete_scenarios" ON public.scenarios;
CREATE POLICY "delete_scenarios" ON public.scenarios 
  FOR DELETE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_select_questions" ON public.questions;
DROP POLICY IF EXISTS "select_questions" ON public.questions;
CREATE POLICY "select_questions" ON public.questions 
  FOR SELECT TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_insert_questions" ON public.questions;
DROP POLICY IF EXISTS "insert_questions" ON public.questions;
CREATE POLICY "insert_questions" ON public.questions 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_update_questions" ON public.questions;
DROP POLICY IF EXISTS "update_questions" ON public.questions;
CREATE POLICY "update_questions" ON public.questions 
  FOR UPDATE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_delete_questions" ON public.questions;
DROP POLICY IF EXISTS "delete_questions" ON public.questions;
CREATE POLICY "delete_questions" ON public.questions 
  FOR DELETE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_select_answer_options" ON public.answer_options;
DROP POLICY IF EXISTS "select_answer_options" ON public.answer_options;
CREATE POLICY "select_answer_options" ON public.answer_options 
  FOR SELECT TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_insert_answer_options" ON public.answer_options;
DROP POLICY IF EXISTS "insert_answer_options" ON public.answer_options;
CREATE POLICY "insert_answer_options" ON public.answer_options 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_update_answer_options" ON public.answer_options;
DROP POLICY IF EXISTS "update_answer_options" ON public.answer_options;
CREATE POLICY "update_answer_options" ON public.answer_options 
  FOR UPDATE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "authenticated_delete_answer_options" ON public.answer_options;
DROP POLICY IF EXISTS "delete_answer_options" ON public.answer_options;
CREATE POLICY "delete_answer_options" ON public.answer_options 
  FOR DELETE TO anon, authenticated 
  USING (tenant_id = public.current_tenant_id());
