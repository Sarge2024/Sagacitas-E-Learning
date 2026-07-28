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
  const { data: ucs, error } = await supabase.from('knowledge_units').select('id, tenant_id');
  if (ucs && ucs.length > 0) {
    console.log('Unique tenant IDs in knowledge_units:', [...new Set(ucs.map(u => u.tenant_id))]);
  }
}

run();
