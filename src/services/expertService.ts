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

export const MOCK_UNIDADES_CONHECIMENTO: UnidadeConhecimento[] = [];

export const MOCK_MATRIZES: MatrizCompetencia[] = [];

export const MOCK_PROFICIENCIA_DNT: MatrizProficienciaColaborador[] = [
  {
    id: 'prof-101',
    tenant_id: 'tenant-sagacitas-demo',
    colaborador_id: 'colab-123',
    unidade_id: '32ddec78-7d51-4cbb-8023-69cd1336c8a6',
    nivel_bloom_dominado: 'COMPREENSAO',
    score_percentual: 92.5,
    isentado: true, // COLABORADOR ISENTADO DA UC-001 PELO DNT
    data_diagnostico: new Date().toISOString(),
    unidade: undefined as any
  },
  {
    id: 'prof-102',
    tenant_id: 'tenant-sagacitas-demo',
    colaborador_id: 'colab-123',
    unidade_id: 'f428b5fe-7d99-41ce-8c5e-3ff6690d6c16',
    nivel_bloom_dominado: 'COMPREENSAO',
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
