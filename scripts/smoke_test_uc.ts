import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSmokeTest() {
  console.log('🚀 Iniciando Smoke Test do E-Learning...');

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

  // 1. Criar UC
  console.log('📦 Inserindo Unidade de Conhecimento...');
  const { data: uc, error: ucError } = await supabase
    .from('knowledge_units')
    .insert({
      tenant_id: tenantId,
      title: 'Fundamentos da Gestão Organizacional e Visão Sistêmica',
      description: 'Entender a empresa como um organismo integrado de recursos, processos, entradas, saídas e resultados.',
      objetivo: 'Entender a empresa como um organismo integrado de recursos, processos, entradas, saídas e resultados.',
      pre_requisitos: [],
      bloom_level: 2,
      estimated_duration_minutes: 45,
      status: 'ativo'
    })
    .select('id')
    .single();

  if (ucError) {
    console.error('❌ Erro na UC:', ucError);
    return;
  }

  // 2. Criar Curso
  console.log('📦 Inserindo Curso...');
  const newCourse = {
    tenant_id: tenantId,
    title: '[TESTE] Gestão Financeira Estratégica para Pequenas Empresas',
    description: 'Curso prático focado em organização, precificação e decisões financeiras.',
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

  // 3. Atualizar Course Presentation com o novo modelo (Módulo, Aula e Slides)
  console.log('📦 Vinculando Módulos, Aulas e Slides...');
  
  const presentationPayload = {
    id: 'pres-smoke',
    theme: 'default',
    modules: [
      {
        id: 'mod-1',
        title: 'Módulo 1: Primeiros Passos, Organização e Instrumentos de Registro',
        focus: 'Organizar a estrutura conceitual e alinhar a linguagem financeira.',
        duration: '1h',
        lessons: [
          {
            id: 'aula-1',
            number: '01',
            title: 'Aula 01: Visão Sistêmica e Linguagem Financeira',
            description: 'Compreensão do funcionamento da empresa e conceitos fundamentais.',
            duration: '45m',
            completed: false,
            active: true
          }
        ]
      }
    ],
    // Slides vão para course_uc_composition
  };

  await supabase
    .from('courses')
    .update({ presentation: presentationPayload })
    .eq('id', course.id);

  // 4. Inserir a UC na course_knowledge_units
  console.log('📦 Criando Composição do Curso (course_knowledge_units)...');
  const { data: slot, error: slotError } = await supabase
    .from('course_knowledge_units')
    .insert({
      course_id: course.id,
      uc_id: uc.id,
      aula_group: 1, // Lesson 1
      sequence_order: 1
    })
    .select('id')
    .single();

  if (slotError) {
    console.error('❌ Erro no Slot:', slotError);
    return;
  }

  // 5. Inserir os Slides da UC 
  console.log('📦 Inserindo Objetivos de Aprendizagem (Slides)...');
  
  const slides = [
    {
      title: "A Empresa como um Organismo Vivo",
      content: "* **Entradas:** Capital, tempo, matéria-prima e informação.\n* **Processos:** Operação, vendas e entregas.\n* **Saídas:** Produtos/Serviços, impostos e **Resultados**.\n\n> Gerir é garantir que as saídas gerem valor superior ao custo das entradas.",
      speakerNotes: "Explique aos alunos que o dinheiro não é o fim, mas o combustível da operação. Use o exemplo de um restaurante ou salão de beleza."
    },
    {
      title: "Visão Sistêmica na Prática",
      content: "* Uma decisão na venda afeta diretamente o caixa e o estoque.\n* Vender mais sem estrutura pode quebrar a empresa.\n* **Foco do Gestor:** Mapear os gargalos antes de acelerar.",
      speakerNotes: "Pergunte aos alunos se alguém já vendeu muito e mesmo assim não viu a cor do dinheiro no final do mês."
    },
    {
      title: "Desafio Mão na Massa",
      content: "1. Identifique as 3 principais **entradas de custo** do seu negócio hoje.\n2. Liste qual processo consome mais tempo da sua equipe.\n3. Defina qual é o seu principal gargalo atual.",
      speakerNotes: "Dê 3 minutos para anotações individuais e peça para 2 alunos compartilharem seus gargalos."
    }
  ];

  // In the real system, slides are learning objects or kept in layout_template
  // Update the UC to save the slides array
  await supabase
    .from('knowledge_units')
    .update({ 
      layout_template: { 
        version: "1.0", 
        components: slides.map((s, idx) => ({
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
    .eq('id', uc.id);

  console.log('✅ Smoke Test concluído com sucesso!');
  console.log('👉 IDs Gerados:');
  console.log(`- Curso: ${course.id}`);
  console.log(`- UC: ${uc.id}`);
  console.log(`- Slot: ${slot.id}`);
}

runSmokeTest().catch(console.error);
