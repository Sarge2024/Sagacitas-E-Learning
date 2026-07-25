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
  Wand2,
  Play,
  Volume2,
  Image,
  HelpCircle,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Lock,
  Users,
} from 'lucide-react';
import { ReverseEngineeringView } from './ReverseEngineeringView';
import { DNTEngineView } from './DNTEngineView';
import { SynthesisProjectsView } from './SynthesisProjectsView';
import { DiagnosticTest } from './DiagnosticTest';

import { UserAccessManagementView } from './UserAccessManagementView';
import { OAuthUser } from '../../types';

interface EdTechExpertViewProps {
  activeTab?: 'ucs' | 'bloom' | 'reverse' | 'dnt' | 'dnt-test' | 'synthesis' | 'multitenant' | 'settings' | 'users';
  onTabChange?: (tab: 'ucs' | 'bloom' | 'reverse' | 'dnt' | 'dnt-test' | 'synthesis' | 'multitenant' | 'settings' | 'users') => void;
  unidades?: UnidadeConhecimento[];
  onUpdateUnidades?: (unidades: UnidadeConhecimento[]) => void;
  currentUser: OAuthUser | null;
  onSimulateLogin: (user: OAuthUser) => void;
  onRestoreAdmin: () => void;
  isSimulated: boolean;
}

export const EdTechExpertView: React.FC<EdTechExpertViewProps> = ({
  activeTab: propActiveTab,
  onTabChange,
  unidades: propUnidades,
  onUpdateUnidades,
  currentUser,
  onSimulateLogin,
  onRestoreAdmin,
  isSimulated,
}) => {
  const [localActiveTab, setLocalActiveTab] = useState<'ucs' | 'bloom' | 'reverse' | 'dnt' | 'dnt-test' | 'synthesis' | 'multitenant' | 'settings' | 'users'>('ucs');
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = onTabChange !== undefined ? onTabChange : setLocalActiveTab;
  
  const [localUnidades, setLocalUnidades] = useState<UnidadeConhecimento[]>(MOCK_UNIDADES_CONHECIMENTO);
  const unidades = propUnidades !== undefined ? propUnidades : localUnidades;
  const setUnidades = onUpdateUnidades !== undefined ? onUpdateUnidades : setLocalUnidades;

  const [proficiencias, setProficiencias] = useState(MOCK_PROFICIENCIA_DNT);
  
  // Settings States
  const [aiTutorEnabled, setAiTutorEnabled] = useState(true);
  const [oauthRequired, setOauthRequired] = useState(false);
  const [autoIssueCertificates, setAutoIssueCertificates] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  // DNT Simulator state
  const [selectedUcForTest, setSelectedUcForTest] = useState<string>(MOCK_UNIDADES_CONHECIMENTO[0].id);
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [selectedUcForModal, setSelectedUcForModal] = useState<UnidadeConhecimento | null>(null);

  // UC Authoring Form States
  const [isCreatingUc, setIsCreatingUc] = useState(false);
  const [editingUc, setEditingUc] = useState<UnidadeConhecimento | null>(null);

  const [ucCodigo, setUcCodigo] = useState('');
  const [ucTitulo, setUcTitulo] = useState('');
  const [ucDescricao, setUcDescricao] = useState('');
  const [ucMetaBloom, setUcMetaBloom] = useState<BloomLevel>('CONHECIMENTO');
  const [ucDuracao, setUcDuracao] = useState(15);
  const [ucTopico, setUcTopico] = useState('');
  const [ucTopicoComplexidade, setUcTopicoComplexidade] = useState<BloomLevel>('CONHECIMENTO');
  const [ucComponents, setUcComponents] = useState<Array<{
    type: 'text' | 'image' | 'video' | 'audio' | 'question' | 'simulation';
    title: string;
    body: string;
    metadata?: any;
  }>>([]);

  const openCreateUc = () => {
    setIsCreatingUc(true);
    setEditingUc(null);
    setUcCodigo(`FIN-DRE-0${unidades.length + 1}`);
    setUcTitulo('');
    setUcDescricao('');
    setUcMetaBloom('CONHECIMENTO');
    setUcDuracao(15);
    setUcTopico('Tópico DRE');
    setUcTopicoComplexidade('CONHECIMENTO');
    setUcComponents([
      { type: 'text', title: 'Introdução do Conteúdo', body: 'Escreva a explicação geral aqui...' }
    ]);
  };

  const openEditUc = (uc: UnidadeConhecimento) => {
    setEditingUc(uc);
    setIsCreatingUc(false);
    setUcCodigo(uc.codigo);
    setUcTitulo(uc.titulo);
    setUcDescricao(uc.descricao_curta);
    setUcMetaBloom(uc.meta_bloom);
    setUcDuracao(uc.duracao_estimada_minutos);
    setUcTopico(uc.topico || '');
    setUcTopicoComplexidade(uc.topico_complexidade || 'CONHECIMENTO');
    setUcComponents(uc.layout_template.components.map(c => ({
      type: c.type as any,
      title: c.title,
      body: c.body,
      metadata: c.metadata ? JSON.parse(JSON.stringify(c.metadata)) : undefined
    })));
  };

  const addComponentField = (type: 'text' | 'image' | 'video' | 'audio' | 'question' | 'simulation') => {
    const base: any = { type, title: '', body: '' };
    if (type === 'image') base.metadata = { url: '' };
    if (type === 'video') base.metadata = { url: '', duration: '05:00' };
    if (type === 'audio') base.metadata = { url: '', duration: '03:00' };
    if (type === 'question') {
      base.metadata = {
        options: [
          { key: 'A', text: '', isCorrect: true },
          { key: 'B', text: '', isCorrect: false },
          { key: 'C', text: '', isCorrect: false },
          { key: 'D', text: '', isCorrect: false }
        ],
        justification: ''
      };
    }
    setUcComponents([...ucComponents, base]);
  };

  const handleSaveUc = () => {
    if (!ucCodigo || !ucTitulo || !ucDescricao || !ucTopico) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (isCreatingUc) {
      const newUc: UnidadeConhecimento = {
        id: `uc-${Date.now()}`,
        tenant_id: null,
        codigo: ucCodigo,
        titulo: ucTitulo,
        descricao_curta: ucDescricao,
        meta_bloom: ucMetaBloom,
        duracao_estimada_minutos: Number(ucDuracao),
        status: 'ativo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        topico: ucTopico,
        topico_complexidade: ucTopicoComplexidade,
        layout_template: {
          version: '1.0',
          components: ucComponents as any
        }
      };
      setUnidades([...unidades, newUc]);
    } else if (editingUc) {
      const updated = unidades.map(u => u.id === editingUc.id ? {
        ...u,
        codigo: ucCodigo,
        titulo: ucTitulo,
        descricao_curta: ucDescricao,
        meta_bloom: ucMetaBloom,
        duracao_estimada_minutos: Number(ucDuracao),
        topico: ucTopico,
        topico_complexidade: ucTopicoComplexidade,
        layout_template: {
          version: '1.0',
          components: ucComponents as any
        }
      } : u);
      setUnidades(updated);
    }
    
    // Reset authoring state
    setIsCreatingUc(false);
    setEditingUc(null);
  };

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
      <div className="bg-white rounded-md p-6 shadow-2xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#1890ff] to-[#096dd9] flex items-center justify-center text-white font-black shadow-2xs">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1890ff] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                Tema Sagacitas Line • Multi-Tenant Headless
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
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
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-md border border-slate-200">
          <Building2 className="w-5 h-5 text-slate-500" />
          <div className="text-xs">
            <span className="text-[10px] text-slate-400 block font-mono">TENANT ATIVO</span>
            <span className="font-bold text-slate-800">{MOCK_TENANT.nome_fantasia}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-indigo-600 text-white font-mono ml-2">
            PLANO {MOCK_TENANT.plano_assinatura}
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ucs')}
          className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ucs'
              ? 'bg-[#1890ff] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Unidades de Conhecimento Atômicas</span>
        </button>

        <button
          onClick={() => setActiveTab('bloom')}
          className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'bloom'
              ? 'bg-[#1890ff] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>2. Taxonomia de Bloom (Granularidade)</span>
        </button>

        <button
          onClick={() => setActiveTab('reverse')}
          className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'reverse'
              ? 'bg-[#1890ff] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Wand2 className="w-4 h-4 text-emerald-400" />
          <span>3. Engenharia Reversa & Compilador</span>
        </button>

        <button
          onClick={() => setActiveTab('dnt')}
          className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dnt'
              ? 'bg-[#1890ff] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>4. Diagnóstico DNT & Isenção Inteligente</span>
        </button>

        <button
          onClick={() => setActiveTab('dnt-test')}
          className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'dnt-test'
              ? 'bg-[#1890ff] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-emerald-500" />
          <span>4.1 Teste DNT Prático</span>
        </button>

        <button
          onClick={() => setActiveTab('synthesis')}
          className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'synthesis'
              ? 'bg-[#1890ff] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-rose-400" />
          <span>5. Projetos de Síntese & Skill Gaps</span>
        </button>

        <button
          onClick={() => setActiveTab('multitenant')}
          className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'multitenant'
              ? 'bg-[#1890ff] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>6. API Headless & Usage Billing</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#1890ff] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-500" />
          <span>7. Configurações Globais</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#1890ff] text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-purple-500" />
          <span>8. Controle de Acessos & Usuários</span>
        </button>
      </div>

      {/* Tab 1: Unidades de Conhecimento Atômicas */}
      {/* Tab 1: Unidades de Conhecimento Atômicas */}
      {activeTab === 'ucs' && (() => {
        if (isCreatingUc || editingUc !== null) {
          return (
            <div className="bg-white rounded-md p-6 border border-slate-200 shadow-2xs space-y-6">
              {/* Form Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setIsCreatingUc(false); setEditingUc(null); }}
                    className="p-2 hover:bg-slate-100 rounded-md transition-colors cursor-pointer text-slate-500 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {isCreatingUc ? 'Cadastrar Nova Unidade de Conhecimento' : 'Editar Unidade de Conhecimento'}
                    </h2>
                    <p className="text-xs text-slate-500">Insira as informações gerais e componentes didáticos da UC.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setIsCreatingUc(false); setEditingUc(null); }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-md font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveUc}
                    className="px-4 py-2 bg-[#1890ff] hover:bg-[#116ebc] text-white rounded-md font-extrabold text-xs transition-all cursor-pointer shadow-2xs"
                  >
                    Salvar Unidade
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Info Geral */}
                <div className="lg:col-span-1 space-y-4">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Informações Gerais</span>
                  
                  {/* Codigo */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">Código da UC <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={ucCodigo} 
                      onChange={(e) => setUcCodigo(e.target.value)}
                      placeholder="Ex: FIN-DRE-08"
                      className="w-full p-2.5 rounded-md border border-slate-200 text-xs focus:ring-1 focus:ring-[#1890ff] focus:border-[#1890ff]"
                    />
                  </div>

                  {/* Titulo */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">Título <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={ucTitulo} 
                      onChange={(e) => setUcTitulo(e.target.value)}
                      placeholder="Ex: Análise de Fluxo de Caixa"
                      className="w-full p-2.5 rounded-md border border-slate-200 text-xs focus:ring-1 focus:ring-[#1890ff] focus:border-[#1890ff]"
                    />
                  </div>

                  {/* Descricao */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">Descrição Curta <span className="text-rose-500">*</span></label>
                    <textarea 
                      value={ucDescricao} 
                      onChange={(e) => setUcDescricao(e.target.value)}
                      placeholder="Resumo didático da unidade..."
                      rows={3}
                      className="w-full p-2.5 rounded-md border border-slate-200 text-xs focus:ring-1 focus:ring-[#1890ff] focus:border-[#1890ff]"
                    />
                  </div>

                  {/* Meta Bloom & Duração */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-700 block">Bloom da UC</label>
                      <select 
                        value={ucMetaBloom} 
                        onChange={(e) => setUcMetaBloom(e.target.value as any)}
                        className="w-full p-2.5 rounded-md border border-slate-200 text-xs"
                      >
                        <option value="CONHECIMENTO">Conhecimento</option>
                        <option value="COMPREENSAO">Compreensão</option>
                        <option value="APLICACAO_SIMPLES">Aplicação Simples</option>
                        <option value="APLICACAO_MEDIO">Aplicação Média</option>
                        <option value="APLICACAO_COMPLEXO">Aplicação Complexa</option>
                        <option value="ANALISE">Análise</option>
                        <option value="AVALIACAO">Avaliação</option>
                        <option value="SINTESE">Síntese</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-slate-700 block">Duração (Min)</label>
                      <input 
                        type="number" 
                        value={ucDuracao} 
                        onChange={(e) => setUcDuracao(Number(e.target.value))}
                        className="w-full p-2.5 rounded-md border border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  {/* Topico & Complexidade do Topico */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">Tópico Pertencente <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={ucTopico} 
                      onChange={(e) => setUcTopico(e.target.value)}
                      placeholder="Ex: Tópico DRE, Operações"
                      className="w-full p-2.5 rounded-md border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">Complexidade Geral do Tópico</label>
                    <select 
                      value={ucTopicoComplexidade} 
                      onChange={(e) => setUcTopicoComplexidade(e.target.value as any)}
                      className="w-full p-2.5 rounded-md border border-slate-200 text-xs"
                    >
                      <option value="CONHECIMENTO">Conhecimento</option>
                      <option value="COMPREENSAO">Compreensão</option>
                      <option value="APLICACAO_SIMPLES">Aplicação Simples</option>
                      <option value="APLICACAO_MEDIO">Aplicação Média</option>
                      <option value="APLICACAO_COMPLEXO">Aplicação Complexa</option>
                      <option value="ANALISE">Análise</option>
                      <option value="AVALIACAO">Avaliação</option>
                      <option value="SINTESE">Síntese</option>
                    </select>
                  </div>
                </div>

                {/* Column 2 & 3: Elementos Didaticos (AST) */}
                <div className="lg:col-span-2 space-y-4 border-l border-slate-100 pl-0 lg:pl-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conteúdo & Elementos Didáticos</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button 
                        onClick={() => addComponentField('text')} 
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        + Texto
                      </button>
                      <button 
                        onClick={() => addComponentField('image')} 
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        + Imagem
                      </button>
                      <button 
                        onClick={() => addComponentField('video')} 
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        + Vídeo
                      </button>
                      <button 
                        onClick={() => addComponentField('audio')} 
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        + Áudio
                      </button>
                      <button 
                        onClick={() => addComponentField('question')} 
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        + Questão
                      </button>
                      <button 
                        onClick={() => addComponentField('simulation')} 
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        + Simulação
                      </button>
                    </div>
                  </div>

                  {/* Components List */}
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {ucComponents.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-md">
                        Nenhum elemento didático adicionado. Use os botões acima para estruturar a aula.
                      </div>
                    ) : (
                      ucComponents.map((comp, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-md p-4 relative space-y-3 shadow-2xs">
                          {/* Element delete */}
                          <button
                            onClick={() => setUcComponents(ucComponents.filter((_, i) => i !== idx))}
                            className="absolute top-3 right-3 p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Element type badge & Index */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400">#0{idx + 1}</span>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 uppercase">
                              {comp.type}
                            </span>
                          </div>

                          {/* Element Title */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-600 block">Título do Elemento</label>
                            <input 
                              type="text" 
                              value={comp.title} 
                              onChange={(e) => {
                                const list = [...ucComponents];
                                list[idx].title = e.target.value;
                                setUcComponents(list);
                              }}
                              placeholder="Ex: O que é a Margem Operacional"
                              className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-semibold text-slate-800"
                            />
                          </div>

                          {/* Element Body/Enunciado */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-600 block">Corpo / Conteúdo Explicativo / Enunciado</label>
                            <textarea 
                              value={comp.body} 
                              onChange={(e) => {
                                const list = [...ucComponents];
                                list[idx].body = e.target.value;
                                setUcComponents(list);
                              }}
                              placeholder="Escreva as instruções ou explicações..."
                              rows={3}
                              className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs"
                            />
                          </div>

                          {/* Image fields */}
                          {comp.type === 'image' && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-extrabold text-slate-600 block">URL da Imagem</label>
                              <input 
                                type="text" 
                                value={comp.metadata?.url || ''} 
                                onChange={(e) => {
                                  const list = [...ucComponents];
                                  if (!list[idx].metadata) list[idx].metadata = {};
                                  list[idx].metadata.url = e.target.value;
                                  setUcComponents(list);
                                }}
                                placeholder="https://unsplash.com/..."
                                className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-mono"
                              />
                            </div>
                          )}

                          {/* Video fields */}
                          {comp.type === 'video' && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-600 block">URL do Vídeo</label>
                                <input 
                                  type="text" 
                                  value={comp.metadata?.url || ''} 
                                  onChange={(e) => {
                                    const list = [...ucComponents];
                                    if (!list[idx].metadata) list[idx].metadata = {};
                                    list[idx].metadata.url = e.target.value;
                                    setUcComponents(list);
                                  }}
                                  placeholder="https://..."
                                  className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-600 block">Duração (Minutos)</label>
                                <input 
                                  type="text" 
                                  value={comp.metadata?.duration || '05:00'} 
                                  onChange={(e) => {
                                    const list = [...ucComponents];
                                    if (!list[idx].metadata) list[idx].metadata = {};
                                    list[idx].metadata.duration = e.target.value;
                                    setUcComponents(list);
                                  }}
                                  placeholder="Ex: 04:30"
                                  className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-mono"
                                />
                              </div>
                            </div>
                          )}

                          {/* Audio fields */}
                          {comp.type === 'audio' && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-600 block">URL do Áudio</label>
                                <input 
                                  type="text" 
                                  value={comp.metadata?.url || ''} 
                                  onChange={(e) => {
                                    const list = [...ucComponents];
                                    if (!list[idx].metadata) list[idx].metadata = {};
                                    list[idx].metadata.url = e.target.value;
                                    setUcComponents(list);
                                  }}
                                  placeholder="https://..."
                                  className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-mono"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-600 block">Duração (Minutos)</label>
                                <input 
                                  type="text" 
                                  value={comp.metadata?.duration || '03:00'} 
                                  onChange={(e) => {
                                    const list = [...ucComponents];
                                    if (!list[idx].metadata) list[idx].metadata = {};
                                    list[idx].metadata.duration = e.target.value;
                                    setUcComponents(list);
                                  }}
                                  placeholder="Ex: 03:00"
                                  className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs font-mono"
                                />
                              </div>
                            </div>
                          )}

                          {/* Question fields */}
                          {comp.type === 'question' && (
                            <div className="space-y-3 bg-white p-3 border border-slate-200 rounded-md">
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Opções & Gabarito</span>
                              <div className="space-y-2">
                                {['A', 'B', 'C', 'D'].map((keyName, oIdx) => {
                                  const optObj = comp.metadata?.options?.[oIdx] || { key: keyName, text: '', isCorrect: oIdx === 0 };
                                  return (
                                    <div key={keyName} className="flex items-center gap-2">
                                      <input 
                                        type="radio" 
                                        name={`correct-${idx}`}
                                        checked={optObj.isCorrect}
                                        onChange={() => {
                                          const list = [...ucComponents];
                                          list[idx].metadata.options = list[idx].metadata.options.map((o: any, oi: number) => ({
                                            ...o,
                                            isCorrect: oi === oIdx
                                          }));
                                          setUcComponents(list);
                                        }}
                                        className="text-[#1890ff]"
                                      />
                                      <span className="text-xs font-bold text-slate-500 w-4">{keyName})</span>
                                      <input 
                                        type="text"
                                        value={optObj.text}
                                        onChange={(e) => {
                                          const list = [...ucComponents];
                                          list[idx].metadata.options[oIdx].text = e.target.value;
                                          setUcComponents(list);
                                        }}
                                        placeholder={`Texto da opção ${keyName}`}
                                        className="flex-1 p-1.5 border border-slate-200 rounded-md text-xs"
                                      />
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="space-y-1 pt-1">
                                <label className="text-[9px] font-extrabold text-slate-500 block">Explicação / Justificativa</label>
                                <textarea 
                                  value={comp.metadata?.justification || ''} 
                                  onChange={(e) => {
                                    const list = [...ucComponents];
                                    list[idx].metadata.justification = e.target.value;
                                    setUcComponents(list);
                                  }}
                                  placeholder="Explique o porquê de a resposta estar correta..."
                                  rows={2}
                                  className="w-full p-2 border border-slate-200 rounded-md text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        const topicos = Array.from(new Set(unidades.map(u => u.topico || 'Outros')));
        
        return (
          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-xs text-blue-900 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#1890ff] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm">Estrutura Atômica Independente & Tópicos de Conhecimento</span>
                  Cada Unidade de Conhecimento (UC) é um bloco autônomo. O agrupamento de UCs elementares produz um <strong>Tópico</strong>, que é classificado pelo seu nível ou grau máximo de complexidade cognitiva da Taxonomia de Bloom.
                </div>
              </div>
              <button 
                onClick={openCreateUc}
                className="px-3.5 py-2 bg-[#1890ff] hover:bg-[#116ebc] text-white rounded-md text-xs font-extrabold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Unidade</span>
              </button>
            </div>

            {topicos.map((topicoNome) => {
              const ucsDoTopico = unidades.filter(u => (u.topico || 'Outros') === topicoNome);
              const complexidade = ucsDoTopico[0]?.topico_complexidade || 'CONHECIMENTO';
              
              return (
                <div key={topicoNome} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-extrabold text-slate-800">{topicoNome}</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Complexidade do Tópico: {complexidade}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {ucsDoTopico.length} {ucsDoTopico.length === 1 ? 'Unidade' : 'Unidades'} de Conhecimento
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ucsDoTopico.map((uc) => (
                      <div 
                        key={uc.id} 
                        onClick={() => setSelectedUcForModal(uc)}
                        className="bg-white rounded-md p-5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 cursor-pointer hover:border-[#1890ff] hover:shadow-2xs transition-all active:scale-[0.99] select-none relative group"
                      >
                        {/* Edit / Delete Buttons on Hover */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditUc(uc);
                            }}
                            className="p-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-md transition-colors"
                            title="Editar Unidade de Conhecimento"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Tem certeza que deseja excluir esta Unidade de Conhecimento?")) {
                                setUnidades(unidades.filter(u => u.id !== uc.id));
                              }
                            }}
                            className="p-1 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 rounded-md transition-colors"
                            title="Excluir Unidade de Conhecimento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2 pr-12">
                            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {uc.codigo}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${getBloomBadgeStyle(uc.meta_bloom)}`}>
                              Bloom: {uc.meta_bloom}
                            </span>
                          </div>

                          <h3 className="font-extrabold text-slate-900 text-base line-clamp-1">{uc.titulo}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{uc.descricao_curta}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Tab 2: Taxonomia de Bloom */}
      {activeTab === 'bloom' && (
        <div className="bg-white rounded-md p-6 border border-slate-200 space-y-6 shadow-2xs">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Progressão Cognitiva da Taxonomia de Bloom</h2>
            <p className="text-xs text-slate-500 mt-1">
              Nuances obrigatórias de complexidade no nível de Aplicação e amarração do nível de Síntese ao projeto prático de inovação.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-md border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-[#1890ff] font-mono">NÍVEIS BÁSICOS</span>
              <h4 className="font-extrabold text-sm text-slate-900">Conhecimento & Compreensão</h4>
              <p className="text-xs text-slate-500">Estrutura linear. Definições conceituais, termos e memorização de processos chaves.</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-md border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold text-emerald-700 font-mono">NÍVEL DE APLICAÇÃO</span>
              <h4 className="font-extrabold text-sm text-emerald-900">Subníveis de Complexidade</h4>
              <div className="space-y-1 text-[11px] text-emerald-800">
                <div className="flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Simples (Exemplos diretos)</div>
                <div className="flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Médio (Variáveis adicionais)</div>
                <div className="flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Complexo (Simulador DRE)</div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-md border border-purple-200 space-y-2">
              <span className="text-[10px] font-bold text-purple-700 font-mono">NÍVEIS AVANÇADOS</span>
              <h4 className="font-extrabold text-sm text-purple-900">Análise & Avaliação</h4>
              <p className="text-xs text-purple-800">Estritamente vinculados aos cenários de complexidade do nível de aplicação.</p>
            </div>

            <div className="p-4 bg-rose-50 rounded-md border border-rose-200 space-y-2">
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

      {/* Tab 4.1: Teste Prático DNT (Gamificado) */}
      {activeTab === 'dnt-test' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-2xs h-[700px] overflow-hidden">
          <DiagnosticTest />
        </div>
      )}

      {/* Tab 5: Projetos de Síntese & Skill Gaps */}
      {activeTab === 'synthesis' && <SynthesisProjectsView />}

      {/* Tab 4: API Headless & Metering Billing */}
      {activeTab === 'multitenant' && (
        <div className="bg-white rounded-md p-6 border border-slate-200 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">API Headless Core & Telemetria por Consumo</h2>
              <p className="text-xs text-slate-500 mt-1">
                Validação de Tokens JWT, API Keys M2M e tarifação baseada em uso real do Tenant.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-900 text-white px-3 py-1 rounded-md">
              Gateway v1.0 Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-900 text-slate-100 rounded-md space-y-2">
              <span className="text-[10px] text-[#1890ff] font-bold uppercase">1. JWT Bearer token</span>
              <p className="text-[11px] text-slate-400">Header: Authorization Bearer eyJhbGci...</p>
              <span className="text-[10px] text-emerald-400 block font-bold">Claims: tenant_id, user_id, scope</span>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-md space-y-2">
              <span className="text-[10px] text-[#1890ff] font-bold uppercase">2. API Keys (M2M ERPs)</span>
              <p className="text-[11px] text-slate-400">Header: X-API-Key sk_live_sagacitas_98f...</p>
              <span className="text-[10px] text-indigo-400 block font-bold">Scopes: ["dnt:read", "uc:read"]</span>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-md space-y-2">
              <span className="text-[10px] text-[#1890ff] font-bold uppercase">3. Metering Engine (Redis)</span>
              <p className="text-[11px] text-slate-400">Sliding Window Rate Limiting (100 req/s)</p>
              <span className="text-[10px] text-amber-400 block font-bold">Usage: 1,420 DNT Executions / Month</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Configurações Globais */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-md p-6 border border-slate-200 space-y-6 shadow-2xs">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Configurações Globais do E-Learning</h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure os recursos de Inteligência Artificial, fluxo de certificações e diretrizes de segurança da plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-md p-5 space-y-6 shadow-2xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded bg-blue-50 text-[#1890ff] flex items-center justify-center border border-blue-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Recursos de Inteligência & IA</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Ativação do Tutor de IA e emissão de certificados
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Tutor de IA Educacional</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Permite aos alunos tirarem dúvidas sobre DRE e gestão em tempo real
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setAiTutorEnabled(!aiTutorEnabled);
                      showToast(`Tutor de IA ${!aiTutorEnabled ? 'ativado' : 'desativado'}`);
                    }}
                    className={`w-12 h-6 rounded-md transition-all relative cursor-pointer ${
                      aiTutorEnabled ? 'bg-[#1890ff]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md bg-white shadow-2xs absolute top-0.5 transition-all ${
                        aiTutorEnabled ? 'left-6' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Emissão Automática de Certificados</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Gerar certificado imediatamente após 100% de conclusão do treinamento
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setAutoIssueCertificates(!autoIssueCertificates);
                      showToast(`Emissão automática ${!autoIssueCertificates ? 'ativada' : 'desativada'}`);
                    }}
                    className={`w-12 h-6 rounded-md transition-all relative cursor-pointer ${
                      autoIssueCertificates ? 'bg-[#1890ff]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md bg-white shadow-2xs absolute top-0.5 transition-all ${
                        autoIssueCertificates ? 'left-6' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-md p-5 space-y-6 shadow-2xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded bg-blue-50 text-[#1890ff] flex items-center justify-center border border-blue-200">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Segurança & Licenciamento</h3>
                  <p className="text-xs text-slate-500 font-medium">Autenticação Google OAuth e validade do sistema</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Autenticação Obrigatória Google OAuth</span>
                    <span className="text-[10px] text-slate-500 font-medium">Exigir login Google autenticado para assistir aulas</span>
                  </div>
                  <button
                    onClick={() => {
                      setOauthRequired(!oauthRequired);
                      showToast(`OAuth obrigatório ${!oauthRequired ? 'ativado' : 'desativado'}`);
                    }}
                    className={`w-12 h-6 rounded-md transition-all relative cursor-pointer ${
                      oauthRequired ? 'bg-[#1890ff]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md bg-white shadow-2xs absolute top-0.5 transition-all ${
                        oauthRequired ? 'left-6' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Licença Alchymist Manager</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">Alchymist Enterprise • Ativo</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                    2027
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <UserAccessManagementView
          currentUser={currentUser}
          onSimulateLogin={onSimulateLogin}
          onRestoreAdmin={onRestoreAdmin}
          isSimulated={isSimulated}
        />
      )}

      {/* UC Details Modal Popup */}
      {selectedUcForModal && (
        <div className="fixed inset-0 bg-[#070b14]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedUcForModal(null)}>
          <div className="bg-[#131929] border border-white/10 rounded-md p-6 md:p-8 max-w-lg w-full text-[#dae2fd] shadow-2xs relative space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            {/* Header / Top Row */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-md bg-white/5 border border-white/10 text-white">
                {selectedUcForModal.codigo}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-md border ${getBloomBadgeStyle(selectedUcForModal.meta_bloom)}`}>
                Bloom: {selectedUcForModal.meta_bloom}
              </span>
            </div>

            {/* Title & Desc */}
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">{selectedUcForModal.titulo}</h2>
              <p className="text-sm text-[#cbd5e1] leading-relaxed">{selectedUcForModal.descricao_curta}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-white/10 text-xs">
              <div className="space-y-1">
                <span className="text-[#94a3b8] block font-medium uppercase tracking-wider text-[10px]">DURAÇÃO ESTIMADA</span>
                <span className="font-mono font-extrabold text-white text-sm">{selectedUcForModal.duracao_estimada_minutos} minutos</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#94a3b8] block font-medium uppercase tracking-wider text-[10px]">PROPRIEDADE</span>
                <span className={`font-extrabold text-sm ${selectedUcForModal.tenant_id === null ? 'text-[#2fd9f4]' : 'text-[#8083ff]'}`}>
                  {selectedUcForModal.tenant_id === null ? '🌐 Global (Prateleira)' : '🔒 Tenant Exclusivo'}
                </span>
              </div>
            </div>

            {/* Didactic Elements list */}
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              <span className="text-[#94a3b8] block font-medium uppercase tracking-wider text-[10px]">ELEMENTOS DIDÁTICOS DA UNIDADE</span>
              
              {selectedUcForModal.layout_template.components.map((comp, idx) => {
                switch (comp.type) {
                  case 'text':
                  case 'description':
                  case 'concept':
                  case 'summary':
                  case 'header':
                    return (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-md p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold bg-[#1890ff]/10 text-[#1890ff] px-2 py-0.5 rounded border border-[#1890ff]/20 uppercase">Texto Explicativo</span>
                          {comp.title && <h4 className="text-xs font-bold text-white">{comp.title}</h4>}
                        </div>
                        <p className="text-xs text-[#cbd5e1] leading-relaxed">{comp.body}</p>
                      </div>
                    );
                    
                  case 'image':
                    return (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-md p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold bg-[#2fd9f4]/10 text-[#2fd9f4] px-2 py-0.5 rounded border border-[#2fd9f4]/20 uppercase flex items-center gap-1">
                            <Image className="w-2.5 h-2.5" /> Imagem
                          </span>
                          {comp.title && <h4 className="text-xs font-bold text-white">{comp.title}</h4>}
                        </div>
                        {comp.metadata?.url && (
                          <div className="relative rounded-md overflow-hidden border border-white/5 bg-black/40 aspect-video flex items-center justify-center">
                            <img src={comp.metadata.url} alt={comp.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <p className="text-xs text-[#94a3b8] leading-relaxed italic">{comp.body}</p>
                      </div>
                    );
                    
                  case 'video':
                    return (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-md p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold bg-[#1890ff]/10 text-[#1890ff] px-2 py-0.5 rounded border border-[#1890ff]/20 uppercase flex items-center gap-1">
                              <Play className="w-2.5 h-2.5" /> Vídeo
                            </span>
                            {comp.title && <h4 className="text-xs font-bold text-white">{comp.title}</h4>}
                          </div>
                          {comp.metadata?.duration && (
                            <span className="text-[10px] font-mono text-[#94a3b8] font-bold bg-white/5 px-2 py-0.5 rounded-md border border-white/10">{comp.metadata.duration}</span>
                          )}
                        </div>
                        <div className="relative rounded-md overflow-hidden border border-white/10 bg-slate-950 aspect-video flex flex-col justify-between p-4 group">
                          {/* Mock Video player background */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30 flex items-center justify-center">
                            <button className="w-12 h-12 rounded-md bg-[#1890ff] hover:bg-[#116ebc] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer">
                              <Play className="w-5 h-5 translate-x-0.5 fill-current" />
                            </button>
                          </div>
                          {/* Simulated video controls */}
                          <div className="z-10 flex items-center justify-between w-full text-[10px] text-slate-400 mt-auto">
                            <span className="font-mono">00:00 / {comp.metadata?.duration || '00:00'}</span>
                            <div className="flex-1 mx-3 h-1 bg-white/20 rounded-md overflow-hidden">
                              <div className="w-1/4 h-full bg-[#1890ff]" />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-[#cbd5e1] leading-relaxed">{comp.body}</p>
                      </div>
                    );
                    
                  case 'audio':
                    return (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-md p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 uppercase flex items-center gap-1">
                              <Volume2 className="w-2.5 h-2.5" /> Áudio
                            </span>
                            {comp.title && <h4 className="text-xs font-bold text-white">{comp.title}</h4>}
                          </div>
                          {comp.metadata?.duration && (
                            <span className="text-[10px] font-mono text-[#94a3b8] font-bold bg-white/5 px-2 py-0.5 rounded-md border border-white/10">{comp.metadata.duration}</span>
                          )}
                        </div>
                        {/* Audio Player waveform simulation */}
                        <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-3 rounded-md">
                          <button className="w-8 h-8 rounded-md bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs active:scale-95 cursor-pointer">
                            <Play className="w-4 h-4 translate-x-0.5 fill-current" />
                          </button>
                          <div className="flex-1 flex items-end gap-[2px] h-6">
                            {/* Simulated waveform bars */}
                            {[10,16,24,18,12,8,14,20,18,22,14,8,12,18,24,16,10,14,18,8,12,16].map((h, i) => (
                              <div key={i} className={`flex-1 rounded-md transition-all duration-300 ${i < 5 ? 'bg-amber-500' : 'bg-white/20'}`} style={{ height: `${h}px` }} />
                            ))}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{comp.metadata?.duration || '00:00'}</span>
                        </div>
                        <p className="text-xs text-[#cbd5e1] leading-relaxed">{comp.body}</p>
                      </div>
                    );
                    
                  case 'question':
                    return (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-md p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase flex items-center gap-1">
                            <HelpCircle className="w-2.5 h-2.5" /> Questão de Teste
                          </span>
                          {comp.title && <h4 className="text-xs font-bold text-white">{comp.title}</h4>}
                        </div>
                        <p className="text-xs text-[#cbd5e1] font-semibold leading-relaxed">{comp.body}</p>
                        
                        {/* Render Options */}
                        {comp.metadata?.options && (
                          <div className="space-y-2 mt-2">
                            {comp.metadata.options.map((opt) => (
                              <div 
                                key={opt.key} 
                                className={`p-3 rounded-md border text-xs flex items-center justify-between transition-colors ${
                                  opt.isCorrect 
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' 
                                    : 'bg-white/5 border-white/10 text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] border ${
                                    opt.isCorrect 
                                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' 
                                      : 'bg-white/5 border-white/10 text-slate-400'
                                  }`}>
                                    {opt.key}
                                  </span>
                                  <span>{opt.text}</span>
                                </div>
                                {opt.isCorrect && (
                                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">Gabarito</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {comp.metadata?.justification && (
                          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-md p-3 text-[11px] text-[#94a3b8] leading-relaxed">
                            <span className="font-bold text-emerald-400 block mb-0.5">Explicação/Justificativa:</span>
                            {comp.metadata.justification}
                          </div>
                        )}
                      </div>
                    );

                  case 'simulation':
                    return (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-md p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 uppercase flex items-center gap-1">Simulação Interativa</span>
                          {comp.title && <h4 className="text-xs font-bold text-white">{comp.title}</h4>}
                        </div>
                        <p className="text-xs text-[#cbd5e1] leading-relaxed">{comp.body}</p>
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-md p-3 text-[11px] text-purple-300 font-bold text-center">
                          ⚙️ Simulador Ativo no Módulo Avançado DNT
                        </div>
                      </div>
                    );
                    
                  default:
                    return (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-md p-4 space-y-1">
                        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 uppercase">
                          {comp.type}
                        </span>
                        <h4 className="text-xs font-bold text-white">{comp.title}</h4>
                        <p className="text-[11px] text-[#94a3b8] leading-normal">{comp.body}</p>
                      </div>
                    );
                }
              })}
            </div>

            {/* Action Buttons Row */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const ucToEdit = selectedUcForModal;
                  setSelectedUcForModal(null);
                  openEditUc(ucToEdit);
                }}
                className="flex-1 py-3.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white border border-white/10 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Editar UC</span>
              </button>
              <button
                onClick={() => setSelectedUcForModal(null)}
                className="flex-1 py-3.5 rounded-md bg-[#1890ff] hover:bg-[#116ebc] text-white font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-[#1890ff]/25"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-slate-700 rounded-md py-2.5 px-4 text-xs font-bold text-white shadow-lg flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#1890ff]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
