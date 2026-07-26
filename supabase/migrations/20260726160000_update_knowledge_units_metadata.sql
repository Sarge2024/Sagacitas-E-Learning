-- Migration: Update knowledge_units metadata columns
-- Add necessary columns for the frontend EdTech Expert UI (UnidadeConhecimento type)

ALTER TABLE knowledge_units
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ativo',
ADD COLUMN IF NOT EXISTS topic VARCHAR(255),
ADD COLUMN IF NOT EXISTS topic_complexity VARCHAR(50);
