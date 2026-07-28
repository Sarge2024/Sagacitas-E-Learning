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
  const { data, error } = await supabase.from('courses').select('id, title, presentation, modules').limit(1);
  if (data && data.length > 0) {
    const course = data[0];
    console.log('Title:', course.title);
    const presModules = course.presentation?.modules;
    const directModules = course.modules;
    console.log('Presentation Modules length:', presModules ? presModules.length : 0);
    if (presModules) {
      console.log('Pres Lessons per module:', presModules.map((m: any) => m.lessons?.length));
    }
    console.log('Direct Modules length:', directModules ? directModules.length : 0);
    if (directModules) {
      console.log('Direct Lessons per module:', directModules.map((m: any) => m.lessons?.length));
    }
  }
}
run();
