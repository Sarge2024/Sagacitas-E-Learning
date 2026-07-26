import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully.');

    // 1. Re-create public schema to start fresh
    console.log('Cleaning up public schema...');
    await client.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    await client.query('GRANT ALL ON SCHEMA public TO postgres;');
    await client.query('GRANT ALL ON SCHEMA public TO public;');
    await client.query('GRANT ALL ON SCHEMA public TO anon;');
    await client.query('GRANT ALL ON SCHEMA public TO authenticated;');
    await client.query('GRANT ALL ON SCHEMA public TO service_role;');

    // Ensure schema migrations table is clean
    await client.query('TRUNCATE TABLE supabase_migrations.schema_migrations;');

    // 2. Read and sort migrations
    const migrationsDir = '/mnt/46F84CA3F84C935B/SAGACITAS_SaaS/Projeto E-Learning/Sagacitas-E-Learning/supabase/migrations';
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Sort alphabetically/chronologically

    console.log(`Found ${files.length} migrations to apply.`);

    for (const file of files) {
      const version = file.split('_')[0];
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`Applying migration ${file}...`);
      
      // Execute the migration SQL
      await client.query(sql);

      // Record migration
      await client.query(
        'INSERT INTO supabase_migrations.schema_migrations (version) VALUES ($1) ON CONFLICT (version) DO NOTHING;',
        [version]
      );
    }

    console.log('All migrations applied successfully!');

    // 3. Apply custom RLS overrides for companies and users to allow anon access
    console.log('Applying RLS overrides for anon access on companies and users...');
    await client.query(`
      -- Companies policies
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

      -- Users policies
      DROP POLICY IF EXISTS "rls_users_select" ON public.users;
      CREATE POLICY "rls_users_select" ON public.users
        FOR SELECT TO anon, authenticated
        USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);

      DROP POLICY IF EXISTS "rls_users_update" ON public.users;
      CREATE POLICY "rls_users_update" ON public.users
        FOR UPDATE TO anon, authenticated
        USING (tenant_id = public.current_tenant_id() OR tenant_id IS NULL);
    `);
    console.log('RLS overrides applied successfully!');

  } catch (error) {
    console.error('Error running manual migrations:', error);
  } finally {
    await client.end();
  }
}

run();
