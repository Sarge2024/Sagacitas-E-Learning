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
    titulo: 'Demonstração do Resultado do Exercício (DRE)',
    descricao_curta: 'Estruturação conceitual da DRE gerencial para apuração de lucro líquido em negócios gastronômicos.',
    meta_bloom: 'COMPREENSAO',
    duracao_estimada_minutos: 15,
    status: 'ativo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topico: 'Tópico DRE',
    topico_complexidade: 'APLICACAO_COMPLEXO',
    layout_template: {
      version: '1.0',
      components: [
        { 
          type: 'text', 
          title: 'O que é a DRE?', 
          body: 'A Demonstração do Resultado do Exercício (DRE) é um relatório contábil que apresenta o resumo financeiro das atividades operacionais e não operacionais de uma empresa em um determinado período, demonstrando se houve lucro ou prejuízo.' 
        },
        { 
          type: 'image', 
          title: 'Fluxo Estrutural da DRE', 
          body: 'Esquema visual mostrando a dedução de Receita Bruta -> Impostos -> Receita Líquida -> CMV -> Margem Operacional -> Custos Fixos -> Lucro Líquido.',
          metadata: {
            url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop'
          }
        },
        {
          type: 'question',
          title: 'Verificação de Aprendizado',
          body: 'Qual o indicador financeiro obtido logo após subtrair os impostos e o CMV da Receita Bruta?',
          metadata: {
            options: [
              { key: 'A', text: 'Lucro Líquido', isCorrect: false },
              { key: 'B', text: 'Lucro Bruto (Margem de Contribuição)', isCorrect: true },
              { key: 'C', text: 'EBITDA', isCorrect: false },
              { key: 'D', text: 'Margem Líquida', isCorrect: false }
            ],
            justification: 'O Lucro Bruto representa o resultado operacional antes de deduzir as despesas fixas (como aluguel e pessoal).'
          }
        }
      ]
    }
  },
  {
    id: 'uc-002',
    tenant_id: null,
    codigo: 'FIN-DRE-02',
    titulo: 'Margem de Contribuição',
    descricao_curta: 'Cálculo e análise da margem de contribuição unitária e global para alimentos e bebidas.',
    meta_bloom: 'COMPREENSAO',
    duracao_estimada_minutos: 15,
    status: 'ativo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topico: 'Tópico DRE',
    topico_complexidade: 'APLICACAO_COMPLEXO',
    layout_template: {
      version: '1.0',
      components: [
        { 
          type: 'text', 
          title: 'Conceito e Significado', 
          body: 'A Margem de Contribuição indica quanto sobra do faturamento das vendas após cobrir os custos variáveis de cada prato ou bebida. É esse valor que pagará os custos fixos da operação.' 
        },
        {
          type: 'video',
          title: 'Videoaula: Cálculo na Prática',
          body: 'Assista a esta aula rápida demonstrando como encontrar a Margem de Contribuição unitária de um prato comercial.',
          metadata: {
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            duration: '04:15'
          }
        }
      ]
    }
  },
  {
    id: 'uc-004',
    tenant_id: null,
    codigo: 'FIN-DRE-03',
    titulo: 'Impostos e Tributos',
    descricao_curta: 'Incidência de impostos sobre vendas e regime tributário simples nacional.',
    meta_bloom: 'COMPREENSAO',
    duracao_estimada_minutos: 20,
    status: 'ativo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topico: 'Tópico DRE',
    topico_complexidade: 'APLICACAO_COMPLEXO',
    layout_template: {
      version: '1.0',
      components: [
        { 
          type: 'text', 
          title: 'Carga Tributária em Alimentos', 
          body: 'Regimes como Simples Nacional incidem diretamente sobre a Receita Bruta, impactando na largada as margens operacionais do negócio.' 
        },
        {
          type: 'audio',
          title: 'Podcast: Impacto do Simples Nacional',
          body: 'Explicação detalhada dos anexos do Simples Nacional aplicados ao setor gastronômico e faixas de faturamento.',
          metadata: {
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            duration: '03:30'
          }
        }
      ]
    }
  },
  {
    id: 'uc-005',
    tenant_id: null,
    codigo: 'FIN-DRE-04',
    titulo: 'Plano de Contas Gerencial',
    descricao_curta: 'Estruturação de plano de contas focado em resultados operacionais (CMV, Custos Fixos, Despesas).',
    meta_bloom: 'COMPREENSAO',
    duracao_estimada_minutos: 15,
    status: 'ativo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topico: 'Tópico DRE',
    topico_complexidade: 'APLICACAO_COMPLEXO',
    layout_template: {
      version: '1.0',
      components: [
        { 
          type: 'text', 
          title: 'Importância da Estrutura', 
          body: 'Um plano de contas gerencial difere da contabilidade fiscal tradicional. Ele separa custos por natureza (insumos, pessoal, taxas de entrega) para tomada de decisão ágil.' 
        },
        {
          type: 'image',
          title: 'Exemplo de Plano de Contas',
          body: 'Infográfico didático com a divisão entre Contas de Receita, Contas de Dedução Operacional e Contas de Custos de Estrutura.',
          metadata: {
            url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop'
          }
        }
      ]
    }
  },
  {
    id: 'uc-006',
    tenant_id: null,
    codigo: 'FIN-DRE-05',
    titulo: 'Precificação em Revenda',
    descricao_curta: 'Métodos de markup e precificação de mercadorias para revenda pura.',
    meta_bloom: 'APLICACAO_SIMPLES',
    duracao_estimada_minutos: 20,
    status: 'ativo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topico: 'Tópico DRE',
    topico_complexidade: 'APLICACAO_COMPLEXO',
    layout_template: {
      version: '1.0',
      components: [
        { 
          type: 'text', 
          title: 'Metodologia do Markup', 
          body: 'Para itens prontos comprados de distribuidores e vendidos diretamente, calcula-se o markup multiplicador integrando impostos, comissões e margem alvo.' 
        },
        {
          type: 'question',
          title: 'Calculando na prática',
          body: 'Um refrigerante custa R$ 2,00. Seus custos variáveis representam 20% e você deseja 30% de margem líquida. Qual o preço ideal?',
          metadata: {
            options: [
              { key: 'A', text: 'R$ 3,00', isCorrect: false },
              { key: 'B', text: 'R$ 4,00', isCorrect: true },
              { key: 'C', text: 'R$ 3,50', isCorrect: false },
              { key: 'D', text: 'R$ 5,00', isCorrect: false }
            ],
            justification: 'Aplicando Markup Divisor: Preço = Custo / (1 - Custos Variáveis - Margem) => 2,00 / (1 - 0.2 - 0.3) = 2,00 / 0.5 = R$ 4,00.'
          }
        }
      ]
    }
  },
  {
    id: 'uc-007',
    tenant_id: null,
    codigo: 'FIN-DRE-06',
    titulo: 'Precificação de Produção',
    descricao_curta: 'Precificação avançada baseada em ficha técnica de insumos e custos de transformação.',
    meta_bloom: 'APLICACAO_MEDIO',
    duracao_estimada_minutos: 25,
    status: 'ativo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topico: 'Tópico DRE',
    topico_complexidade: 'APLICACAO_COMPLEXO',
    layout_template: {
      version: '1.0',
      components: [
        { 
          type: 'text', 
          title: 'Complexidade de Ficha Técnica', 
          body: 'Itens produzidos em cozinha exigem o cálculo do custo unitário de cada ingrediente, incluindo fator de correção (perdas na limpeza e cocção).' 
        },
        {
          type: 'video',
          title: 'Vídeo: Fator de Correção em Proteínas',
          body: 'Aula prática sobre como calcular a perda de peso das carnes e seu reflexo no preço final do cardápio.',
          metadata: {
            url: 'https://www.w3schools.com/html/mov_bbb.mp4',
            duration: '06:40'
          }
        }
      ]
    }
  },
  {
    id: 'uc-008',
    tenant_id: null,
    codigo: 'FIN-DRE-07',
    titulo: 'CMV & DRE Avançado',
    descricao_curta: 'Simulação operacional avançada e ajustes de CMV no Alchymist DRE em cenários reais.',
    meta_bloom: 'APLICACAO_COMPLEXO',
    duracao_estimada_minutos: 30,
    status: 'ativo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    topico: 'Tópico DRE',
    topico_complexidade: 'APLICACAO_COMPLEXO',
    layout_template: {
      version: '1.0',
      components: [
        { 
          type: 'text', 
          title: 'CMV Avançado', 
          body: 'Ajuste fino de CMV engloba compras, estoques iniciais e finais, além de monitorar desvios operacionais.' 
        },
        { 
          type: 'simulation', 
          title: 'Simulador Alchymist DRE', 
          body: 'Ferramenta interativa de projeção de margens e CMV.' 
        }
      ]
    }
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
    topico: 'Operações & Auditoria',
    topico_complexidade: 'ANALISE',
    layout_template: {
      version: '1.0',
      components: [
        { 
          type: 'text', 
          title: 'Auditoria e Controle', 
          body: 'Processos de auditoria verificam a exatidão dos lançamentos de notas no portal ERP corporativo.' 
        }
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
