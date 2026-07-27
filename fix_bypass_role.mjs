import pg from 'pg';
const client = new pg.Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
client.connect().then(async () => {
  const tablesRes = await client.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND rowsecurity = true
  `);
  
  for (const row of tablesRes.rows) {
    const table = row.tablename;
    await client.query(`DROP POLICY IF EXISTS "rls_admin_master_bypass" ON public."${table}";`);
    await client.query(`
      CREATE POLICY "rls_admin_master_bypass" 
      ON public."${table}" 
      FOR ALL 
      TO PUBLIC 
      USING (public.is_admin()) 
      WITH CHECK (public.is_admin());
    `);
    console.log(`Re-created policy for ${table}`);
  }
  
  await client.end();
});
