import pg from 'pg';
import fs from 'fs';
const { Client } = pg;
const client = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
await client.connect();
const sql = fs.readFileSync('supabase/migrations/20260727181715_add_admin_master_bypass.sql', 'utf8');
await client.query(sql);
console.log('Migration applied');
await client.end();
