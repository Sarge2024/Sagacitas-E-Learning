import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
await client.connect();
const res = await client.query(`
  SELECT schemaname, tablename, policyname, cmd, qual, with_check 
  FROM pg_policies 
  WHERE schemaname = 'public'
  ORDER BY tablename, cmd;
`);
console.log(JSON.stringify(res.rows, null, 2));
await client.end();
