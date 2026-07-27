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
  const courseId = '47d76d88-5b10-4a4c-98dd-05c2502d09cd';
  
  const modules = [
    {
      id: 'mod-1',
      title: 'Módulo Verificado Pela IA',
      lessons: [
        { id: 'less-1', title: 'Aula Teste RLS', uc_ids: [] }
      ]
    }
  ];

  console.log('Testing UPDATE with headers...');
  const { error, data } = await supabase
    .from('courses')
    .update({ modules })
    .eq('id', courseId)
    .select();

  console.log('Update result:', error, JSON.stringify(data, null, 2));
}

run();
