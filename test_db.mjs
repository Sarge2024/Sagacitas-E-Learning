import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  global: {
    headers: {
      'x-tenant-id': '00000000-0000-0000-0000-000000000001',
      'x-user-role': 'student',
      'x-company-id': '00000000-0000-0000-0000-000000000001'
    }
  }
});

async function run() {
  const payload = {
    title: 'Test Sistema 3',
    course_type: 'sistema',
    company_id: '12345678-1234-1234-1234-123456789012',
    system_name: 'TestSystem',
    tenant_id: '00000000-0000-0000-0000-000000000001'
  };

  const { error, data } = await supabase
    .from('courses')
    .insert(payload)
    .select();

  console.log('Result:', error);
}
run();
