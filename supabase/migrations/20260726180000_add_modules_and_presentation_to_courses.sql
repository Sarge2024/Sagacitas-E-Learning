-- Migração para adicionar campos de módulos e slides à tabela de cursos
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS modules JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS presentation JSONB DEFAULT NULL;

-- Recarregar cache do PostgREST
NOTIFY pgrst, 'reload schema';
