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
  const { data: courses } = await supabase.from('courses').select('id, title, modules').limit(1);
  if (!courses || courses.length === 0) return;
  const courseId = courses[0].id;
  
  const { data: slots } = await supabase.from('course_knowledge_units').select('id, uc_id, sequence_order, aula_group').eq('course_id', courseId);
  const { data: ucs } = await supabase.from('knowledge_units').select('id, title');
  
  console.log('Course ID:', courseId);
  console.log('Slots length:', slots?.length);
  console.log('UCs length:', ucs?.length);
  
  if (slots && slots.length > 0) {
    console.log('Sample Slots:', slots.slice(0, 5));
    
    // Test match
    let matchedCount = 0;
    for (const slot of slots) {
      if (ucs?.find(u => u.id === slot.uc_id)) {
        matchedCount++;
      }
    }
    console.log(`Matched UCs for Slots: ${matchedCount} / ${slots.length}`);
    
    // Test aula_group sequence
    const groups = [...new Set(slots.map(s => s.aula_group))];
    console.log('Distinct aula_groups in slots:', groups.sort((a,b) => a-b));
  }
}
run();
