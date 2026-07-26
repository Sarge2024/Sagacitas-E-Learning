import { Client } from 'pg';

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully.');

    // 1. Drop existing restricted policies on companies
    console.log('Modifying companies RLS policies...');
    await client.query(`
      DROP POLICY IF EXISTS "rls_companies_select" ON public.companies;
      CREATE POLICY "rls_companies_select" ON public.companies
        FOR SELECT TO anon, authenticated
        USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

      DROP POLICY IF EXISTS "rls_companies_insert" ON public.companies;
      CREATE POLICY "rls_companies_insert" ON public.companies
        FOR INSERT TO anon, authenticated
        WITH CHECK (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "rls_companies_update" ON public.companies;
      CREATE POLICY "rls_companies_update" ON public.companies
        FOR UPDATE TO anon, authenticated
        USING (tenant_id = public.current_tenant_id());

      DROP POLICY IF EXISTS "rls_companies_delete" ON public.companies;
      CREATE POLICY "rls_companies_delete" ON public.companies
        FOR DELETE TO anon, authenticated
        USING (tenant_id = public.current_tenant_id());
    `);

    // 2. Drop existing restricted policies on users
    console.log('Modifying users RLS policies...');
    await client.query(`
      DROP POLICY IF EXISTS "rls_users_select" ON public.users;
      CREATE POLICY "rls_users_select" ON public.users
        FOR SELECT TO anon, authenticated
        USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

      DROP POLICY IF EXISTS "rls_users_update" ON public.users;
      CREATE POLICY "rls_users_update" ON public.users
        FOR UPDATE TO anon, authenticated
        USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);
    `);

    console.log('RLS policies updated successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    await client.end();
  }
}

run();
