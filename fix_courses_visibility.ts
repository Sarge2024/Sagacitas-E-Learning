import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use service role to bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Updating courses to course_type = avulso...');
  const { data, error } = await supabase
    .from('courses')
    .update({ course_type: 'avulso' })
    .neq('course_type', 'avulso');
    
  if (error) {
    console.error('Update Error:', error);
  } else {
    console.log('Updated courses successfully.');
  }
}
run();
