import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runImport() {
  console.log('🚀 Iniciando Importação Completa do Curso...');

  const dataPath = path.resolve(__dirname, 'carga_curso_mod1.json');
  const payload = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  // Obter tenant (simulado para admin master ou pegando o primeiro)
  const { data: tenants, error: tenantErr } = await supabase.from('tenants').select('id').limit(1);
  if (tenantErr || !tenants?.length) {
    console.error('❌ Falha ao obter tenant:', tenantErr);
    return;
  }
  const tenantId = tenants[0].id;
  
  // Obter company do Sarges ou primeiro available
  const { data: companies } = await supabase.from('companies').select('id').limit(1);
  const companyId = companies?.[0]?.id;

  // 1. Criar Curso
  console.log(`📦 Criando Curso: ${payload.curso.titulo}`);
  const newCourse = {
    tenant_id: tenantId,
    title: payload.curso.titulo,
    description: payload.curso.descricao,
    company_id: companyId,
    course_type: 'empresarial',
    status: 'active',
    image_url: ''
  };

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert(newCourse)
    .select('id')
    .single();

  if (courseError) {
    console.error('❌ Erro no Curso:', courseError);
    return;
  }

  // 2. Montar Módulos e Aulas para a Presentation do Course
  const moduleObj = {
    id: `mod-${payload.modulo.modulo_num}`,
    title: payload.modulo.titulo,
    focus: payload.modulo.objetivo,
    duration: '5h',
    lessons: [] as any[]
  };

  let lessonIndex = 1;
  const ucSlotsToInsert: any[] = [];
  const ucsToInsert: any[] = [];

  for (const aula of payload.aulas) {
    console.log(`📝 Processando ${aula.titulo}...`);
    const lessonObj = {
      id: `aula-${lessonIndex}`,
      number: String(lessonIndex).padStart(2, '0'),
      title: aula.titulo,
      description: aula.resumo,
      duration: '60m',
      completed: false,
      active: true
    };
    moduleObj.lessons.push(lessonObj);

    for (let i = 0; i < aula.ucs.length; i++) {
      const ucData = aula.ucs[i];
      
      // Determine bloom_level 1-6
      let bloom_level = 1;
      const bl = ucData.nivel_bloom.toLowerCase();
      if (bl.includes('compreender')) bloom_level = 2;
      else if (bl.includes('aplicar')) bloom_level = 3;
      else if (bl.includes('analisar')) bloom_level = 4;
      else if (bl.includes('avaliar')) bloom_level = 5;
      else if (bl.includes('criar') || bl.includes('sintetizar')) bloom_level = 6;

      const ucTitle = `${ucData.uc_codigo}: ${ucData.uc_titulo}`;

      // Verificar se a UC já existe
      const { data: existingUc, error: checkError } = await supabase
        .from('knowledge_units')
        .select('id')
        .eq('title', ucTitle)
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (checkError) {
        console.error(`❌ Erro ao verificar UC ${ucData.uc_codigo}:`, checkError);
        continue;
      }

      let ucId = existingUc?.id;

      if (!ucId) {
        // Inserir UC se não existir
        const { data: uc, error: ucError } = await supabase
          .from('knowledge_units')
          .insert({
            tenant_id: tenantId,
            title: ucTitle,
            description: ucData.objetivo,
            objetivo: ucData.objetivo,
            pre_requisitos: ucData.pre_requisitos,
            bloom_level: bloom_level,
            estimated_duration_minutes: 30,
            status: 'ativo',
            layout_template: { 
              version: "1.0", 
              components: ucData.slides.map((s: any, idx: number) => ({
                type: "text",
                title: s.title,
                body: s.content,
                metadata: {
                  speakerNotes: s.speakerNotes,
                  slideNumber: idx + 1
                }
              })) 
            }
          })
          .select('id')
          .single();

        if (ucError) {
          console.error(`❌ Erro na UC ${ucData.uc_codigo}:`, ucError);
          continue;
        }
        ucId = uc.id;
      }

      // Adicionar slot da UC na aula
      ucSlotsToInsert.push({
        course_id: course.id,
        uc_id: ucId,
        aula_group: lessonIndex, // The index matches the lesson inside the module
        sequence_order: i + 1
      });
    }

    lessonIndex++;
  }

  // Atualizar Presentation do Curso
  const presentationPayload = {
    id: `pres-${course.id}`,
    theme: 'default',
    modules: [moduleObj]
  };

  await supabase
    .from('courses')
    .update({ presentation: presentationPayload })
    .eq('id', course.id);

  console.log('📦 Inserindo Relacionamentos (CourseKnowledgeUnits)...');
  const { error: slotsError } = await supabase
    .from('course_knowledge_units')
    .insert(ucSlotsToInsert);

  if (slotsError) {
    console.error('❌ Erro nos Slots:', slotsError);
  }

  console.log('✅ Carga completa importada com sucesso!');
  console.log(`👉 Curso ID: ${course.id}`);
}

runImport().catch(console.error);
