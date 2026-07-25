-- =============================================================================
-- MIGRAÇÃO: MULTI-TENANCY COMPLETO PARA TABELAS LMS BASE
-- Adiciona tenant_id a todas as tabelas transacionais do LMS
-- Cria tenant default e backfill de dados existentes
-- =============================================================================

-- 1. Garantir que a tabela 'tenants' existe (criada no schema_expert.sql)
--    Se já existe, este bloco será ignorado pelo IF NOT EXISTS
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  nome_fantasia VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  plano_assinatura TEXT DEFAULT 'STANDARD',
  db_strategy TEXT DEFAULT 'SHARED_RLS',
  connection_string_secret_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir o Tenant Default (Sagacitas) para backfill
INSERT INTO tenants (id, slug, nome_fantasia, cnpj, plano_assinatura, db_strategy, status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'sagacitas-default',
  'Sagacitas E-Learning (Default)',
  NULL,
  'STANDARD',
  'SHARED_RLS',
  'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- 3. Adicionar tenant_id às tabelas LMS base que ainda não possuem

-- 3a. users (principal — controle de identidade)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL;

UPDATE public.users
  SET tenant_id = '00000000-0000-0000-0000-000000000001'
  WHERE tenant_id IS NULL;

-- 3b. courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

UPDATE public.courses
  SET tenant_id = '00000000-0000-0000-0000-000000000001'
  WHERE tenant_id IS NULL;

-- 3c. disciplines (módulos)
ALTER TABLE public.disciplines
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

UPDATE public.disciplines
  SET tenant_id = '00000000-0000-0000-0000-000000000001'
  WHERE tenant_id IS NULL;

-- 3d. lessons (aulas — podem ser compartilhadas entre tenants, NULL = global)
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Não forçar tenant_id em lessons: NULL = aula universal (compartilhada entre tenants)
UPDATE public.lessons
  SET tenant_id = '00000000-0000-0000-0000-000000000001'
  WHERE tenant_id IS NULL;

-- 3e. questions (banco de questões)
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

UPDATE public.questions
  SET tenant_id = '00000000-0000-0000-0000-000000000001'
  WHERE tenant_id IS NULL;

-- 3f. classes (turmas virtuais)
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

UPDATE public.classes
  SET tenant_id = '00000000-0000-0000-0000-000000000001'
  WHERE tenant_id IS NULL;

-- 3g. class_enrollments (matrículas)
ALTER TABLE public.class_enrollments
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

UPDATE public.class_enrollments
  SET tenant_id = '00000000-0000-0000-0000-000000000001'
  WHERE tenant_id IS NULL;

-- 3h. students
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

UPDATE public.students
  SET tenant_id = '00000000-0000-0000-0000-000000000001'
  WHERE tenant_id IS NULL;

-- 3i. instructors
ALTER TABLE public.instructors
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

UPDATE public.instructors
  SET tenant_id = '00000000-0000-0000-0000-000000000001'
  WHERE tenant_id IS NULL;

-- 3j. companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

UPDATE public.companies
  SET tenant_id = '00000000-0000-0000-0000-000000000001'
  WHERE tenant_id IS NULL;

-- 3k. course_categories (catálogos — podem ser globais, NULL = global)
ALTER TABLE public.course_categories
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Categorias globais ficam NULL (visíveis para todos)

-- 4. Criar índices para performance em consultas por tenant_id
CREATE INDEX IF NOT EXISTS idx_users_tenant ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_courses_tenant ON public.courses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_disciplines_tenant ON public.disciplines(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lessons_tenant ON public.lessons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_questions_tenant ON public.questions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_classes_tenant ON public.classes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_tenant ON public.class_enrollments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_students_tenant ON public.students(tenant_id);
CREATE INDEX IF NOT EXISTS idx_instructors_tenant ON public.instructors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_companies_tenant ON public.companies(tenant_id);

-- 5. Função utilitária para extrair o tenant_id do contexto da sessão atual
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::uuid;
END;
$$ LANGUAGE plpgsql STABLE;
