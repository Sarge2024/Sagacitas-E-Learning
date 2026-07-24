import React, { useState } from 'react';
import { 
  MOCK_TENANT, 
  MOCK_UNIDADES_CONHECIMENTO, 
  MOCK_MATRIZES, 
  MOCK_PROFICIENCIA_DNT,
  ExpertService
} from '../../services/expertService';
import { UnidadeConhecimento, BloomLevel } from '../../types/edtechExpert';
import { 
  Layers, 
  BrainCircuit, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  Key, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  Sliders, 
  FileText,
  FileCheck,
  Award,
  ArrowRight,
  TrendingUp,
  Target,
  Wand2
} from 'lucide-react';
import { ReverseEngineeringView } from './ReverseEngineeringView';
import { DNTEngineView } from './DNTEngineView';
import { SynthesisProjectsView } from './SynthesisProjectsView';

export const EdTechExpertView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ucs' | 'bloom' | 'dnt' | 'multitenant'>('ucs');
  const [unidades, setUnidades] = useState<UnidadeConhecimento[]>(MOCK_UNIDADES_CONHECIMENTO);
  const [proficiencias, setProficiencias] = useState(MOCK_PROFICIENCIA_DNT);
  
  // DNT Simulator state
  const [selectedUcForTest, setSelectedUcForTest] = useState<string>(MOCK_UNIDADES_CONHECIMENTO[0].id);
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Helper badge color for Bloom Levels
  const getBloomBadgeStyle = (level: BloomLevel) => {
    switch (level) {
      case 'CONHECIMENTO':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPREENSAO':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'APLICACAO_SIMPLES':
      case 'APLICACAO_MEDIO':
      case 'APLICACAO_COMPLEXO':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ANALISE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'AVALIACAO':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SINTESE':
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleRunDntSimulation = () => {
    const res = ExpertService.processarDiagnosticoDNT(
      MOCK_TENANT.id,
      'colab-demo-01',
      selectedUcForTest,
      scoreInput,
      80
    );

    setProficiencias((prev) => [res, ...prev.filter((p) => p.unidade_id !== selectedUcForTest)]);

    if (res.isentado) {
      setSimulationResult(`✅ Colaborador APROVADO com ${scoreInput}%! Isenção automática concedida para o tópico. O funcionário não precisará cursar esta etapa.`);
    } else {
      setSimulationResult(`⚠️ Colaborador obteve ${scoreInput}% (abaixo do corte de 80%). Alocado na Turma Dinâmica de Reforço em Nível ${res.nivel_bloom_dominado}.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-slate-900 p-4 sm:p-6 md:p-8 space-y-6">
      {/* Top Banner Multi-Tenant - Sagacitas Line Standard */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1890ff] to-[#096dd9] flex items-center justify-center text-white font-black shadow-sm">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1890ff] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/60">
                Tema Sagacitas Line • Multi-Tenant Headless
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                RLS Isolation Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Núcleo Expert: Unidades Atômicas & DNT
            </h1>
          </div>
        </div>

        {/* Tenant Information Badge */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <Building2 className="w-5 h-5 text-slate-500" />
          <div className="text-xs">
            <span className="text-[10px] text-slate-400 block font-mono">TENANT ATIVO</span>
            <span className="font-bold text-slate-800">{MOCK_TENANT.nome_fantasia}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-600 text-white font-mono ml-2">
            PLANO {MOCK_TENANT.plano_assinatura}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ucs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ucs'
              ? 'bg-[#1890ff] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Unidades de Conhecimento Atômicas</span>
        </button>

        <button
          onClick={() => setActiveTab('bloom')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'bloom'
              ? 'bg-[#1890ff] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>2. Taxonomia de Bloom (Granularidade)</span>
        </button>

        <button
          onClick={() => setActiveTab('reverse')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'reverse'
              ? 'bg-[#1890ff] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Wand2 className="w-4 h-4 text-emerald-400" />
          <span>3. Engenharia Reversa & Compilador</span>
        </button>

        <button
          onClick={() => setActiveTab('dnt')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dnt'
              ? 'bg-[#1890ff] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>4. Diagnóstico DNT & Isenção Inteligente</span>
        </button>

        <button
          onClick={() => setActiveTab('synthesis')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'synthesis'
              ? 'bg-[#1890ff] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Award className="w-4 h-4 text-rose-400" />
          <span>5. Projetos de Síntese & Skill Gaps</span>
        </button>

        <button
          onClick={() => setActiveTab('multitenant')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'multitenant'
              ? 'bg-[#1890ff] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>6. API Headless & Usage Billing</span>
        </button>
      </div>

      {/* Tab 1: Unidades de Conhecimento Atômicas */}
      {activeTab === 'ucs' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#1890ff] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">Estrutura Atômica Independente</span>
              Cada Unidade de Conhecimento (UC) é um bloco autônomo. Ela carrega nativamente seus próprios recursos multimídia, banco de questões parametrizado e layout didático descritivo para geração automática de materiais.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unidades.map((uc) => (
              <div key={uc.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                      {uc.codigo}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border ${getBloomBadgeStyle(uc.meta_bloom)}`}>
                      Bloom: {uc.meta_bloom}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base line-clamp-1">{uc.titulo}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{uc.descricao_curta}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Duração Estimada:</span>
                    <span className="font-mono font-bold text-slate-700">{uc.duracao_estimada_minutos} min</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Propriedade:</span>
                    <span className={`font-bold ${uc.tenant_id === null ? 'text-[#1890ff]' : 'text-indigo-600'}`}>
                      {uc.tenant_id === null ? '🌐 Global (Prateleira)' : '🔒 Tenant Exclusivo'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-[10px] font-mono text-slate-600 space-y-1">
                    <span className="font-bold text-slate-700 block">Layout Didático (AST):</span>
                    <div className="flex flex-wrap gap-1">
                      {uc.layout_template.components.map((comp, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-[9px]">
                          [{comp.type.toUpperCase()}]
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Taxonomia de Bloom */}
      {activeTab === 'bloom' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-6 shadow-xs">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Progressão Cognitiva da Taxonomia de Bloom</h2>
            <p className="text-xs text-slate-500 mt-1">
              Nuances obrigatórias de complexidade no nível de Aplicação e amarração do nível de Síntese ao projeto prático de inovação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-[#1890ff] font-mono">NÍVEIS BÁSICOS</span>
              <h4 className="font-extrabold text-sm text-slate-900">Conhecimento & Compreensão</h4>
              <p className="text-xs text-slate-500">Estrutura linear. Definições conceituais, termos e memorização de processos chaves.</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/80 space-y-2">
              <span className="text-[10px] font-bold text-emerald-700 font-mono">NÍVEL DE APLICAÇÃO</span>
              <h4 className="font-extrabold text-sm text-emerald-900">Subníveis de Complexidade</h4>
              <div className="space-y-1 text-[11px] text-emerald-800">
                <div className="flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Simples (Exemplos diretos)</div>
                <div className="flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Médio (Variáveis adicionais)</div>
                <div className="flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Complexo (Simulador DRE)</div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200/80 space-y-2">
              <span className="text-[10px] font-bold text-purple-700 font-mono">NÍVEIS AVANÇADOS</span>
              <h4 className="font-extrabold text-sm text-purple-900">Análise & Avaliação</h4>
              <p className="text-xs text-purple-800">Estritamente vinculados aos cenários de complexidade do nível de aplicação.</p>
            </div>

            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200/80 space-y-2">
              <span className="text-[10px] font-bold text-rose-700 font-mono">O ÁPICE PRÁTICO</span>
              <h4 className="font-extrabold text-sm text-rose-900">Síntese (Projeto de Inovação)</h4>
              <p className="text-xs text-rose-800">Entrega de um projeto real estruturado exigindo melhoria ou inovação prática.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Engenharia Reversa & Compilador Didático */}
      {activeTab === 'reverse' && <ReverseEngineeringView />}

      {/* Tab 4: Diagnóstico DNT & Isenção Inteligente */}
      {activeTab === 'dnt' && <DNTEngineView />}

      {/* Tab 5: Projetos de Síntese & Skill Gaps */}
      {activeTab === 'synthesis' && <SynthesisProjectsView />}

      {/* Tab 4: API Headless & Metering Billing */}
      {activeTab === 'multitenant' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">API Headless Core & Telemetria por Consumo</h2>
              <p className="text-xs text-slate-500 mt-1">
                Validação de Tokens JWT, API Keys M2M e tarifação baseada em uso real do Tenant.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-900 text-white px-3 py-1 rounded-xl">
              Gateway v1.0 Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2">
              <span className="text-[10px] text-[#1890ff] font-bold uppercase">1. JWT Bearer token</span>
              <p className="text-[11px] text-slate-400">Header: Authorization Bearer eyJhbGci...</p>
              <span className="text-[10px] text-emerald-400 block font-bold">Claims: tenant_id, user_id, scope</span>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2">
              <span className="text-[10px] text-[#1890ff] font-bold uppercase">2. API Keys (M2M ERPs)</span>
              <p className="text-[11px] text-slate-400">Header: X-API-Key sk_live_sagacitas_98f...</p>
              <span className="text-[10px] text-indigo-400 block font-bold">Scopes: ["dnt:read", "uc:read"]</span>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-2">
              <span className="text-[10px] text-[#1890ff] font-bold uppercase">3. Metering Engine (Redis)</span>
              <p className="text-[11px] text-slate-400">Sliding Window Rate Limiting (100 req/s)</p>
              <span className="text-[10px] text-amber-400 block font-bold">Usage: 1,420 DNT Executions / Month</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
