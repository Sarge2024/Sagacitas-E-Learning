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
  const { data: ucs, error } = await supabase.from('knowledge_units').select('id, tenant_id').limit(10);
  console.log('Sample UCs tenant_ids:', ucs?.map((u: any) => u.tenant_id));
  
  const { data: courses } = await supabase.from('courses').select('id, tenant_id').limit(10);
  console.log('Sample Courses tenant_ids:', courses?.map((c: any) => c.tenant_id));
  
  const { data: slots } = await supabase.from('course_knowledge_units').select('uc_id').limit(10);
  console.log('Sample Slots uc_ids:', slots?.map((s: any) => s.uc_id));
}
run();
