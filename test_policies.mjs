import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'courses' });
  if (error) {
    const { data: d2, error: e2 } = await supabase.from('courses').select('*').limit(1);
    console.log(e2);
  }
}
run();
