-- Adicionando metadados pedagógicos na tabela de UCs (Unidades de Conhecimento)

ALTER TABLE public.knowledge_units
ADD COLUMN IF NOT EXISTS pre_requisitos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS layout_template JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS objetivo TEXT;
