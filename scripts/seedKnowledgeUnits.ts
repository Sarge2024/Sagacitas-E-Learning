import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// ID Padrão do Tenant (ex: Admin Master / Global Tenant)
const DEFAULT_TENANT_ID = process.env.SEED_TENANT_ID || "11111111-1111-1111-1111-111111111111";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Recomenda-se utilizar a SERVICE_ROLE_KEY para ignorar restrições RLS em seeds administrativos
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Erro: Variáveis VITE_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY não configuradas no .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Definição das UCs do Módulo de Custo de Capital
interface SeedUC {
  code: string;
  title: string;
  bloom_level: number;
  dimension: string;
}

const ucsToSeed: SeedUC[] = [
  {
    code: "UC-CC-01",
    title: "Fontes de Financiamento",
    bloom_level: 2,
    dimension: "Objeto"
  },
  {
    code: "UC-CC-02",
    title: "Custo de Oportunidade e Risco",
    bloom_level: 4,
    dimension: "Objeto"
  },
  {
    code: "UC-CC-03",
    title: "Cálculo do Custo de Terceiros (Kd)",
    bloom_level: 3,
    dimension: "Operacao"
  },
  {
    code: "UC-CC-04",
    title: "Ponderação da Estrutura de Capital",
    bloom_level: 3,
    dimension: "Operacao"
  },
  {
    code: "UC-CC-05",
    title: "Apuração do WACC / CMPC",
    bloom_level: 4,
    dimension: "Integracao"
  },
  {
    code: "UC-CC-06",
    title: "Tomada de Decisão com a TMA",
    bloom_level: 5,
    dimension: "Integracao"
  }
];

(async () => {
  console.log("🚀 Iniciando seed das Unidades de Conhecimento (Custo de Capital)...");
  console.log(`🏢 Utilizando Tenant ID: ${DEFAULT_TENANT_ID}`);

  // Mapeia para o schema das colunas do banco, incluindo o tenant_id
  const payload = ucsToSeed.map(uc => ({
    tenant_id: DEFAULT_TENANT_ID,
    code: uc.code,
    title: uc.title,
    bloom_level: uc.bloom_level,
    dimension: uc.dimension,
    updated_at: new Date().toISOString()
  }));

  try {
    // Realiza o upsert das UCs resolvendo conflitos na coluna 'code'
    const { data, error } = await supabase
      .from("knowledge_units")
      .upsert(payload, { onConflict: "code" })
      .select();

    if (error) {
      throw error;
    }

    console.log("✅ Seed finalizado com sucesso!");
    if (data && data.length > 0) {
      console.log(`📊 Total de UCs registradas/atualizadas: ${data.length}`);
      data.forEach(item => {
        console.log(`  - [${item.code}] ${item.title} (ID: ${item.id})`);
      });
    }
  } catch (err: any) {
    console.error("❌ Falha crítica ao executar o seed de UCs:");
    console.error(err.message || err);
    process.exit(1);
  }
})();
