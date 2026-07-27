import pg from 'pg';
const client = new pg.Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
client.connect().then(async () => {
  console.log("=== Trigger Audit ===");
  const triggers = await client.query(`
    SELECT event_object_table, trigger_name, action_statement 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
  `);
  console.log(triggers.rows);
  await client.end();
});
