// Tipos do Núcleo EdTech Expert: Multi-Tenancy, Taxonomia de Bloom & DNT

export type BloomLevel = 
  | 'CONHECIMENTO' 
  | 'COMPREENSAO' 
  | 'APLICACAO_SIMPLES' 
  | 'APLICACAO_MEDIO' 
  | 'APLICACAO_COMPLEXO' 
  | 'ANALISE' 
  | 'AVALIACAO' 
  | 'SINTESE';

export type TenantSubscriptionPlan = 'FREE' | 'STANDARD' | 'PRO' | 'ENTERPRISE';
export type TenantDBStrategy = 'SHARED_RLS' | 'DEDICATED_DB';

export interface Tenant {
  id: string;
  slug: string;
  nome_fantasia: string;
  cnpj?: string;
  plano_assinatura: TenantSubscriptionPlan;
  db_strategy: TenantDBStrategy;
  connection_string_secret_name?: string;
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED';
  created_at: string;
}

export interface TenantAPIKey {
  id: string;
  tenant_id: string;
  key_hash: string;
  nome_identificador: string;
  scopes: string[];
  expires_at?: string;
  revogada: boolean;
  created_at: string;
}

export interface TenantUsageLog {
  id: string;
  tenant_id: string;
  metrica: 'DNT_EXECUTION' | 'API_CALL' | 'ACTIVE_LEARNER' | 'PDF_GENERATED' | 'STORAGE_MB';
  quantidade: number;
  metadata?: Record<string, any>;
  registrado_em: string;
}

export interface LayoutTemplateAST {
  version: string;
  components: Array<{
    type: 'header' | 'concept' | 'metaphor' | 'formula' | 'simulation' | 'quiz_anchor' | 'summary';
    title: string;
    body: string;
    metadata?: Record<string, any>;
  }>;
}

export interface UnidadeConhecimento {
  id: string;
  tenant_id?: string | null; // null se for global/prateleira
  codigo: string;
  titulo: string;
  descricao_curta?: string;
  layout_template: LayoutTemplateAST;
  meta_bloom: BloomLevel;
  duracao_estimada_minutos: number;
  status: 'ativo' | 'rascunho' | 'arquivado';
  created_at: string;
  updated_at: string;
}

export interface MatrizCompetencia {
  id: string;
  tenant_id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  cargo_alvo?: string;
  created_at: string;
}

export interface CompetenciaUnidade {
  id: string;
  competencia_id: string;
  unidade_id: string;
  nivel_minimo_exigido: BloomLevel;
  ordem_sequencial: number;
  obrigatoria: boolean;
  unidade?: UnidadeConhecimento;
}

export interface BancoQuestao {
  id: string;
  tenant_id?: string | null;
  unidade_id: string;
  enunciado: string;
  tipo_questao: 'multipla_escolha' | 'verdadeiro_falso' | 'associacao' | 'caso_estudo' | 'discursiva';
  nivel_bloom: BloomLevel;
  complexidade: 'SIMPLES' | 'MEDIO' | 'COMPLEXO';
  opcoes?: Array<{ key: string; text: string; isCorrect: boolean }>;
  gabarito_justificativa?: string;
  peso: number;
  created_at: string;
}

export interface DiagnosticoDNT {
  id: string;
  tenant_id: string;
  titulo: string;
  competencia_id: string;
  configuracao_calibracao: {
    regua_corte_percentual: number;
    regua_por_nivel: Partial<Record<BloomLevel, number>>;
  };
  created_at: string;
}

export interface MatrizProficienciaColaborador {
  id: string;
  tenant_id: string;
  colaborador_id: string;
  unidade_id: string;
  nivel_bloom_dominado: BloomLevel;
  score_percentual: number;
  isentado: boolean;
  data_diagnostico: string;
  validade_ate?: string;
  unidade?: UnidadeConhecimento;
}

export interface ProjetoSintese {
  id: string;
  tenant_id: string;
  unidade_id: string;
  titulo: string;
  instrucoes_projeto: string;
  rubrica_avaliacao: {
    criterios: Array<{
      nome: string;
      peso: number;
      descricao: string;
    }>;
  };
  criado_em: string;
}
