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
  const { data: slots } = await supabase.from('course_knowledge_units').select('course_id').limit(1);
  console.log('course_id in course_knowledge_units:', slots?.[0]?.course_id);
  
  const { data: course } = await supabase.from('courses').select('id').limit(1);
  console.log('course_id in courses table:', course?.[0]?.id);
}
run();
