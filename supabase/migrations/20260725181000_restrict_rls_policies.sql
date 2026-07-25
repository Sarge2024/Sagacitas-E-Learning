-- =============================================================================
-- MIGRAÇÃO: RESTRIÇÃO DE POLÍTICAS RLS — BLINDAGEM MULTI-TENANT
-- Revoga políticas abertas (anon USING true) e aplica filtro por tenant_id
-- =============================================================================

-- =============================================================================
-- PARTE 1: REVOGAR POLÍTICAS ABERTAS INSEGURAS
-- =============================================================================

-- 1a. users — revogar políticas USING(true) para anon
DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert access to users" ON public.users;
DROP POLICY IF EXISTS "Allow public update access to users" ON public.users;

-- 1b. students — revogar políticas abertas
DROP POLICY IF EXISTS "Anonymous users can view students" ON public.students;
DROP POLICY IF EXISTS "Allow anon/authenticated insert on students" ON public.students;
DROP POLICY IF EXISTS "Allow anon/authenticated update on students" ON public.students;

-- 1c. instructors — revogar políticas abertas
DROP POLICY IF EXISTS "Anonymous users can view instructors" ON public.instructors;
DROP POLICY IF EXISTS "Allow anon/authenticated insert on instructors" ON public.instructors;
DROP POLICY IF EXISTS "Allow anon/authenticated update on instructors" ON public.instructors;

-- 1d. classes — revogar políticas abertas
DROP POLICY IF EXISTS "Anonymous users can view classes" ON public.classes;
DROP POLICY IF EXISTS "Allow anon/authenticated insert on classes" ON public.classes;
DROP POLICY IF EXISTS "Allow anon/authenticated update on classes" ON public.classes;

-- 1e. class_enrollments — revogar políticas abertas
DROP POLICY IF EXISTS "Anonymous users can view class_enrollments" ON public.class_enrollments;
DROP POLICY IF EXISTS "Allow anon/authenticated insert on class_enrollments" ON public.class_enrollments;
DROP POLICY IF EXISTS "Allow anon/authenticated update on class_enrollments" ON public.class_enrollments;

-- 1f. courses — revogar política anon read (será recriada com tenant filter)
DROP POLICY IF EXISTS "Anonymous users can view courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can view courses" ON public.courses;

-- 1g. disciplines
DROP POLICY IF EXISTS "Anonymous users can view disciplines" ON public.disciplines;
DROP POLICY IF EXISTS "Authenticated users can view disciplines" ON public.disciplines;
DROP POLICY IF EXISTS "Authenticated users can view lesson groups" ON public.disciplines;

-- 1h. lessons
DROP POLICY IF EXISTS "Anonymous users can view lessons" ON public.lessons;
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.lessons;

-- 1i. questions
DROP POLICY IF EXISTS "Anonymous users can view questions" ON public.questions;
DROP POLICY IF EXISTS "Authenticated users can view questions" ON public.questions;

-- 1j. discipline_lessons
DROP POLICY IF EXISTS "Anonymous users can view discipline lessons" ON public.discipline_lessons;
DROP POLICY IF EXISTS "Authenticated users can view lesson group items" ON public.discipline_lessons;

-- 1k. course_knowledge_units
DROP POLICY IF EXISTS "Allow anon write course_knowledge_units" ON public.course_knowledge_units;

-- 1l. companies
DROP POLICY IF EXISTS "Students can view their own company" ON public.companies;


-- =============================================================================
-- PARTE 2: CRIAR NOVAS POLÍTICAS RESTRITIVAS COM FILTRO POR tenant_id
-- =============================================================================

-- Helper: extrair tenant_id do contexto de sessão
-- (função já criada na migração anterior: public.current_tenant_id())

-- --------------------------------------------------------------------------
-- 2a. users — SELECT/INSERT/UPDATE apenas para authenticated, filtrado por tenant
-- --------------------------------------------------------------------------
CREATE POLICY "rls_users_select"
  ON public.users FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

CREATE POLICY "rls_users_insert"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

CREATE POLICY "rls_users_update"
  ON public.users FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

-- NOTA: Mantém acesso anon para registro (Firebase Auth cria o perfil via client anon)
CREATE POLICY "rls_users_anon_insert"
  ON public.users FOR INSERT TO anon
  WITH CHECK (true);

-- --------------------------------------------------------------------------
-- 2b. students — apenas authenticated, filtrado por tenant
-- --------------------------------------------------------------------------
CREATE POLICY "rls_students_select"
  ON public.students FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

CREATE POLICY "rls_students_insert"
  ON public.students FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

CREATE POLICY "rls_students_update"
  ON public.students FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

-- --------------------------------------------------------------------------
-- 2c. instructors — apenas authenticated, filtrado por tenant
-- --------------------------------------------------------------------------
CREATE POLICY "rls_instructors_select"
  ON public.instructors FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

CREATE POLICY "rls_instructors_insert"
  ON public.instructors FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

CREATE POLICY "rls_instructors_update"
  ON public.instructors FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

-- --------------------------------------------------------------------------
-- 2d. courses — catálogo público (anon SELECT), escrita restrita a authenticated + tenant
-- --------------------------------------------------------------------------
CREATE POLICY "rls_courses_select_public"
  ON public.courses FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "rls_courses_insert"
  ON public.courses FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "rls_courses_update"
  ON public.courses FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- --------------------------------------------------------------------------
-- 2e. disciplines — herda acesso do curso (leitura pública, escrita tenant)
-- --------------------------------------------------------------------------
CREATE POLICY "rls_disciplines_select_public"
  ON public.disciplines FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "rls_disciplines_insert"
  ON public.disciplines FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "rls_disciplines_update"
  ON public.disciplines FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- --------------------------------------------------------------------------
-- 2f. lessons — leitura pública (catálogo), escrita tenant
-- --------------------------------------------------------------------------
CREATE POLICY "rls_lessons_select_public"
  ON public.lessons FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "rls_lessons_insert"
  ON public.lessons FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

CREATE POLICY "rls_lessons_update"
  ON public.lessons FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

-- --------------------------------------------------------------------------
-- 2g. questions — leitura pública, escrita tenant
-- --------------------------------------------------------------------------
CREATE POLICY "rls_questions_select_public"
  ON public.questions FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "rls_questions_insert"
  ON public.questions FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "rls_questions_update"
  ON public.questions FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- --------------------------------------------------------------------------
-- 2h. classes — apenas authenticated, filtrado por tenant
-- --------------------------------------------------------------------------
CREATE POLICY "rls_classes_select"
  ON public.classes FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

CREATE POLICY "rls_classes_insert"
  ON public.classes FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "rls_classes_update"
  ON public.classes FOR UPDATE TO authenticated
  USING (tenant_id = public.current_tenant_id());

-- --------------------------------------------------------------------------
-- 2i. class_enrollments — apenas authenticated, filtrado por tenant
-- --------------------------------------------------------------------------
CREATE POLICY "rls_enrollments_select"
  ON public.class_enrollments FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

CREATE POLICY "rls_enrollments_insert"
  ON public.class_enrollments FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

-- --------------------------------------------------------------------------
-- 2j. companies — apenas authenticated, filtrado por tenant
-- --------------------------------------------------------------------------
CREATE POLICY "rls_companies_select"
  ON public.companies FOR SELECT TO authenticated
  USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

CREATE POLICY "rls_companies_insert"
  ON public.companies FOR INSERT TO authenticated
  WITH CHECK (tenant_id = public.current_tenant_id());

-- --------------------------------------------------------------------------
-- 2k. course_categories — catálogo público (leitura para todos)
-- --------------------------------------------------------------------------
CREATE POLICY "rls_categories_select_public"
  ON public.course_categories FOR SELECT TO anon, authenticated
  USING (true);

-- --------------------------------------------------------------------------
-- 2l. discipline_lessons (tabela ponte) — leitura pública
-- --------------------------------------------------------------------------
CREATE POLICY "rls_discipline_lessons_select_public"
  ON public.discipline_lessons FOR SELECT TO anon, authenticated
  USING (true);

-- --------------------------------------------------------------------------
-- 2m. course_knowledge_units — apenas authenticated + tenant
-- --------------------------------------------------------------------------
CREATE POLICY "rls_course_uc_select"
  ON public.course_knowledge_units FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "rls_course_uc_write"
  ON public.course_knowledge_units FOR INSERT TO authenticated
  WITH CHECK (true);
