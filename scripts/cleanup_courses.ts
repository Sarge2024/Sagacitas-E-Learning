import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("🚀 Lendo cursos do banco...");
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, modules');
  
  if (error) {
    console.error("❌ Erro:", error);
    return;
  }
  
  console.log("=== CURSOS EXISTENTES ===");
  courses?.forEach(c => {
    console.log(`ID: ${c.id} | Title: ${c.title} | Modules: ${c.modules?.length || 0}`);
  });

  // Agrupar por título
  const groups: Record<string, typeof courses> = {};
  courses?.forEach(c => {
    if (!groups[c.title]) groups[c.title] = [];
    groups[c.title].push(c);
  });

  for (const title of Object.keys(groups)) {
    const list = groups[title];
    if (list.length > 1) {
      console.log(`\n⚠️ Encontrado duplicados para: "${title}"`);
      // Encontrar o curso com mais módulos (ou o primeiro com módulos)
      list.sort((a, b) => (b.modules?.length || 0) - (a.modules?.length || 0));
      const keep = list[0];
      const toDelete = list.slice(1);
      
      console.log(`👉 Manter: ID ${keep.id} (${keep.modules?.length || 0} módulos)`);
      for (const del of toDelete) {
        console.log(`🗑️ Deletando: ID ${del.id} (${del.modules?.length || 0} módulos)`);
        
        // Deletar dependências de slots primeiro (CourseKnowledgeUnits)
        const { error: delSlotsErr } = await supabase
          .from('course_knowledge_units')
          .delete()
          .eq('course_id', del.id);
          
        if (delSlotsErr) {
          console.error(`❌ Erro ao deletar slots do curso ${del.id}:`, delSlotsErr);
          continue;
        }

        const { error: delErr } = await supabase
          .from('courses')
          .delete()
          .eq('id', del.id);
          
        if (delErr) {
          console.error(`❌ Erro ao deletar curso ${del.id}:`, delErr);
        } else {
          console.log(`✅ Deletado curso ${del.id}`);
        }
      }
    }
  }
}

run().catch(console.error);
