import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data } = await supabase
    .from('courses')
    .select('id, title, modules')
    .eq('id', '47d76d88-5b10-4a4c-98dd-05c2502d09cd')
    .single();

  console.log(JSON.stringify(data, null, 2));
}

run();
