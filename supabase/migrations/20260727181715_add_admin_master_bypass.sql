-- =============================================================================
-- Migration: Add Admin Master Bypass
-- Description: Creates a sovereign access layer for Admin Master users.
-- =============================================================================

-- 1. Create a secure function to verify if the user is an Admin Master
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT lower(public.current_user_role()) = 'admin master';
$$;

-- 2. Dynamically add the sovereign policy to all RLS-enabled tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND rowsecurity = true
    LOOP
        -- Drop the policy if it already exists to allow rerunning
        EXECUTE format('DROP POLICY IF EXISTS "rls_admin_master_bypass" ON public.%I;', r.tablename);
        
        -- Create the permissive policy for ALL operations
        EXECUTE format('
            CREATE POLICY "rls_admin_master_bypass" 
            ON public.%I 
            FOR ALL 
            TO PUBLIC 
            USING (public.is_admin()) 
            WITH CHECK (public.is_admin());
        ', r.tablename);
    END LOOP;
END
$$;
