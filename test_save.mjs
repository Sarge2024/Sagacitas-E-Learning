import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const courseId = '47d76d88-5b10-4a4c-98dd-05c2502d09cd';
  
  // Fake modules
  const modules = [
    {
      id: 'mod-1',
      title: 'Modulo Teste',
      lessons: [
        { id: 'less-1', title: 'Aula Teste', uc_ids: [] }
      ]
    }
  ];

  console.log('Updating courses with modules...');
  const { error: courseError, data } = await supabase
    .from('courses')
    .update({ modules })
    .eq('id', courseId)
    .select();

  console.log('Update result:', courseError, data);
}

run();
