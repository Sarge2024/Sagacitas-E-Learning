-- Migration: Create taxonomy_options table and seed initial options

CREATE TABLE IF NOT EXISTS taxonomy_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (tenant_id, category, code)
);

-- Seed Initial Data
-- Tenant can be NULL or we can assume there's a default tenant or seed them without tenant and let queries handle global options.
-- If the application isolates by tenant_id, we should allow tenant_id IS NULL to act as "Global" system-wide options.

INSERT INTO taxonomy_options (tenant_id, category, code, name)
VALUES 
  -- AREAS (P)
  (NULL, 'AREA', 'SAG', 'SAG (Geral)'),
  (NULL, 'AREA', 'FIN', 'Finanças'),
  (NULL, 'AREA', 'OPE', 'Operações'),
  (NULL, 'AREA', 'TEC', 'Tecnologia'),
  (NULL, 'AREA', 'MKT', 'Marketing'),
  (NULL, 'AREA', 'HR', 'Recursos Humanos'),

  -- CONTEXTOS (S)
  (NULL, 'CONTEXT', 'GLOBAL', 'Global (Prateleira)'),
  (NULL, 'CONTEXT', 'CORP', 'Corporativo'),
  (NULL, 'CONTEXT', 'B2B', 'B2B (Empresas)'),
  (NULL, 'CONTEXT', 'B2C', 'B2C (Alunos Varejo)'),
  (NULL, 'CONTEXT', 'INT', 'Interno (Staff)')
ON CONFLICT (tenant_id, category, code) DO NOTHING;

-- Grant privileges so the frontend can read/write the table
GRANT ALL PRIVILEGES ON TABLE taxonomy_options TO anon, authenticated;
