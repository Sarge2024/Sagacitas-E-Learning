import { 
  UnidadeConhecimento, 
  BloomLevel, 
  MatrizProficienciaColaborador 
} from '../types/edtechExpert';

export interface ColaboradorProfile {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
}

export interface TurmaVariavelDinamica {
  id: string;
  titulo: string;
  unidade_id: string;
  nivel_bloom_foco: BloomLevel;
  colaboradores_alocados: ColaboradorProfile[];
  descricao_deficit: string;
  criada_em: string;
}

export interface MetricDNTROI {
  totalColaboradoresAvaliados: number;
  totalIsencoesConcedidas: number;
  percentualIsencao: number;
  horasTreinamentoSalvas: number;
  economiaFinanceiraEstimada: number;
}

// Dados Mocks de Colaboradores para a Engine DNT
export const MOCK_COLABORADORES: ColaboradorProfile[] = [
  { id: 'colab-101', nome: 'Gabriel Mendes', email: 'gabriel.mendes@sagacitas.edu.br', cargo: 'Gerente Geral', departamento: 'Operações' },
  { id: 'colab-102', nome: 'Juliana Costa', email: 'juliana.costa@sagacitas.edu.br', cargo: 'Analista Financeiro', departamento: 'Controladoria' },
  { id: 'colab-103', nome: 'Carlos Eduardo', email: 'carlos.eduardo@sagacitas.edu.br', cargo: 'Supervisor de Loja', departamento: 'Vendas' },
  { id: 'colab-104', nome: 'Beatriz Lima', email: 'beatriz.lima@sagacitas.edu.br', cargo: 'Coordenadora de Treinamento', departamento: 'RH' },
  { id: 'colab-105', nome: 'Rodrigo Alves', email: 'rodrigo.alves@sagacitas.edu.br', cargo: 'Gerente de Turno', departamento: 'Operações' },
];

export class DNTEngineService {
  /**
   * Avalia a lista de colaboradores em relação a uma UC e aplica a régua de corte para Isenção Inteligente
   */
  static avaliarTurmaDNT(
    unidade: UnidadeConhecimento,
    colaboradores: ColaboradorProfile[],
    reguaCortePercentual: number = 80
  ): {
    proficiencias: MatrizProficienciaColaborador[];
    turmaDinamica?: TurmaVariavelDinamica;
    roi: MetricDNTROI;
  } {
    const proficiencias: MatrizProficienciaColaborador[] = [];
    const colaboradoresComDeficit: ColaboradorProfile[] = [];
    let isencoesContagem = 0;

    colaboradores.forEach((colab, idx) => {
      // Simulação de notas calibradas por perfil
      const mockScores = [92, 85, 45, 90, 60];
      const score = mockScores[idx % mockScores.length];
      const isentado = score >= reguaCortePercentual;

      if (isentado) {
        isencoesContagem++;
      } else {
        colaboradoresComDeficit.push(colab);
      }

      proficiencias.push({
        id: `prof-${unidade.id}-${colab.id}`,
        tenant_id: 'tenant-sagacitas-demo',
        colaborador_id: colab.id,
        unidade_id: unidade.id,
        nivel_bloom_dominado: unidade.meta_bloom,
        score_percentual: score,
        isentado: isentado,
        data_diagnostico: new Date().toISOString(),
        unidade: unidade,
      });
    });

    // Criação da Turma Variável Dinâmica apenas para quem precisa de reforço
    let turmaDinamica: TurmaVariavelDinamica | undefined;
    if (colaboradoresComDeficit.length > 0) {
      turmaDinamica = {
        id: `turma-dyn-${unidade.id}-${Date.now()}`,
        titulo: `Turma Dinâmica de Reforço: ${unidade.titulo}`,
        unidade_id: unidade.id,
        nivel_bloom_foco: unidade.meta_bloom,
        colaboradores_alocados: colaboradoresComDeficit,
        descricao_deficit: `Grupo formado exclusivamente por ${colaboradoresComDeficit.length} colaborador(es) com déficit em ${unidade.meta_bloom}.`,
        criada_em: new Date().toISOString(),
      };
    }

    // Cálculo do ROI Corporativo e Horas Salvas
    const horasSalvas = Math.round((isencoesContagem * (unidade.duracao_estimada_minutos / 60)) * 10) / 10;
    const custoHoraEstimado = 85.0; // R$/hora médio por colaborador corporativo
    const economiaFinanceira = Math.round(horasSalvas * custoHoraEstimado);

    const roi: MetricDNTROI = {
      totalColaboradoresAvaliados: colaboradores.length,
      totalIsencoesConcedidas: isencoesContagem,
      percentualIsencao: Math.round((isencoesContagem / colaboradores.length) * 100),
      horasTreinamentoSalvas: horasSalvas,
      economiaFinanceiraEstimada: economiaFinanceira,
    };

    return { proficiencias, turmaDinamica, roi };
  }
}
