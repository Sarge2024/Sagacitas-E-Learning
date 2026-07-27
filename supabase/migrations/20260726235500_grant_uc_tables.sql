-- =============================================================================
-- Migration to grant privileges on UC tables
-- =============================================================================

GRANT ALL PRIVILEGES ON TABLE public.knowledge_units TO anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.uc_pmest_signatures TO anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.uc_subgroups TO anon, authenticated;
