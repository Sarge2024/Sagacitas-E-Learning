import pg from 'pg';
const client = new pg.Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
client.connect().then(async () => {
  const func = await client.query(`
    SELECT prosrc 
    FROM pg_proc 
    WHERE proname = 'prevent_lesson_deletion'
  `);
  console.log(func.rows[0].prosrc);
  await client.end();
});
