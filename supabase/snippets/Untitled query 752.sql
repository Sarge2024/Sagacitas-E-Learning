-- 1. Remover tabela legada de objetos de aprendizagem
DROP TABLE IF EXISTS learning_objects CASCADE;

-- 2. Atualizar a tabela de UCs (Remover 'code' fixo)
ALTER TABLE knowledge_units DROP COLUMN IF EXISTS code;

-- 3. Criar a nova tabela de Assinaturas PMEST (1:N para UCs)
CREATE TABLE IF NOT EXISTS uc_pmest_signatures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    uc_id UUID NOT NULL REFERENCES knowledge_units(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em uc_pmest_signatures
ALTER TABLE uc_pmest_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation Policy for uc_pmest_signatures" ON uc_pmest_signatures
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- 4. Criar a tabela de Subgrupos de Energia (Taxonomia de Bloom)
CREATE TABLE IF NOT EXISTS uc_subgroups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    uc_id UUID NOT NULL REFERENCES knowledge_units(id) ON DELETE CASCADE,
    bloom_level_required INTEGER NOT NULL CHECK (bloom_level_required BETWEEN 1 AND 6),
    content_payload JSONB NOT NULL DEFAULT '[]'::jsonb,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em uc_subgroups
ALTER TABLE uc_subgroups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation Policy for uc_subgroups" ON uc_subgroups
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
