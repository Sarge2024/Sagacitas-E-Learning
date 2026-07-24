import { 
  UnidadeConhecimento, 
  BloomLevel, 
  MatrizCompetencia, 
  CompetenciaUnidade, 
  BancoQuestao, 
  DiagnosticoDNT, 
  MatrizProficienciaColaborador,
  Tenant
} from '../types/edtechExpert';

// Dados Mocks Iniciais para Demonstração do Módulo Expert
export const MOCK_TENANT: Tenant = {
  id: 'tenant-sagacitas-demo',
  slug: 'sagacitas-corp',
  nome_fantasia: 'Sagacitas Enterprise & Tech',
  plano_assinatura: 'PRO',
  db_strategy: 'SHARED_RLS',
  status: 'ACTIVE',
  created_at: new Date().toISOString(),
};

export const MOCK_UNIDADES_CONHECIMENTO: UnidadeConhecimento[] = [
  {
    id: 'uc-001',
    tenant_id: null, // UC Global de Prateleira
    codigo: 'FIN-DRE-01',
    titulo: 'Fundamentos de DRE & Margem de Contribuição',
    descricao_curta: 'Estruturação conceitual da Demonstração do Resultado do Exercício para restaurantes e gastronomia.',
    meta_bloom: 'COMPREENSAO',
    duracao_estimada_minutos: 20,
    status: 'ativo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    layout_template: {
      version: '1.0',
      components: [
        { type: 'header', title: 'Visão Geral da DRE', body: 'A DRE é a ferramenta primordial para medir o resultado operacional líquido.' },
        { type: 'concept', title: 'Conceito de Margem de Contribuição', body: 'Receita Bruta - Custos Variáveis = Margem de Contribuição.' },
        { type: 'formula', title: 'Fórmula Chave', body: 'MC (%) = (Margem de Contribuição R$ / Receita Bruta R$) * 100' },
      ],
    },
  },
  {
    id: 'uc-002',
    tenant_id: null,
    codigo: 'FIN-DRE-02',
    titulo: 'Aplicação Prática em Cenários de Alta Inflação',
    descricao_curta: 'Simulação operacional e ajustes de cardápio com base na variação dos insumos.',
    meta_bloom: 'APLICACAO_COMPLEXO',
    duracao_estimada_minutos: 30,
    status: 'ativo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    layout_template: {
      version: '1.0',
      components: [
        { type: 'header', title: 'Ajuste de Ficha Técnica', body: 'Aplicações práticas para recalcular o CMV dinamicamente.' },
        { type: 'simulation', title: 'Simulador Alchymist DRE', body: 'Ferramenta interativa de projeção de margens.' },
      ],
    },
  },
  {
    id: 'uc-003',
    tenant_id: 'tenant-sagacitas-demo', // UC Proprietária do Tenant
    codigo: 'OPS-SAG-01',
    titulo: 'Auditoria de Processos Sagacitas Builder em Lojas',
    descricao_curta: 'Avaliação de conformidade dos registros de entrada de mercadorias via portal Sagacitas Builder.',
    meta_bloom: 'ANALISE',
    duracao_estimada_minutos: 25,
    status: 'ativo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    layout_template: {
      version: '1.0',
      components: [
        { type: 'header', title: 'Auditoria Operacional', body: 'Mapeamento de desvios no recebimento fiscal.' }
      ]
    }
  }
];

export const MOCK_MATRIZES: MatrizCompetencia[] = [
  {
    id: 'matriz-001',
    tenant_id: 'tenant-sagacitas-demo',
    codigo: 'COMP-FIN-GER',
    nome: 'Matriz de Gestão Financeira de Lojas',
    cargo_alvo: 'Gerente Geral de Operações',
    descricao: 'Conjunto de unidades atômicas necessárias para o domínio financeiro de unidades de negócio.',
    created_at: new Date().toISOString()
  }
];

export const MOCK_PROFICIENCIA_DNT: MatrizProficienciaColaborador[] = [
  {
    id: 'prof-101',
    tenant_id: 'tenant-sagacitas-demo',
    colaborador_id: 'colab-123',
    unidade_id: 'uc-001',
    nivel_bloom_dominado: 'COMPREENSAO',
    score_percentual: 92.5,
    isentado: true, // COLABORADOR ISENTADO DA UC-001 PELO DNT
    data_diagnostico: new Date().toISOString(),
    unidade: MOCK_UNIDADES_CONHECIMENTO[0]
  },
  {
    id: 'prof-102',
    tenant_id: 'tenant-sagacitas-demo',
    colaborador_id: 'colab-123',
    unidade_id: 'uc-002',
    nivel_bloom_dominado: 'APLICACAO_SIMPLES',
    score_percentual: 45.0,
    isentado: false, // NECESSITA CURSAR ESTA ETAPA (DÉFICIT ENCONTRADO)
    data_diagnostico: new Date().toISOString(),
    unidade: MOCK_UNIDADES_CONHECIMENTO[1]
  }
];

export class ExpertService {
  /**
   * Retorna as Unidades de Conhecimento visíveis para o Tenant (Globais + Proprietárias)
   */
  static getUnidadesConhecimento(tenantId: string): UnidadeConhecimento[] {
    return MOCK_UNIDADES_CONHECIMENTO.filter(
      (uc) => uc.tenant_id === null || uc.tenant_id === tenantId
    );
  }

  /**
   * Retorna a Matriz de Proficiência e Diagnóstico DNT de um colaborador
   */
  static getDiagnosticoColaborador(tenantId: string, colaboradorId: string): MatrizProficienciaColaborador[] {
    return MOCK_PROFICIENCIA_DNT.filter(
      (p) => p.tenant_id === tenantId && p.colaborador_id === colaboradorId
    );
  }

  /**
   * Avalia e executa a Isenção Automática baseada na nota do Diagnóstico DNT
   */
  static processarDiagnosticoDNT(
    tenantId: string,
    colaboradorId: string,
    unidadeId: string,
    score: number,
    reguaCortePercentual: number = 80
  ): MatrizProficienciaColaborador {
    const uc = MOCK_UNIDADES_CONHECIMENTO.find((u) => u.id === unidadeId);
    const isentado = score >= reguaCortePercentual;

    const resultado: MatrizProficienciaColaborador = {
      id: `prof-${Date.now()}`,
      tenant_id: tenantId,
      colaborador_id: colaboradorId,
      unidade_id: unidadeId,
      nivel_bloom_dominado: uc ? uc.meta_bloom : 'CONHECIMENTO',
      score_percentual: score,
      isentado: isentado,
      data_diagnostico: new Date().toISOString(),
      unidade: uc
    };

    return resultado;
  }
}
