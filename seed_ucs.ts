import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

const MOCK_UNIDADES = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    code: 'FIN-DRE-01',
    title: 'Demonstração do Resultado do Exercício (DRE)',
    bloom_level: 2,
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    code: 'FIN-DRE-02',
    title: 'Margem de Contribuição',
    bloom_level: 2,
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    code: 'OPS-SAG-01',
    title: 'Auditoria de Processos Sagacitas Builder em Lojas',
    bloom_level: 4,
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    code: 'FIN-DRE-03',
    title: 'Impostos e Tributos',
    bloom_level: 2,
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    code: 'FIN-DRE-04',
    title: 'Plano de Contas Gerencial',
    bloom_level: 2,
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    code: 'FIN-DRE-05',
    title: 'Precificação em Revenda',
    bloom_level: 3,
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  },
  {
    id: '77777777-7777-4777-8777-777777777777',
    code: 'FIN-DRE-06',
    title: 'Precificação de Produção',
    bloom_level: 3,
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  },
  {
    id: '88888888-8888-4888-8888-888888888888',
    code: 'FIN-DRE-07',
    title: 'CMV & DRE Avançado',
    bloom_level: 4,
    tenant_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  }
];

async function run() {
  const { data: tenantData } = await supabase.from('tenants').select('id').limit(1);
  const tenant_id = tenantData && tenantData.length > 0 ? tenantData[0].id : 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  for (const uc of MOCK_UNIDADES) {
    uc.tenant_id = tenant_id;
    const { error } = await supabase.from('knowledge_units').upsert(uc, { onConflict: 'code' });
    if (error) console.error(`Error inserting ${uc.code}:`, error);
    else console.log(`Inserted ${uc.code}`);
  }
}

run();
