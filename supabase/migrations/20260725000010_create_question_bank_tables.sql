-- Migration: Create Question Bank & Knowledge Units with Multi-Tenant RLS CRUD Policies

-- Cleanup existing tables if they exist to allow clean replay
DROP TABLE IF EXISTS public.answer_options CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.scenarios CASCADE;
DROP TABLE IF EXISTS public.knowledge_units CASCADE;

-- 1. knowledge_units (Unidades de Conhecimento)
CREATE TABLE public.knowledge_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    dimension VARCHAR(150),
    bloom_level INTEGER CHECK (bloom_level BETWEEN 1 AND 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_knowledge_units_tenant ON public.knowledge_units(tenant_id);

-- 2. scenarios (Fios Condutores)
CREATE TABLE public.scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_scenarios_tenant ON public.scenarios(tenant_id);

-- 3. questions (Questões)
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    uc_id UUID NOT NULL REFERENCES public.knowledge_units(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES public.scenarios(id) ON DELETE SET NULL,
    bloom_level_applied INTEGER CHECK (bloom_level_applied BETWEEN 1 AND 6),
    statement TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_questions_tenant ON public.questions(tenant_id);
CREATE INDEX idx_questions_uc ON public.questions(uc_id);

-- 4. answer_options (Alternativas)
CREATE TABLE public.answer_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_answer_options_tenant ON public.answer_options(tenant_id);
CREATE INDEX idx_answer_options_question ON public.answer_options(question_id);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) CONFIGURATION
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.knowledge_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_options ENABLE ROW LEVEL SECURITY;

-- Helper to extract tenant_id from auth.jwt()
-- It checks app_metadata or user_metadata for tenant_id.
-- Can be used inline: COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid

-- 1. Policies for knowledge_units
CREATE POLICY "authenticated_select_knowledge_units" ON public.knowledge_units
    FOR SELECT TO authenticated
    USING (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

CREATE POLICY "authenticated_insert_knowledge_units" ON public.knowledge_units
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

CREATE POLICY "authenticated_update_knowledge_units" ON public.knowledge_units
    FOR UPDATE TO authenticated
    USING (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid)
    WITH CHECK (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

CREATE POLICY "authenticated_delete_knowledge_units" ON public.knowledge_units
    FOR DELETE TO authenticated
    USING (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);


-- 2. Policies for scenarios
CREATE POLICY "authenticated_select_scenarios" ON public.scenarios
    FOR SELECT TO authenticated
    USING (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

CREATE POLICY "authenticated_insert_scenarios" ON public.scenarios
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

CREATE POLICY "authenticated_update_scenarios" ON public.scenarios
    FOR UPDATE TO authenticated
    USING (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid)
    WITH CHECK (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

CREATE POLICY "authenticated_delete_scenarios" ON public.scenarios
    FOR DELETE TO authenticated
    USING (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);


-- 3. Policies for questions
CREATE POLICY "authenticated_select_questions" ON public.questions
    FOR SELECT TO authenticated
    USING (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

CREATE POLICY "authenticated_insert_questions" ON public.questions
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

CREATE POLICY "authenticated_update_questions" ON public.questions
    FOR UPDATE TO authenticated
    USING (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid)
    WITH CHECK (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

CREATE POLICY "authenticated_delete_questions" ON public.questions
    FOR DELETE TO authenticated
    USING (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);


-- 4. Policies for answer_options
CREATE POLICY "authenticated_select_answer_options" ON public.answer_options
    FOR SELECT TO authenticated
    USING (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

CREATE POLICY "authenticated_insert_answer_options" ON public.answer_options
    FOR INSERT TO authenticated
    WITH CHECK (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

CREATE POLICY "authenticated_update_answer_options" ON public.answer_options
    FOR UPDATE TO authenticated
    USING (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid)
    WITH CHECK (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

CREATE POLICY "authenticated_delete_answer_options" ON public.answer_options
    FOR DELETE TO authenticated
    USING (tenant_id = COALESCE(NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'tenant_id', ''), NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'tenant_id', ''))::uuid);

-- Grant privileges on newly created tables and sequences in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, service_role, authenticated, anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated, anon;

