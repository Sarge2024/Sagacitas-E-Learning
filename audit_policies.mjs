import pg from 'pg';
const client = new pg.Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
client.connect().then(async () => {
  console.log("=== RLS Policy Audit ===");
  
  // 1. Check for restrictive policies (these override permissive ones)
  const restrictive = await client.query(`
    SELECT tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND permissive = 'RESTRICTIVE'
  `);
  console.log(`\nRestrictive Policies found: ${restrictive.rows.length}`);
  if (restrictive.rows.length > 0) {
    console.log(restrictive.rows);
  }

  // 2. Check if all tables with RLS have the bypass policy applied properly
  const rlsTables = await client.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' AND rowsecurity = true
  `);
  
  const tablesWithoutBypass = [];
  const tablesWithFlawedBypass = [];
  
  for (const row of rlsTables.rows) {
    const table = row.tablename;
    const policies = await client.query(`
      SELECT policyname, roles, cmd, permissive
      FROM pg_policies 
      WHERE tablename = $1 AND policyname = 'rls_admin_master_bypass'
    `, [table]);
    
    if (policies.rows.length === 0) {
      tablesWithoutBypass.push(table);
    } else {
      const p = policies.rows[0];
      // Check if it's applying to all operations and roles properly
      if (p.cmd !== 'ALL' || !p.roles.includes('public') && !p.roles.includes('PUBLIC')) {
        tablesWithFlawedBypass.push({ table, config: p });
      }
    }
  }
  
  console.log(`\nTables with RLS enabled: ${rlsTables.rows.length}`);
  
  if (tablesWithoutBypass.length > 0) {
    console.log("⚠️ Tables missing bypass policy:", tablesWithoutBypass);
  } else {
    console.log("✅ All RLS tables have the bypass policy.");
  }
  
  if (tablesWithFlawedBypass.length > 0) {
    console.log("⚠️ Tables with flawed bypass configuration:", tablesWithFlawedBypass);
  } else {
    console.log("✅ All bypass policies are correctly configured (ALL operations, PUBLIC role).");
  }

  // 3. Verify function is_admin() logic
  const func = await client.query(`
    SELECT prosrc 
    FROM pg_proc 
    WHERE proname = 'is_admin'
  `);
  console.log(`\nis_admin function source:\n${func.rows[0].prosrc}`);

  await client.end();
});
