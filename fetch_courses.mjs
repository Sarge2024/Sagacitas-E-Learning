import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = 'http://127.0.0.1:54321';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testUpdate() {
  const testModules = [
    {
      id: 'mod-1',
      title: 'Módulo 1 - Fundamentos',
      lessons: [
        { id: 'less-1', title: 'Aula 1 - Introdução', uc_ids: [] }
      ]
    }
  ];

  const { data, error } = await supabase
    .from('courses')
    .update({ modules: testModules })
    .eq('id', '47d76d88-5b10-4a4c-98dd-05c2502d09cd')
    .select('id, title, modules')
    .single();
    
  console.log('Update Error:', error);
  console.log('Updated Data:', JSON.stringify(data, null, 2));
}

testUpdate();
