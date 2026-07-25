import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// ID Padrão do Tenant
const TENANT_ID = "00000000-0000-0000-0000-000000000000";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Erro: VITE_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY não configurados no .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// PAYLOADS DE DADOS
// ==========================================

const ucs = [
  { code: "UC-CC-01", title: "Fontes de Financiamento", bloom_level: 2, dimension: "Objeto" },
  { code: "UC-CC-02", title: "Custo de Oportunidade e Risco", bloom_level: 4, dimension: "Objeto" },
  { code: "UC-CC-03", title: "Cálculo do Custo de Terceiros (Kd)", bloom_level: 3, dimension: "Operacao" },
  { code: "UC-CC-04", title: "Ponderação da Estrutura de Capital", bloom_level: 3, dimension: "Operacao" },
  { code: "UC-CC-05", title: "Apuração do WACC / CMPC", bloom_level: 4, dimension: "Integracao" },
  { code: "UC-CC-06", title: "Tomada de Decisão com a TMA", bloom_level: 5, dimension: "Integracao" }
];

const scenarioPayload = {
  title: "Caso Metalúrgica Silva",
  content: "A Metalúrgica Silva planeja adquirir uma nova máquina de corte a laser para expandir sua produção. O equipamento custa R$ 200.000,00. O empresário, Sr. João, possui R$ 100.000,00 disponíveis no caixa da empresa e precisará captar o restante no mercado. A taxa básica de juros (Selic/CDI) está em 10% ao ano. O banco ofereceu um empréstimo para os R$ 100.000,00 faltantes com uma taxa de juros de 15% ao ano. O negócio do Sr. João é considerado de risco moderado."
};

interface QuestionPayload {
  uc_code: string;
  bloom_level_applied: number;
  statement: string;
  options: {
    text: string;
    is_correct: boolean;
    feedback?: string;
  }[];
}

const questions: QuestionPayload[] = [
  {
    uc_code: "UC-CC-01",
    bloom_level_applied: 2,
    statement: "Para financiar a máquina de R$ 200.000,00, como os recursos devem ser classificados na estrutura de capital da empresa?",
    options: [
      { text: "R$ 200.000,00 como Capital Próprio, pois a máquina pertencerá à empresa.", is_correct: false, feedback: "Incorreto. Apenas metade do valor pertence à empresa (capital próprio)." },
      { text: "R$ 100.000,00 como Capital de Terceiros e R$ 100.000,00 como Capital Próprio.", is_correct: true, feedback: "Correto! O empréstimo bancário representa capital de terceiros, e o caixa interno representa capital próprio." },
      { text: "R$ 200.000,00 como Capital de Terceiros, pois é um novo investimento.", is_correct: false, feedback: "Incorreto. O caixa interno não é capital de terceiros." },
      { text: "Apenas os R$ 100.000,00 do banco entram no cálculo.", is_correct: false, feedback: "Incorreto. A estrutura de capital abrange tanto fontes próprias quanto de terceiros." }
    ]
  },
  {
    uc_code: "UC-CC-02",
    bloom_level_applied: 4,
    statement: "O Sr. João afirma: 'Usar os R$ 100.000,00 do caixa é ótimo porque não tem custo nenhum'. Essa afirmação está correta?",
    options: [
      { text: "Sim, o capital próprio não gera despesas com juros.", is_correct: false, feedback: "Incorreto. Embora não haja juros explícitos, existe o custo de oportunidade." },
      { text: "Não. O capital próprio possui um custo de oportunidade atrelado ao risco do negócio.", is_correct: true, feedback: "Correto! O dinheiro do caixa poderia ser investido em outras alternativas ou render juros." }
    ]
  },
  {
    uc_code: "UC-CC-03",
    bloom_level_applied: 3,
    statement: "Com IR/CSLL a 34%, qual o comportamento correto do custo da dívida bancária de 15% ao ano?",
    options: [
      { text: "O custo real da dívida permanecerá 15% ao ano.", is_correct: false, feedback: "Incorreto. Os juros pagos diminuem o lucro tributável, gerando um benefício fiscal." },
      { text: "O custo real será menor que 15% ao ano devido ao benefício fiscal (dedutibilidade dos juros).", is_correct: true, feedback: "Correto! O custo líquido de impostos (Kd) será 15% * (1 - 0.34) = 9.9% a.a." }
    ]
  },
  {
    uc_code: "UC-CC-04",
    bloom_level_applied: 3,
    statement: "Qual é a ponderação (peso) da estrutura de capital a ser utilizada no projeto (Total: R$ 200k)?",
    options: [
      { text: "100% Capital de Terceiros.", is_correct: false, feedback: "Incorreto. Metade vem do capital próprio da empresa." },
      { text: "50% Capital Próprio e 50% Capital de Terceiros.", is_correct: true, feedback: "Correto! Cada fonte contribui com R$ 100.000,00 de um total de R$ 200.000,00." }
    ]
  },
  {
    uc_code: "UC-CC-05",
    bloom_level_applied: 4,
    statement: "Se o Custo do Capital Próprio exigido é de 20% a.a. e o de Terceiros (líquido de IR) é de 10% a.a., qual o WACC (Custo Médio) usando 50% de cada?",
    options: [
      { text: "30% ao ano.", is_correct: false, feedback: "Incorreto. O WACC é a média ponderada, não a soma dos custos." },
      { text: "15% ao ano.", is_correct: true, feedback: "Correto! WACC = (0.5 * 20%) + (0.5 * 10%) = 15% a.a." }
    ]
  },
  {
    uc_code: "UC-CC-06",
    bloom_level_applied: 5,
    statement: "Se a máquina gerar uma TIR de 14% a.a. e o WACC da empresa é de 15% a.a., o que decidir?",
    options: [
      { text: "Comprar, pois 14% é maior que a taxa Selic (10%).", is_correct: false, feedback: "Incorreto. O projeto destrói valor pois a TIR é menor que o custo de capital médio." },
      { text: "Rejeitar, pois o projeto rende (14%) menos do que o custo para financiá-lo (15%).", is_correct: true, feedback: "Correto! O retorno é inferior ao custo médio ponderado de captação." }
    ]
  }
];

// ==========================================
// LAÇO PRINCIPAL DE EXECUÇÃO
// ==========================================

(async () => {
  console.log("🚀 Iniciando seed de Diagnóstico Completo (Custo de Capital)...");
  console.log(`🏢 Tenant ID: ${TENANT_ID}`);

  try {
    // ----------------------------------------------------
    // Fase 1: Upsert das Unidades de Conhecimento (UCs)
    // ----------------------------------------------------
    console.log("\n📚 Fase 1: Cadastrando/Atualizando UCs...");
    const ucPayload = ucs.map(u => ({
      tenant_id: TENANT_ID,
      code: u.code,
      title: u.title,
      bloom_level: u.bloom_level,
      dimension: u.dimension,
      updated_at: new Date().toISOString()
    }));

    const { data: insertedUcs, error: ucError } = await supabase
      .from("knowledge_units")
      .upsert(ucPayload, { onConflict: "code" })
      .select();

    if (ucError) throw ucError;
    console.log(`✅ UCs inseridas/atualizadas com sucesso! Total: ${insertedUcs?.length}`);

    // Mapeia código da UC para ID do banco
    const ucMap: Record<string, string> = {};
    insertedUcs?.forEach(u => {
      ucMap[u.code] = u.id;
    });

    // ----------------------------------------------------
    // Fase 2: Inserção do Cenário (Fio Condutor)
    // ----------------------------------------------------
    console.log("\n📦 Fase 2: Buscando ou criando Cenário...");
    let scenarioId: string;

    const { data: existingScenario, error: scFindError } = await supabase
      .from("scenarios")
      .select("id")
      .eq("tenant_id", TENANT_ID)
      .eq("title", scenarioPayload.title)
      .maybeSingle();

    if (scFindError) throw scFindError;

    if (existingScenario) {
      scenarioId = existingScenario.id;
      console.log(`ℹ️ Cenário existente encontrado (ID: ${scenarioId}). Atualizando conteúdo...`);
      const { error: scUpdateError } = await supabase
        .from("scenarios")
        .update({ content: scenarioPayload.content, updated_at: new Date().toISOString() })
        .eq("id", scenarioId);
      if (scUpdateError) throw scUpdateError;
    } else {
      const { data: newScenario, error: scInsertError } = await supabase
        .from("scenarios")
        .insert({
          tenant_id: TENANT_ID,
          title: scenarioPayload.title,
          content: scenarioPayload.content
        })
        .select()
        .single();

      if (scInsertError) throw scInsertError;
      scenarioId = newScenario.id;
      console.log(`✅ Novo Cenário criado com sucesso (ID: ${scenarioId})!`);
    }

    // ----------------------------------------------------
    // Fase 3 e 4: Inserção de Questões e Alternativas
    // ----------------------------------------------------
    console.log("\n📝 Fase 3 & 4: Inserindo Questões e Alternativas...");
    
    for (const q of questions) {
      const ucId = ucMap[q.uc_code];
      if (!ucId) {
        console.warn(`⚠️ Aviso: UC ${q.uc_code} não encontrada no mapeamento. Pulando questão.`);
        continue;
      }

      // Verifica se a questão já existe para este cenário e enunciado
      const { data: existingQuestion, error: qFindError } = await supabase
        .from("questions")
        .select("id")
        .eq("tenant_id", TENANT_ID)
        .eq("scenario_id", scenarioId)
        .eq("statement", q.statement)
        .maybeSingle();

      if (qFindError) throw qFindError;

      let questionId: string;

      if (existingQuestion) {
        questionId = existingQuestion.id;
        console.log(`ℹ️ Questão para UC [${q.uc_code}] já existe. Atualizando dados...`);
        const { error: qUpdateError } = await supabase
          .from("questions")
          .update({
            uc_id: ucId,
            bloom_level_applied: q.bloom_level_applied,
            updated_at: new Date().toISOString()
          })
          .eq("id", questionId);
        if (qUpdateError) throw qUpdateError;
      } else {
        const { data: newQuestion, error: qInsertError } = await supabase
          .from("questions")
          .insert({
            tenant_id: TENANT_ID,
            uc_id: ucId,
            scenario_id: scenarioId,
            bloom_level_applied: q.bloom_level_applied,
            statement: q.statement,
            is_active: true
          })
          .select()
          .single();

        if (qInsertError) throw qInsertError;
        questionId = newQuestion.id;
        console.log(`✅ Nova Questão cadastrada para UC [${q.uc_code}] (ID: ${questionId})`);
      }

      // Remover alternativas anteriores para evitar duplicidades
      const { error: optionsDeleteError } = await supabase
        .from("answer_options")
        .delete()
        .eq("question_id", questionId);

      if (optionsDeleteError) throw optionsDeleteError;

      // Inserir as novas alternativas
      const optionsPayload = q.options.map(opt => ({
        tenant_id: TENANT_ID,
        question_id: questionId,
        text: opt.text,
        is_correct: opt.is_correct,
        feedback: opt.feedback
      }));

      const { error: optionsInsertError } = await supabase
        .from("answer_options")
        .insert(optionsPayload);

      if (optionsInsertError) throw optionsInsertError;
      console.log(`  - ➔ Alternativas associadas com sucesso.`);
    }

    console.log("\n🎉 Seed completo de diagnóstico executado com sucesso no banco de dados!");
  } catch (error: any) {
    console.error("\n❌ Ocorreu um erro durante a execução do seed:");
    console.error(error.message || error);
    process.exit(1);
  }
})();
