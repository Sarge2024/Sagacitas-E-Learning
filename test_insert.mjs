import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  global: {
    headers: {
      'x-tenant-id': '00000000-0000-0000-0000-000000000001',
      'x-user-role': 'Administrador',
      'x-user-company-id': ''
    }
  }
});

async function run() {
  const payload = {
    title: 'Test Sistema 2',
    course_type: 'sistema',
    company_id: '00000000-0000-0000-0000-000000000002', // Assuming this might fail FK if it doesn't exist?
    system_name: 'TestSystem',
    tenant_id: '00000000-0000-0000-0000-000000000001'
  };

  console.log('Testing INSERT with headers...');
  const { error, data } = await supabase
    .from('courses')
    .insert(payload)
    .select();

  console.log('Insert result:', error, JSON.stringify(data, null, 2));
}

run();
