import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase
    .from('courses')
    .select('id, title, tenant_id, company_id')
    .eq('title', 'Alchymist Manager | Dominando a DRE do Restaurante')
    .single();

  console.log(JSON.stringify(data, null, 2));
}

run();
