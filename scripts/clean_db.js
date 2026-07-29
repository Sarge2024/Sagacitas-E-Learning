import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  console.log('🧹 Limpando dados do banco de dados...');
  
  // Apagar relacionamentos
  await supabase.from('course_knowledge_units').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('uc_pmest_signatures').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  // Apagar cursos e UCs
  await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('knowledge_units').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('✅ Banco limpo!');
}

clean().catch(console.error);
