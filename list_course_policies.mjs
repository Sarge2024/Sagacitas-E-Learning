import pg from 'pg';
const client = new pg.Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
client.connect().then(() => {
  return client.query(`
    SELECT policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'courses';
  `);
}).then(res => {
  console.log(JSON.stringify(res.rows, null, 2));
  return client.end();
});
