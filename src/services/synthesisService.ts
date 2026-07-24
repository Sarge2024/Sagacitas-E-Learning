import { ProjetoSintese, BloomLevel } from '../types/edtechExpert';

export interface SubmissaoProjetoSintese {
  id: string;
  projeto_id: string;
  colaborador_nome: string;
  colaborador_cargo: string;
  departamento: string;
  titulo_proposta: string;
  descricao_inovacao: string;
  melhoria_proposta: string;
  impacto_financeiro_estimado: string;
  status_avaliacao: 'PENDENTE' | 'APROVADO' | 'RECOMENDADO_COMITE';
  nota_rubrica: number; // 0 a 100
  parecer_avaliador?: string;
  submetido_em: string;
}

export interface SkillGapDepartment {
  departamento: string;
  totalColaboradores: number;
  gapCriticoCount: number;
  gapMedioCount: number;
  dominioAltoCount: number;
  scoreGeralPercentual: number;
}

// Dados Mocks de Projetos de Síntese
export const MOCK_SUBMISSOES_SINTESE: SubmissaoProjetoSintese[] = [
  {
    id: 'sub-001',
    projeto_id: 'proj-dre-01',
    colaborador_nome: 'Gabriel Mendes',
    colaborador_cargo: 'Gerente Geral',
    departamento: 'Operações',
    titulo_proposta: 'Otimização de CMV em Lojas via Alchymist DRE Engine',
    descricao_inovacao: 'Implementação de um ritual semanal de reajuste dinâmico das fichas técnicas com base na cotação diária de insumos proteicos.',
    melhoria_proposta: 'Redução do CMV de 34% para 29.5% mantendo a engenharia de menu.',
    impacto_financeiro_estimado: 'R$ 48.000 / mês de economia operacional',
    status_avaliacao: 'APROVADO',
    nota_rubrica: 95.0,
    parecer_avaliador: 'Projeto de síntese excelente! Demonstrou alto grau de inovação e viabilidade de implementação imediata.',
    submetido_em: new Date().toISOString()
  },
  {
    id: 'sub-002',
    projeto_id: 'proj-dre-01',
    colaborador_nome: 'Juliana Costa',
    colaborador_cargo: 'Analista Financeiro',
    departamento: 'Controladoria',
    titulo_proposta: 'Automação da Conciliação de Vendas B2B',
    descricao_inovacao: 'Script automatizado em Python/SQL para bater as vendas registradas com o extrato das adquirentes.',
    melhoria_proposta: 'Zeramento de estornos não identificados na ponta da loja.',
    impacto_financeiro_estimado: 'R$ 18.500 / mês recuperados',
    status_avaliacao: 'RECOMENDADO_COMITE',
    nota_rubrica: 98.0,
    parecer_avaliador: 'Proposta inovadora com potencial de escala para todos os tenants da rede.',
    submetido_em: new Date().toISOString()
  }
];

export const MOCK_SKILL_GAPS: SkillGapDepartment[] = [
  { departamento: 'Operações', totalColaboradores: 45, gapCriticoCount: 8, gapMedioCount: 15, dominioAltoCount: 22, scoreGeralPercentual: 74.5 },
  { departamento: 'Controladoria', totalColaboradores: 18, gapCriticoCount: 1, gapMedioCount: 3, dominioAltoCount: 14, scoreGeralPercentual: 88.0 },
  { departamento: 'Vendas & Marketing', totalColaboradores: 32, gapCriticoCount: 6, gapMedioCount: 12, dominioAltoCount: 14, scoreGeralPercentual: 68.2 },
  { departamento: 'Recursos Humanos', totalColaboradores: 12, gapCriticoCount: 0, gapMedioCount: 2, dominioAltoCount: 10, scoreGeralPercentual: 91.5 },
];

export class SynthesisService {
  static getSubmissoes(): SubmissaoProjetoSintese[] {
    return MOCK_SUBMISSOES_SINTESE;
  }

  static getSkillGaps(): SkillGapDepartment[] {
    return MOCK_SKILL_GAPS;
  }

  static avaliarSubmissao(
    submissaoId: string,
    nota: number,
    parecer: string
  ): SubmissaoProjetoSintese {
    const sub = MOCK_SUBMISSOES_SINTESE.find((s) => s.id === submissaoId);
    if (sub) {
      sub.nota_rubrica = nota;
      sub.parecer_avaliador = parecer;
      sub.status_avaliacao = nota >= 80 ? 'APROVADO' : 'PENDENTE';
    }
    return sub || MOCK_SUBMISSOES_SINTESE[0];
  }
}
