import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function test() {
  const { data: courses } = await supabase.from('courses').select('*').limit(1);
  if (!courses || courses.length === 0) { console.log('No courses'); return; }
  const courseId = courses[0].id;

  const { data: ucs } = await supabase.from('knowledge_units').select('*').limit(1);
  if (!ucs || ucs.length === 0) { console.log('No ucs'); return; }
  const ucId = ucs[0].id;

  console.log('Course:', courseId, 'UC:', ucId);

  // insert
  const { data, error } = await supabase.from('course_knowledge_units').insert([{
    course_id: courseId,
    uc_id: ucId,
    sequence_order: 1
  }]).select();
  
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Inserted:', data);
  }

  // delete
  const { error: delError } = await supabase.from('course_knowledge_units').delete().eq('course_id', courseId);
  console.log('Delete error:', delError);
}

test();
