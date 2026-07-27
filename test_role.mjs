import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  global: {
    headers: {
      'x-tenant-id': '00000000-0000-0000-0000-000000000001',
      'x-user-role': 'Administrador'
    }
  }
});

async function run() {
  const { data, error } = await supabase.rpc('current_user_role');
  console.log('Role:', data, error);
}

run();
