import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
await client.connect();
const res = await client.query(`
  SELECT tablename, policyname 
  FROM pg_policies 
  WHERE policyname = 'rls_admin_master_bypass'
  ORDER BY tablename;
`);
console.log(res.rows);
await client.end();
