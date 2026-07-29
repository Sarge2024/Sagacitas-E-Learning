import React, { useState, useEffect } from 'react';
import { 
  MOCK_TENANT, 
  MOCK_UNIDADES_CONHECIMENTO, 
  MOCK_MATRIZES, 
  MOCK_PROFICIENCIA_DNT,
  ExpertService
} from '../../services/expertService';
import { uploadService } from '../../services/uploadService';
import { dbService } from '../../services/dbService';
import { PMESTGeneratorService } from '../../services/pmestGenerator';
import { UnidadeConhecimento, BloomLevel, TaxonomyOption } from '../../types/edtechExpert';
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
  UploadCloud,
  Loader2,
  ClipboardPaste,
  Search,
  Settings
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
  
  const [localUnidades, setLocalUnidades] = useState<UnidadeConhecimento[]>([]);
  const unidades = propUnidades !== undefined ? propUnidades : localUnidades;
  const setUnidades = onUpdateUnidades !== undefined ? onUpdateUnidades : setLocalUnidades;

  useEffect(() => {
    const fetchUCs = async () => {
      try {
        const ucs = await dbService.getKnowledgeUnits();
        const mappedUcs: UnidadeConhecimento[] = ucs.map(dbUc => ({
          id: dbUc.id,
          tenant_id: dbUc.tenant_id,
          codigo: dbUc.signatures && dbUc.signatures.length > 0 ? dbUc.signatures[0].code : undefined,
          signatures: dbUc.signatures,
          subgroups: dbUc.subgroups,
          titulo: dbUc.title,
          descricao_curta: dbUc.description,
          meta_bloom: dbUc.bloom_level === 1 ? 'CONHECIMENTO' : 
                      dbUc.bloom_level === 2 ? 'COMPREENSAO' : 
                      dbUc.bloom_level === 3 ? 'APLICACAO_SIMPLES' : 
                      dbUc.bloom_level === 4 ? 'ANALISE' : 
                      dbUc.bloom_level === 5 ? 'SINTESE' : 'COMPREENSAO',
          duracao_estimada_minutos: dbUc.estimated_duration_minutes,
          status: dbUc.status as any,
          created_at: dbUc.created_at,
          updated_at: dbUc.updated_at,
          topico: dbUc.topic,
          topico_complexidade: dbUc.topic_complexity as any || 'CONHECIMENTO',
          area: dbUc.area || 'SAG',
          context: dbUc.context || 'GLOBAL',
          pre_requisitos: dbUc.pre_requisitos || [],
          layout_template: { version: '1.0', components: [] }
        }));

        setLocalUnidades(mappedUcs);
        if (onUpdateUnidades) {
          onUpdateUnidades(mappedUcs);
        }
        if (mappedUcs.length > 0 && selectedUcForTest === MOCK_UNIDADES_CONHECIMENTO[0]?.id) {
          setSelectedUcForTest(mappedUcs[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch UCs", err);
      }
    };
    
    const fetchTaxonomyOptions = async () => {
      try {
        const areas = await dbService.getTaxonomyOptions('AREA');
        const contexts = await dbService.getTaxonomyOptions('CONTEXT');
        setAreasList(areas || []);
        setContextsList(contexts || []);
      } catch (err) {
        console.error("Failed to fetch taxonomies", err);
      }
    };

    fetchUCs();
    fetchTaxonomyOptions();
  }, [propUnidades]);

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
  const [selectedUcForTest, setSelectedUcForTest] = useState<string>(MOCK_UNIDADES_CONHECIMENTO[0]?.id || '');
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [selectedUcForModal, setSelectedUcForModal] = useState<UnidadeConhecimento | null>(null);

  // UC Authoring Form States
  const [isCreatingUc, setIsCreatingUc] = useState(false);
  const [editingUc, setEditingUc] = useState<UnidadeConhecimento | null>(null);

  // Taxonomy Management States
  const [areasList, setAreasList] = useState<TaxonomyOption[]>([]);
  const [contextsList, setContextsList] = useState<TaxonomyOption[]>([]);
  const [isTaxonomyModalOpen, setIsTaxonomyModalOpen] = useState(false);
  const [taxCategory, setTaxCategory] = useState<'AREA' | 'CONTEXT'>('AREA');
  const [taxNewCode, setTaxNewCode] = useState('');
  const [editingTaxId, setEditingTaxId] = useState<string | null>(null);
  const [taxNewName, setTaxNewName] = useState('');

  const [baseSignature, setBaseSignature] = useState('');
  const [ucSignatures, setUcSignatures] = useState<string[]>([]);
  const [editingSignatureIndex, setEditingSignatureIndex] = useState<number | null>(null);
  const [isSignaturesModalOpen, setIsSignaturesModalOpen] = useState(false);
  const [newSignatureStr, setNewSignatureStr] = useState('');
  const [activeBloomTab, setActiveBloomTab] = useState<number>(2);
  const [ucTitulo, setUcTitulo] = useState('');
  const [ucDescricao, setUcDescricao] = useState('');
  const [ucMetaBloom, setUcMetaBloom] = useState<BloomLevel>('CONHECIMENTO');
  const [ucDuracao, setUcDuracao] = useState(0);
  const [ucTopico, setUcTopico] = useState('');
  const [ucTopicoComplexidade, setUcTopicoComplexidade] = useState<BloomLevel>('CONHECIMENTO');
  const [ucArea, setUcArea] = useState('');
  const [ucContext, setUcContext] = useState('');
  const [ucPreRequisitos, setUcPreRequisitos] = useState<string[]>([]);
  const [ucComponents, setUcComponents] = useState<Array<{
    type: 'text' | 'image' | 'video' | 'audio' | 'question' | 'simulation';
    title: string;
    body: string;
    bloomLevel?: number;
    metadata?: any;
  }>>([]);

  useEffect(() => {
    const sig = PMESTGeneratorService.generateBaseSignature(
      ucArea, // Personalidade (Área Geral)
      ucTopico, // Matéria (Tópico)
      ucMetaBloom, // Energia (Nível de Bloom)
      ucContext, // Espaço (Contexto)
      ucDuracao // Tempo (Duração)
    );
    setBaseSignature(sig);
  }, [ucArea, ucTopico, ucMetaBloom, ucContext, ucDuracao]);

  const openCreateUc = () => {
    setIsCreatingUc(true);
    setEditingUc(null);
    setUcSignatures([]);
    setNewSignatureStr('');
    setActiveBloomTab(2);
    setUcTitulo('');
    setUcDescricao('');
    setUcMetaBloom('CONHECIMENTO');
    setUcDuracao(0);
    setUcTopico('');
    setUcTopicoComplexidade('CONHECIMENTO');
    setUcArea('');
    setUcContext('');
    setUcPreRequisitos([]);
    setUcComponents([
      { type: 'text', title: 'Introdução do Conteúdo', body: 'Escreva a explicação geral aqui...', bloomLevel: 2 }
    ]);
  };

  const handleNewSignature = () => {
    setEditingSignatureIndex(null);
    setUcArea('');
    setUcContext('');
    setUcTopico('');
    setUcMetaBloom('CONHECIMENTO');
    setUcDuracao(0);
  };

  const handleSaveSignature = () => {
    if (editingSignatureIndex !== null) {
      const newSigs = [...ucSignatures];
      if ((baseSignature && !newSigs.includes(baseSignature)) || newSigs[editingSignatureIndex] === baseSignature) {
        newSigs[editingSignatureIndex] = baseSignature;
        setUcSignatures(newSigs);
        setEditingSignatureIndex(null);
      } else if (newSigs.includes(baseSignature)) {
        setEditingSignatureIndex(null);
      }
    } else {
      if (baseSignature && !ucSignatures.includes(baseSignature)) {
        setUcSignatures([...ucSignatures, baseSignature]);
      }
    }
  };

  const openEditUc = (uc: UnidadeConhecimento) => {
    setEditingUc(uc);
    setIsCreatingUc(true); // Abre o modal de edição (usa a mesma flag do formulário)
    
    const dynamicBase = PMESTGeneratorService.generateBaseSignature(uc.area || 'SAG', uc.topico || '', uc.meta_bloom || 'CONHECIMENTO', uc.context || 'GLOBAL', uc.duracao_estimada_minutos || 15);
    const allSigs = uc.signatures ? uc.signatures.map(s => s.code) : (uc.codigo ? [uc.codigo] : []);
    
    // Remove the base signature if it's stored in the DB, as it will be generated dynamically
    setUcSignatures(allSigs.filter(s => s !== dynamicBase));
    
    setNewSignatureStr('');
    setActiveBloomTab(2);
    setUcTitulo(uc.titulo);
    setUcDescricao(uc.descricao_curta ?? '');
    setUcMetaBloom(uc.meta_bloom);
    setUcDuracao(uc.duracao_estimada_minutos || 0);
    setUcTopico(uc.topico || '');
    setUcTopicoComplexidade(uc.topico_complexidade || 'CONHECIMENTO');
    setUcArea(uc.area || '');
    setUcContext(uc.context || '');
    setUcPreRequisitos(uc.pre_requisitos || []);
    if (uc.subgroups && uc.subgroups.length > 0) {
      const flattened = uc.subgroups.flatMap(sg => 
        (sg.content_payload || []).map((c: any) => ({ ...c, bloomLevel: sg.bloom_level_required }))
      );
      setUcComponents(flattened);
    } else {
      setUcComponents(uc.layout_template.components.map(c => ({
        type: c.type as any,
        title: c.title,
        body: c.body,
        bloomLevel: 2,
        metadata: c.metadata ? JSON.parse(JSON.stringify(c.metadata)) : undefined
      })));
    }
  };

  const addComponentField = (type: 'text' | 'image' | 'video' | 'audio' | 'question' | 'simulation') => {
    const base: any = { type, title: '', body: '', bloomLevel: activeBloomTab };
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

  const handleSaveUc = async () => {
    if (!ucTitulo || !ucDescricao || !ucTopico) {
      alert("Por favor, preencha todos os campos obrigatórios (Título, Descrição e Tópico).");
      return;
    }

    const finalSignatures = [baseSignature, ...ucSignatures];

    const groupedComponents = ucComponents.reduce((acc: Record<number, any[]>, curr) => {
      const bl = curr.bloomLevel || 2;
      if (!acc[bl]) acc[bl] = [];
      acc[bl].push(curr);
      return acc;
    }, {});

    const payloadUc = {
      titulo: ucTitulo,
      descricao_curta: ucDescricao,
      meta_bloom: activeBloomTab,
      duracao_estimada_minutos: Number(ucDuracao),
      status: 'ativo',
      created_at: editingUc ? editingUc.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      topico: ucTopico,
      topico_complexidade: ucTopicoComplexidade,
      area: ucArea,
      context: ucContext,
      pre_requisitos: ucPreRequisitos
    };

    try {
      if (isCreatingUc && !editingUc) {
        await dbService.createKnowledgeUnit(payloadUc, finalSignatures, groupedComponents);
        showToast("UC criada com sucesso (Multimodular)!");
      } else if (editingUc) {
        await dbService.updateKnowledgeUnit(editingUc.id, payloadUc, finalSignatures, groupedComponents);
        showToast("UC atualizada com sucesso!");
      }
      
      // Reload units
      const ucs = await dbService.getKnowledgeUnits();
      const mappedUcs: UnidadeConhecimento[] = ucs.map(dbUc => ({
        id: dbUc.id,
        tenant_id: dbUc.tenant_id,
        codigo: dbUc.signatures && dbUc.signatures.length > 0 ? dbUc.signatures[0].code : undefined,
        signatures: dbUc.signatures,
        subgroups: dbUc.subgroups,
        titulo: dbUc.title,
        descricao_curta: dbUc.description,
        meta_bloom: dbUc.bloom_level === 1 ? 'CONHECIMENTO' : 
                    dbUc.bloom_level === 2 ? 'COMPREENSAO' : 
                    dbUc.bloom_level === 3 ? 'APLICACAO_SIMPLES' : 
                    dbUc.bloom_level === 4 ? 'ANALISE' : 
                    dbUc.bloom_level === 5 ? 'SINTESE' : 'COMPREENSAO',
        duracao_estimada_minutos: dbUc.estimated_duration_minutes,
        status: dbUc.status as any,
        created_at: dbUc.created_at,
        updated_at: dbUc.updated_at,
        topico: dbUc.topic,
        topico_complexidade: dbUc.topic_complexity as any || 'CONHECIMENTO',
        area: dbUc.area || 'SAG',
        context: dbUc.context || 'GLOBAL',
        pre_requisitos: dbUc.pre_requisitos || [],
        layout_template: { version: '1.0', components: [] }
      }));
      setUnidades(mappedUcs);
      
      // Reset authoring state
      setIsCreatingUc(false);
      setEditingUc(null);
    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar: " + err.message);
    }
  };

  const handleOpenTaxonomyModal = (category: 'AREA' | 'CONTEXT') => {
    setTaxCategory(category);
    setTaxNewCode('');
    setTaxNewName('');
    setEditingTaxId(null);
    setIsTaxonomyModalOpen(true);
  };

  const handleSaveTaxonomy = async () => {
    if (!taxNewCode || !taxNewName) {
      alert('Preencha o código e o nome.');
      return;
    }
    try {
      if (editingTaxId) {
        await dbService.updateTaxonomyOption(editingTaxId, {
          code: taxNewCode,
          name: taxNewName
        });
      } else {
        await dbService.createTaxonomyOption({
          category: taxCategory,
          code: taxNewCode,
          name: taxNewName
        });
      }
      // Refetch
      const updated = await dbService.getTaxonomyOptions(taxCategory);
      if (taxCategory === 'AREA') setAreasList(updated || []);
      else setContextsList(updated || []);
      setTaxNewCode('');
      setTaxNewName('');
      setEditingTaxId(null);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao salvar taxonomia: ' + err.message);
    }
  };

  const handleDeleteTaxonomy = async (id: string, category: 'AREA' | 'CONTEXT') => {
    try {
      await dbService.deleteTaxonomyOption(id);
      const updated = await dbService.getTaxonomyOptions(category);
      if (category === 'AREA') setAreasList(updated || []);
      else setContextsList(updated || []);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao excluir taxonomia: ' + err.message);
    }
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
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700 block">Assinaturas PMEST <span className="text-rose-500">*</span></label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly
                        value={baseSignature} 
                        placeholder="Configure os campos abaixo para gerar o código"
                        className="flex-1 p-2.5 rounded-md border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                      />
                      <button 
                        type="button"
                        onClick={handleNewSignature}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Novo
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsSignaturesModalOpen(true)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center"
                      >
                        Pesquisa
                      </button>
                      <button 
                        type="button"
                        onClick={handleSaveSignature}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Salvar
                      </button>
                    </div>
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

                  {/* Area and Context Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-slate-700 block">Personalidade / Área (P)</label>
                        <button onClick={() => handleOpenTaxonomyModal('AREA')} className="text-slate-400 hover:text-indigo-600 transition-colors">
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <select 
                        value={ucArea} 
                        onChange={(e) => setUcArea(e.target.value)}
                        className="w-full p-2.5 rounded-md border border-slate-200 text-xs focus:ring-1 focus:ring-[#1890ff] focus:border-[#1890ff]"
                      >
                        <option value="">-- Selecione uma Área --</option>
                        {areasList.map(a => (
                          <option key={a.id} value={a.code}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-slate-700 block">Espaço / Contexto (S)</label>
                        <button onClick={() => handleOpenTaxonomyModal('CONTEXT')} className="text-slate-400 hover:text-indigo-600 transition-colors">
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <select 
                        value={ucContext} 
                        onChange={(e) => setUcContext(e.target.value)}
                        className="w-full p-2.5 rounded-md border border-slate-200 text-xs focus:ring-1 focus:ring-[#1890ff] focus:border-[#1890ff]"
                      >
                        <option value="">-- Selecione um Contexto --</option>
                        {contextsList.map(c => (
                          <option key={c.id} value={c.code}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Topico & Complexidade do Topico */}
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-slate-700 block">Matéria / Tópico (M) <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={ucTopico} 
                      onChange={(e) => setUcTopico(e.target.value)}
                      placeholder="Ex: DRE, Operações"
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
                  {/* Pré-requisitos Recomendados */}
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      ⛓️ Pré-requisitos Recomendados (Base de Aprendizado)
                    </span>
                    {ucPreRequisitos.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {ucPreRequisitos.map((req, idx) => (
                          <span 
                            key={idx} 
                            className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#1890ff]/10 text-[#1890ff] border border-[#1890ff]/20 flex items-center gap-1.5"
                          >
                            <span>{req}</span>
                            <button
                              type="button"
                              onClick={() => setUcPreRequisitos(prev => prev.filter((_, i) => i !== idx))}
                              className="text-xs hover:text-rose-500 transition-colors ml-0.5 font-bold cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 block italic">Nenhum pré-requisito cadastrado.</span>
                    )}
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Adicionar código da UC (ex: UC 1.1A)..."
                        id="new-prereq-input"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val && !ucPreRequisitos.includes(val)) {
                              setUcPreRequisitos([...ucPreRequisitos, val]);
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                        className="flex-1 p-1.5 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-[#1890ff] focus:border-[#1890ff]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('new-prereq-input') as HTMLInputElement;
                          const val = input?.value.trim();
                          if (val && !ucPreRequisitos.includes(val)) {
                            setUcPreRequisitos([...ucPreRequisitos, val]);
                            if (input) input.value = '';
                          }
                        }}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                   <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conteúdo & Subgrupos Bloom</span>
                  </div>

                  {/* Bloom Tabs */}
                  <div className="flex gap-1 border-b border-slate-200 pb-2 overflow-x-auto custom-scrollbar">
                    {[1, 2, 3, 4, 5, 6].map(level => {
                      const labels = ["1. Conhec.", "2. Compreen.", "3. Aplicação", "4. Análise", "5. Síntese", "6. Avaliação"];
                      const isActive = activeBloomTab === level;
                      const hasItems = ucComponents.some(c => (c.bloomLevel || 2) === level);
                      return (
                        <button
                          key={level}
                          onClick={() => setActiveBloomTab(level)}
                          className={`px-3 py-1.5 text-[11px] font-bold rounded-t-md border-b-2 whitespace-nowrap transition-colors cursor-pointer ${isActive ? 'border-[#1890ff] text-[#1890ff] bg-[#1890ff]/5' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                        >
                          {labels[level - 1]} {hasItems && <span className="ml-1 w-2 h-2 inline-block bg-indigo-500 rounded-full"></span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
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

                  {/* Components List */}
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {ucComponents.filter(c => (c.bloomLevel || 2) === activeBloomTab).length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-md">
                        Nenhum componente cadastrado no Nível {activeBloomTab}. Use os botões acima para estruturar a aula.
                      </div>
                    ) : (
                      ucComponents.map((comp, idx) => {
                        if ((comp.bloomLevel || 2) !== activeBloomTab) return null;
                        return (
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
                            <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-md p-3">
                              <label className="text-[10px] font-extrabold text-slate-600 block">
                                Inserir Imagem
                              </label>
                              <div className="flex flex-col gap-2">
                                <div 
                                  className={`border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#1890ff]/50 cursor-pointer
                                    ${comp.metadata?.isUploading ? 'border-[#1890ff] bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-white'}
                                  `}
                                  tabIndex={0}
                                  onPaste={async (e) => {
                                    const items = e.clipboardData?.items;
                                    if (!items) return;
                                    let imageFile = null;
                                    for (let i = 0; i < items.length; i++) {
                                      if (items[i].type.indexOf('image') !== -1) {
                                        imageFile = items[i].getAsFile();
                                        break;
                                      }
                                    }
                                    if (imageFile) {
                                      e.preventDefault();
                                      setUcComponents(prev => {
                                        const list = [...prev];
                                        if (!list[idx].metadata) list[idx].metadata = {};
                                        list[idx].metadata.isUploading = true;
                                        return list;
                                      });
                                      
                                      try {
                                        const url = await uploadService.uploadFile(imageFile, 'learning-objects');
                                        setUcComponents(prev => {
                                          const list = [...prev];
                                          if (!list[idx].metadata) list[idx].metadata = {};
                                          list[idx].metadata.url = url;
                                          list[idx].metadata.isUploading = false;
                                          return list;
                                        });
                                      } catch (err) {
                                        console.error('Falha ao subir imagem via clipboard', err);
                                        setUcComponents(prev => {
                                          const list = [...prev];
                                          if (list[idx].metadata) list[idx].metadata.isUploading = false;
                                          return list;
                                        });
                                      }
                                    }
                                  }}
                                >
                                  {comp.metadata?.isUploading ? (
                                    <>
                                      <Loader2 className="w-6 h-6 text-[#1890ff] animate-spin mb-2" />
                                      <span className="text-[10px] font-bold text-blue-600">Enviando imagem...</span>
                                    </>
                                  ) : comp.metadata?.url && comp.metadata.url.startsWith('http') ? (
                                    <div className="relative group w-full flex items-center justify-center py-2">
                                      <img src={comp.metadata.url} alt="Preview" className="max-h-48 rounded-md object-contain shadow-2xs" />
                                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setUcComponents(prev => {
                                              const list = [...prev];
                                              if (list[idx].metadata) list[idx].metadata.url = '';
                                              return list;
                                            });
                                          }}
                                          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-[10px] font-bold shadow-2xs flex items-center gap-1.5"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" /> Remover Imagem
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                                      <div className="flex items-center gap-3 mt-2">
                                        <button
                                          type="button"
                                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1890ff] hover:bg-[#116ebc] text-white rounded-md text-[10px] font-bold transition-colors shadow-2xs"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              const clipboardItems = await navigator.clipboard.read();
                                              let foundImage = false;
                                              for (const item of clipboardItems) {
                                                console.log('Tipos encontrados no clipboard:', item.types);
                                                const imageTypes = item.types.filter(type => type.startsWith('image/'));
                                                for (const type of imageTypes) {
                                                  console.log(`[Clipboard] Extraindo blob do tipo ${type}...`);
                                                  const blob = await item.getType(type);
                                                  console.log(`[Clipboard] Blob extraído! Tamanho:`, blob.size);
                                                  const file = new File([blob], `pasted-image-${Date.now()}.png`, { type });
                                                  
                                                  foundImage = true;
                                                  
                                                  setUcComponents(prev => {
                                                    const list = [...prev];
                                                    if (!list[idx].metadata) list[idx].metadata = {};
                                                    list[idx].metadata.isUploading = true;
                                                    return list;
                                                  });
                                                  
                                                  try {
                                                    console.log(`[Clipboard] Iniciando chamada para uploadService...`);
                                                    const url = await uploadService.uploadFile(file, 'learning-objects');
                                                    console.log(`[Clipboard] Upload Service retornou com URL:`, url);
                                                    setUcComponents(prev => {
                                                      const list = [...prev];
                                                      if (!list[idx].metadata) list[idx].metadata = {};
                                                      list[idx].metadata.url = url;
                                                      list[idx].metadata.isUploading = false;
                                                      return list;
                                                    });
                                                  } catch (err) {
                                                    console.error('Falha ao subir imagem do clipboard', err);
                                                    setUcComponents(prev => {
                                                      const list = [...prev];
                                                      if (list[idx].metadata) list[idx].metadata.isUploading = false;
                                                      return list;
                                                    });
                                                    alert('Erro ao enviar imagem para o servidor: ' + (err as Error).message);
                                                  }
                                                  return;
                                                }
                                              }
                                              if (!foundImage) {
                                                alert('Nenhuma imagem encontrada na área de transferência. Tipos detectados: ' + (clipboardItems[0]?.types.join(', ') || 'Nenhum'));
                                              }
                                            } catch (err: any) {
                                              console.error('Clipboard Error:', err);
                                              alert(`Não foi possível ler a área de transferência.\nErro: ${err.name} - ${err.message}\n\nDica: Use o atalho Ctrl+V dentro da área tracejada.`);
                                            }
                                          }}
                                        >
                                          <ClipboardPaste className="w-3.5 h-3.5" /> Colar do Clipboard
                                        </button>
                                        
                                        <span className="text-[10px] text-slate-400 font-medium">ou</span>
                                        
                                        <input 
                                          type="file" 
                                          accept="image/*"
                                          className="text-[10px] file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              setUcComponents(prev => {
                                                const list = [...prev];
                                                if (!list[idx].metadata) list[idx].metadata = {};
                                                list[idx].metadata.isUploading = true;
                                                return list;
                                              });
                                              
                                              try {
                                                const url = await uploadService.uploadFile(file, 'learning-objects');
                                                setUcComponents(prev => {
                                                  const list = [...prev];
                                                  if (!list[idx].metadata) list[idx].metadata = {};
                                                  list[idx].metadata.url = url;
                                                  list[idx].metadata.isUploading = false;
                                                  return list;
                                                });
                                              } catch (err) {
                                                console.error('Falha ao subir arquivo', err);
                                                setUcComponents(prev => {
                                                  const list = [...prev];
                                                  if (list[idx].metadata) list[idx].metadata.isUploading = false;
                                                  return list;
                                                });
                                                alert('Erro ao enviar imagem para o servidor: ' + (err as Error).message);
                                              }
                                            }
                                          }}
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-extrabold text-slate-500">URL Alternativa:</span>
                                  <input 
                                    type="text" 
                                    value={comp.metadata?.url || ''} 
                                    onChange={(e) => {
                                      const list = [...ucComponents];
                                      if (!list[idx].metadata) list[idx].metadata = {};
                                      list[idx].metadata.url = e.target.value;
                                      setUcComponents(list);
                                    }}
                                    placeholder="https://unsplash.com/... (se não for upload)"
                                    className="flex-1 p-2 bg-white border border-slate-200 rounded-md text-[10px] font-mono"
                                    disabled={comp.metadata?.isUploading}
                                  />
                                </div>
                              </div>
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
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        const areas = Array.from(new Set(unidades.map(u => u.area || 'Outros')));
        
        return (
          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-xs text-blue-900 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#1890ff] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm">Estrutura Atômica Independente & Áreas de Conhecimento</span>
                  As Unidades de Conhecimento (UCs) são blocos autônomos de aprendizado agrupados por sua respectiva Personalidade / Área (P).
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

            {areas.map((areaCodigo) => {
              const ucsDaArea = unidades.filter(u => (u.area || 'Outros') === areaCodigo);
              const areaObj = areasList.find(a => a.code === areaCodigo);
              const areaNome = areaObj ? `${areaObj.name} (${areaCodigo})` : (areaCodigo === 'Outros' ? 'Outras Áreas' : areaCodigo);
              
              return (
                <div key={areaCodigo} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-extrabold text-slate-800">{areaNome}</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Área de Conhecimento (P)
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {ucsDaArea.length} {ucsDaArea.length === 1 ? 'Unidade' : 'Unidades'} de Conhecimento
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ucsDaArea.map((uc) => (
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
                            onClick={async (e) => {
                              e.stopPropagation();
                              if(confirm('Excluir Unidade de Conhecimento definitivamente?')) {
                                try {
                                  await dbService.deleteKnowledgeUnit(uc.id);
                                  setUnidades(unidades.filter(u => u.id !== uc.id));
                                  showToast("UC excluída com sucesso.");
                                } catch (err) {
                                  console.error("Erro ao excluir", err);
                                  alert("Falha ao excluir a UC.");
                                }
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

            {/* Pré-requisitos */}
            {selectedUcForModal.pre_requisitos && selectedUcForModal.pre_requisitos.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[#94a3b8] block font-medium uppercase tracking-wider text-[10px]">⛓️ PRÉ-REQUISITOS RECOMENDADOS</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUcForModal.pre_requisitos.map((req, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1890ff]/20 text-[#2fd9f4] border border-[#2fd9f4]/20"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
      {/* Taxonomy Management Modal */}
      {isTaxonomyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Gerenciar Opções: {taxCategory === 'AREA' ? 'Áreas (P)' : 'Contextos (S)'}
              </h2>
              <button onClick={() => setIsTaxonomyModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-4">
                <div className="flex gap-2 items-end bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Código</label>
                    <input 
                      type="text" 
                      value={taxNewCode} 
                      onChange={e => setTaxNewCode(e.target.value.toUpperCase())}
                      placeholder="Ex: FIN"
                      className="w-full p-2 rounded-md border border-slate-300 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nome da Opção</label>
                    <input 
                      type="text" 
                      value={taxNewName} 
                      onChange={e => setTaxNewName(e.target.value)}
                      placeholder="Ex: Finanças"
                      className="w-full p-2 rounded-md border border-slate-300 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={handleSaveTaxonomy}
                      className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center justify-center"
                      title={editingTaxId ? "Salvar Alteração" : "Adicionar"}
                    >
                      {editingTaxId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                    {editingTaxId && (
                       <button
                         onClick={() => {
                           setEditingTaxId(null);
                           setTaxNewCode('');
                           setTaxNewName('');
                         }}
                         className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition-colors flex items-center justify-center"
                         title="Cancelar Edição"
                       >
                         <XCircle className="w-4 h-4" />
                       </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase">Opções Existentes</h3>
                  {(taxCategory === 'AREA' ? areasList : contextsList).map(tax => (
                    <div key={tax.id} className="flex items-center justify-between p-2 rounded-md border border-slate-100 hover:border-slate-300 transition-colors bg-white">
                      <div>
                        <span className="inline-block w-16 text-xs font-bold text-slate-800">{tax.code}</span>
                        <span className="text-xs text-slate-600">{tax.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            setEditingTaxId(tax.id);
                            setTaxNewCode(tax.code);
                            setTaxNewName(tax.name);
                          }}
                          className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTaxonomy(tax.id, taxCategory)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(taxCategory === 'AREA' ? areasList : contextsList).length === 0 && (
                    <div className="text-center p-4 text-slate-500 text-xs italic">Nenhuma opção cadastrada.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Signatures Modal */}
      {isSignaturesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Assinaturas Disponíveis (UC)</h3>
              <button onClick={() => setIsSignaturesModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 bg-slate-50 flex-1">
              {[baseSignature, ...ucSignatures].filter(Boolean).map((sig, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    setEditingSignatureIndex(idx === 0 ? null : idx - 1);
                    const parsed = PMESTGeneratorService.parseSignature(sig);
                    if (parsed) {
                      setUcArea(parsed.area);
                      setUcTopico(parsed.topic);
                      setUcMetaBloom(parsed.bloom);
                      setUcContext(parsed.context);
                      setUcDuracao(parsed.durationMin);
                    }
                    setIsSignaturesModalOpen(false);
                  }}
                  className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono font-bold text-indigo-700">{sig}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ucTitulo || 'Sem título'}</p>
                </div>
              ))}
              {[baseSignature, ...ucSignatures].filter(Boolean).length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm">
                  Nenhuma assinatura configurada ainda.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
