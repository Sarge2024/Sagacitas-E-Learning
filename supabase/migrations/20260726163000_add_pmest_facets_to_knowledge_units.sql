-- Migration: Update knowledge_units with area and context for PMEST
-- Add necessary columns for the P (Personality/Area) and S (Space/Context) facets.

ALTER TABLE knowledge_units
ADD COLUMN IF NOT EXISTS area VARCHAR(255) DEFAULT 'Geral',
ADD COLUMN IF NOT EXISTS context VARCHAR(255) DEFAULT 'Global';
