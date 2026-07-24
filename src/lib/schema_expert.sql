-- =============================================================================
-- ESQUEMA COMPLETO EDTECH EXPERT: MULTI-TENANCY, TAXONOMIA DE BLOOM & DNT
-- Executar este script no editor SQL do Supabase
-- =============================================================================

-- 1. TIPOS ENUMERADOS
CREATE TYPE bloom_level AS ENUM (
  'CONHECIMENTO', 
  'COMPREENSAO', 
  'APLICACAO_SIMPLES', 
  'APLICACAO_MEDIO', 
  'APLICACAO_COMPLEXO', 
  'ANALISE', 
  'AVALIACAO', 
  'SINTESE'
);

CREATE TYPE tenant_plan AS ENUM ('FREE', 'STANDARD', 'PRO', 'ENTERPRISE');
CREATE TYPE tenant_db_type AS ENUM ('SHARED_RLS', 'DEDICATED_DB');
CREATE TYPE complexidade_level AS ENUM ('SIMPLES', 'MEDIO', 'COMPLEXO');

-- 2. TABELA DE TENANTS (ORGANIZAÇÕES CLIENTES)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  nome_fantasia VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  plano_assinatura tenant_plan DEFAULT 'STANDARD',
  db_strategy tenant_db_type DEFAULT 'SHARED_RLS',
  connection_string_secret_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE API KEYS DOS TENANTS
CREATE TABLE IF NOT EXISTS tenant_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  nome_identificador VARCHAR(100) NOT NULL,
  scopes JSONB NOT NULL DEFAULT '["dnt:read", "uc:read"]'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  revogada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TELEMETRIA DE USO E FATURAMENTO (USAGE METERING)
CREATE TABLE IF NOT EXISTS tenant_usage_logs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  metrica VARCHAR(50) NOT NULL,
  quantidade INT DEFAULT 1,
  metadata JSONB,
  registrado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_tenant_periodo ON tenant_usage_logs(tenant_id, metrica, registrado_em);

-- 5. UNIDADES DE CONHECIMENTO (O CORE ATÔMICO)
CREATE TABLE IF NOT EXISTS unidades_conhecimento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- NULL se for UC global/prateleira
  codigo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao_curta TEXT,
  layout_template JSONB NOT NULL DEFAULT '{}'::jsonb,
  meta_bloom bloom_level NOT NULL DEFAULT 'CONHECIMENTO',
  duracao_estimada_minutos INT DEFAULT 15,
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_uc_tenant_codigo UNIQUE(tenant_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_uc_bloom ON unidades_conhecimento(meta_bloom);
CREATE INDEX IF NOT EXISTS idx_uc_tenant ON unidades_conhecimento(tenant_id);

-- 6. MATRIZ DE COMPETÊNCIAS & COMPONENTES
CREATE TABLE IF NOT EXISTS matriz_competencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  cargo_alvo VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_competencia_tenant_codigo UNIQUE(tenant_id, codigo)
);

CREATE TABLE IF NOT EXISTS competencia_unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competencia_id UUID REFERENCES matriz_competencias(id) ON DELETE CASCADE,
  unidade_id UUID REFERENCES unidades_conhecimento(id) ON DELETE CASCADE,
  nivel_minimo_exigido bloom_level NOT NULL,
  ordem_sequencial INT NOT NULL,
  obrigatoria BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (competencia_id, unidade_id)
);

-- 7. BANCO DE QUESTÕES (BLOOM + COMPLEXIDADE)
CREATE TABLE IF NOT EXISTS banco_questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  unidade_id UUID REFERENCES unidades_conhecimento(id) ON DELETE CASCADE,
  enunciado TEXT NOT NULL,
  tipo_questao VARCHAR(50) NOT NULL DEFAULT 'multipla_escolha',
  nivel_bloom bloom_level NOT NULL,
  complexidade complexidade_level NOT NULL DEFAULT 'SIMPLES',
  opcoes JSONB DEFAULT '[]'::jsonb,
  gabarito_justificativa TEXT,
  peso NUMERIC(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questoes_uc_bloom ON banco_questoes(unidade_id, nivel_bloom, complexidade);

-- 8. DIAGNÓSTICO DNT & MATRIZ DE PROFICIÊNCIA DO COLABORADOR
CREATE TABLE IF NOT EXISTS diagnosticos_dnt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  competencia_id UUID REFERENCES matriz_competencias(id) ON DELETE CASCADE,
  configuracao_calibracao JSONB NOT NULL DEFAULT '{"regua_corte_percentual": 80}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matriz_proficiencia_colaborador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL,
  unidade_id UUID REFERENCES unidades_conhecimento(id) ON DELETE CASCADE,
  nivel_bloom_dominado bloom_level NOT NULL,
  score_percentual NUMERIC(5,2) NOT NULL,
  isentado BOOLEAN DEFAULT FALSE,
  data_diagnostico TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validade_ate TIMESTAMP WITH TIME ZONE,
  CONSTRAINT uq_proficiencia_colab_uc UNIQUE(tenant_id, colaborador_id, unidade_id)
);

-- 9. HABILITAÇÃO DE ROW LEVEL SECURITY (RLS) MULTI-TENANT
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_conhecimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriz_competencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE banco_questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos_dnt ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriz_proficiencia_colaborador ENABLE ROW LEVEL SECURITY;

-- Policiamento RLS para Unidades de Conhecimento (Tenant próprio ou UC Global Prateleira)
CREATE POLICY rls_uc_tenant_policy ON unidades_conhecimento
  FOR ALL
  USING (
    tenant_id IS NULL OR 
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  );

-- Policiamento RLS para Matriz de Proficiência DNT
CREATE POLICY rls_proficiencia_tenant_policy ON matriz_proficiencia_colaborador
  FOR ALL
  USING (
    tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
  );
