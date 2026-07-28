import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.rpc('run_sql', { sql_query: `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'knowledge_units';
  ` });
  
  if (error) {
    console.log('RPC error:', error);
    // If run_sql fails, we can just do a select with limit 1 and get keys
    const { data: ucs, error: err } = await supabase.from('knowledge_units').select('*').limit(1);
    if (ucs && ucs.length > 0) {
      console.log('Columns from select:', Object.keys(ucs[0]));
    } else {
      console.log('Select error:', err);
    }
  } else {
    console.log('Schema:', data);
  }
}

run();
