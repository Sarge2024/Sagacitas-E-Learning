import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Course, Module, Lesson } from '../../types';
import { UnidadeConhecimento } from '../../types/edtechExpert';
import { CourseUCSlot } from '../../types/courseComposition';
import { supabase } from '../../lib/supabaseClient';
import {
  ArrowLeft,
  Search,
  Layers,
  GripVertical,
  X,
  Save,
  CheckCircle2,
  BookOpen,
  BrainCircuit,
  Clock,
  Presentation,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Package,
  Trash2,
  FolderPlus,
  Folder,
  FileText
} from 'lucide-react';

interface CourseUCComposerViewProps {
  course: Course;
  unidades: UnidadeConhecimento[];
  onBack: () => void;
  onOpenSlideEditor: (course: Course, filteredUcIds?: string[]) => void;
}

export const CourseUCComposerView: React.FC<CourseUCComposerViewProps> = ({
  course,
  unidades,
  onBack,
  onOpenSlideEditor,
}) => {
  const [slots, setSlots] = useState<CourseUCSlot[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dragOverLessonSeq, setDragOverLessonSeq] = useState<number | null>(null);
  const [isDraggingFromPanel, setIsDraggingFromPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState('');

  // Load modules & slots from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setHasLoadError(false);

        // Load Course info to get modules
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('modules')
          .eq('id', course.id)
          .single();

        if (courseError) {
          throw new Error(`Erro ao carregar módulos: ${courseError.message}`);
        }

        if (courseData) {
          setModules(courseData.modules || course.modules || []);
        } else {
          setModules(course.modules || []);
        }

        // Load composition slots
        const { data, error } = await supabase
          .from('course_knowledge_units')
          .select('*')
          .eq('course_id', course.id)
          .order('sequence_order', { ascending: true });

        if (error) throw error;
        if (data) {
          setSlots(data.map((item: any) => ({
            id: item.id || `slot-${item.uc_id}-${Date.now()}`,
            uc_id: item.uc_id,
            sequence_order: item.sequence_order,
            aula_group: item.aula_group || 1,
            is_split: item.is_split || false
          })));
        }
      } catch (err: any) {
        console.error('Failed to load course composition from Supabase:', err);
        setHasLoadError(true);
        setLoadErrorMessage(err.message || 'Falha ao carregar os dados. O salvamento foi bloqueado por segurança.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [course.id]);

  // Bloom level helper
  const getBloomLabel = (level: string) => {
    const map: Record<string, string> = {
      CONHECIMENTO: 'Conhecimento',
      COMPREENSAO: 'Compreensão',
      APLICACAO_SIMPLES: 'Aplicação Simples',
      APLICACAO_MEDIO: 'Aplicação Média',
      APLICACAO_COMPLEXO: 'Aplicação Complexa',
      ANALISE: 'Análise',
      AVALIACAO: 'Avaliação',
      SINTESE: 'Síntese',
    };
    return map[level] || level;
  };

  const getBloomBadgeStyle = (level: string) => {
    switch (level) {
      case 'CONHECIMENTO': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPREENSAO': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'APLICACAO_SIMPLES':
      case 'APLICACAO_MEDIO':
      case 'APLICACAO_COMPLEXO': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ANALISE': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'AVALIACAO': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SINTESE': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const usedUcIds = new Set(slots.map(s => s.uc_id));

  // Filter available UCs
  const availableUcs = unidades.filter(uc => {
    if (usedUcIds.has(uc.id)) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      uc.titulo.toLowerCase().includes(q) ||
      (uc.codigo ?? '').toLowerCase().includes(q) ||
      (uc.descricao_curta || '').toLowerCase().includes(q)
    );
  });

  const getUc = useCallback(
    (ucId: string) => unidades.find(u => u.id === ucId),
    [unidades]
  );

  // --- CRUD Módulos ---
  const handleAddModule = () => {
    const nextModNum = modules.length + 1;
    const newModule: Module = {
      id: `mod-${Date.now()}-${nextModNum}`,
      title: `Módulo ${nextModNum}: Novo Módulo`,
      focus: 'Foco de aprendizado do módulo.',
      duration: '1h 30min',
      lessons: []
    };
    setModules([...modules, newModule]);
  };

  const handleUpdateModule = (moduleId: string, updates: Partial<Module>) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, ...updates } : m));
  };

  const handleDeleteModule = (moduleId: string) => {
    if (confirm('Tem certeza que deseja excluir este módulo e todas as suas aulas?')) {
      setModules(modules.filter(m => m.id !== moduleId));
    }
  };

  // --- CRUD Aulas ---
  const handleAddLesson = (moduleId: string) => {
    setModules(modules.map(m => {
      if (m.id !== moduleId) return m;
      const nextNum = m.lessons.length + 1;
      const newLesson: Lesson = {
        id: `aula-${Date.now()}-${nextNum}`,
        number: String(nextNum).padStart(2, '0'),
        title: `Aula ${String(nextNum).padStart(2, '0')}: Nova Aula`,
        duration: '15:00',
        completed: false,
        active: nextNum === 1,
        description: 'Descrição breve dos objetivos didáticos desta aula.'
      };
      return {
        ...m,
        lessons: [...m.lessons, newLesson]
      };
    }));
  };

  const handleUpdateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setModules(modules.map(m => {
      if (m.id !== moduleId) return m;
      return {
        ...m,
        lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l)
      };
    }));
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    if (confirm('Deseja excluir esta aula?')) {
      setModules(modules.map(m => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          lessons: m.lessons.filter(l => l.id !== lessonId).map((l, idx) => ({
            ...l,
            number: String(idx + 1).padStart(2, '0')
          }))
        };
      }));
    }
  };

  // --- Drag & Drop UCs to Lessons ---
  const handleSidebarDragStart = (e: React.DragEvent, ucId: string) => {
    e.dataTransfer.setData('text/uc-id', ucId);
    e.dataTransfer.setData('text/source', 'panel');
    e.dataTransfer.effectAllowed = 'copy';
    setIsDraggingFromPanel(true);
  };

  const handleSlotDragStart = (e: React.DragEvent, slotId: string) => {
    e.dataTransfer.setData('text/slot-id', slotId);
    e.dataTransfer.setData('text/source', 'composition');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverLesson = (e: React.DragEvent, lessonSeqNum: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLessonSeq(lessonSeqNum);
  };

  const handleDropOnLesson = (e: React.DragEvent, lessonSeqNum: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLessonSeq(null);

    const source = e.dataTransfer.getData('text/source');
    if (source === 'panel') {
      const ucId = e.dataTransfer.getData('text/uc-id');
      if (!ucId || usedUcIds.has(ucId)) return;

      const newSlot: CourseUCSlot = {
        id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        uc_id: ucId,
        sequence_order: slots.length,
        aula_group: lessonSeqNum,
        is_split: false
      };
      setSlots([...slots, newSlot]);
    } else if (source === 'composition') {
      const slotId = e.dataTransfer.getData('text/slot-id');
      if (!slotId) return;

      // Move slot to this lesson group
      setSlots(slots.map(s => s.id === slotId ? { ...s, aula_group: lessonSeqNum } : s));
    }
  };

  const handleRemoveSlot = (slotId: string) => {
    setSlots(slots.filter(s => s.id !== slotId));
  };

  const handleToggleSplit = (slotId: string) => {
    setSlots(slots.map(s => s.id === slotId ? { ...s, is_split: !s.is_split } : s));
  };

  const handleAddUcDirectly = (ucId: string) => {
    if (usedUcIds.has(ucId)) return;
    
    // Encontrar primeira aula disponível
    let firstLessonSeq = 1;
    
    const newSlot: CourseUCSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      uc_id: ucId,
      sequence_order: slots.length,
      aula_group: firstLessonSeq,
      is_split: false
    };
    setSlots([...slots, newSlot]);
  };

  // Reordenação de UC dentro da mesma aula
  const handleMoveUcInLesson = (slotId: string, direction: 'up' | 'down') => {
    const slotIdx = slots.findIndex(s => s.id === slotId);
    if (slotIdx === -1) return;
    
    const seq = slots[slotIdx].aula_group;
    const lessonSlots = slots.filter(s => s.aula_group === seq);
    const inLessonIdx = lessonSlots.findIndex(s => s.id === slotId);
    
    if (direction === 'up' && inLessonIdx > 0) {
      const targetSlot = lessonSlots[inLessonIdx - 1];
      const targetIdx = slots.findIndex(s => s.id === targetSlot.id);
      const newSlots = [...slots];
      [newSlots[slotIdx], newSlots[targetIdx]] = [newSlots[targetIdx], newSlots[slotIdx]];
      setSlots(newSlots);
    } else if (direction === 'down' && inLessonIdx < lessonSlots.length - 1) {
      const targetSlot = lessonSlots[inLessonIdx + 1];
      const targetIdx = slots.findIndex(s => s.id === targetSlot.id);
      const newSlots = [...slots];
      [newSlots[slotIdx], newSlots[targetIdx]] = [newSlots[targetIdx], newSlots[slotIdx]];
      setSlots(newSlots);
    }
  };

  const handleSave = async () => {
    if (hasLoadError) {
      alert("Operação bloqueada: Os dados originais não puderam ser carregados corretamente. Salvar agora poderia apagar registros existentes.");
      return;
    }

    try {
      // 1. Deletar associações antigas
      const { error: deleteError } = await supabase
        .from('course_knowledge_units')
        .delete()
        .eq('course_id', course.id);

      if (deleteError) throw deleteError;

      // 2. Inserir novas associações
      if (slots.length > 0) {
        const payload = slots.map((s, idx) => ({
          course_id: course.id,
          uc_id: s.uc_id,
          sequence_order: idx,
          aula_group: s.aula_group || 1,
          is_split: s.is_split || false
        }));

        const { error: insertError } = await supabase
          .from('course_knowledge_units')
          .insert(payload);

        if (insertError) throw insertError;
      }

      // 3. Atualizar módulos e aulas estruturais do curso
      const { error: courseError } = await supabase
        .from('courses')
        .update({ modules })
        .eq('id', course.id);

      if (courseError) throw courseError;

      // Sincronizar em memória local
      course.modules = modules;

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save course composition to Supabase:', err);
      alert('Erro ao salvar composição do curso no banco de dados.');
    }
  };

  // Cálculo de estatísticas didáticas
  const totalMinutes = slots.reduce((sum, s) => {
    const uc = getUc(s.uc_id);
    return sum + (uc?.duracao_estimada_minutos || 0);
  }, 0);

  const totalElements = slots.reduce((sum, s) => {
    const uc = getUc(s.uc_id);
    return sum + (uc?.layout_template.components.length || 0);
  }, 0);

  // Computa a numeração sequencial das aulas de forma global
  let runningLessonSeq = 0;

  return (
    <div className="pt-16 md:pt-18 px-3 md:px-5 pb-8 max-w-[1440px] mx-auto space-y-4 bg-[#f9f9ff] min-h-screen">
      {savedSuccess && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white font-bold px-3.5 py-2 rounded shadow-lg flex items-center gap-2 animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs">Composição e estrutura salvas com sucesso!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-md border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors cursor-pointer text-slate-500 hover:text-slate-900 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#1890ff] text-[10px] font-black uppercase tracking-wider">
                {course.category || 'Treinamento'}
              </span>
              {course.course_code && (
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-mono rounded font-bold">
                  {course.course_code}
                </span>
              )}
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              {course.title}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Crie a estrutura de módulos e aulas do curso, depois aloque as Unidades de Conhecimento.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-md border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#1890ff]" />
              <span className="font-bold text-slate-700">{slots.length} UCs</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#1890ff]" />
              <span className="font-bold text-slate-700">{totalMinutes} min</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#1890ff]" />
              <span className="font-bold text-slate-700">{totalElements} elem.</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={hasLoadError}
            className={`px-4 py-2 ${hasLoadError ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#1890ff] hover:bg-[#096dd9] cursor-pointer'} text-white rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs`}
          >
            <Save className="w-4 h-4" />
            <span>Salvar Estrutura</span>
          </button>
        </div>
      </div>

      {hasLoadError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex flex-col gap-2 shadow-sm">
          <div className="flex items-center gap-2 font-bold">
            <X className="w-5 h-5" />
            Erro Crítico de Carregamento
          </div>
          <p className="text-sm">{loadErrorMessage}</p>
          <p className="text-sm font-medium">A edição e o salvamento foram bloqueados para evitar a perda de dados. Atualize a página e tente novamente.</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: 'calc(100vh - 220px)' }}>
        {/* CENTER: Modules / Lessons CRUD List */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1890ff]" />
              Estrutura Curricular (Módulos & Aulas)
            </h3>
            <button
              onClick={handleAddModule}
              disabled={hasLoadError}
              className={`px-3 py-1 ${hasLoadError ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 cursor-pointer'} text-white rounded font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Adicionar Módulo</span>
            </button>
          </div>

          <div className="space-y-4">
            {modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-md border border-slate-200 text-slate-400 space-y-3 shadow-2xs">
                <Folder className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-bold text-slate-500">Nenhum módulo cadastrado neste treinamento</p>
                <button
                  onClick={handleAddModule}
                  className="px-3.5 py-1.5 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded text-xs font-bold transition-all cursor-pointer"
                >
                  Criar Primeiro Módulo
                </button>
              </div>
            ) : (
              modules.map((mod, modIdx) => (
                <div key={mod.id} className="bg-white border border-slate-200 rounded-md p-4 space-y-4 shadow-2xs">
                  {/* Module header editor */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="space-y-1 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-[#1890ff] shrink-0" />
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => handleUpdateModule(mod.id, { title: e.target.value })}
                          className="bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#1890ff] font-extrabold text-sm text-slate-800 px-2 py-1 rounded outline-none w-full max-w-md transition-colors"
                        />
                      </div>
                      <input
                        type="text"
                        value={mod.focus || ''}
                        onChange={(e) => handleUpdateModule(mod.id, { focus: e.target.value })}
                        placeholder="Escreva o foco pedagógico deste módulo..."
                        className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#1890ff] text-xs text-slate-500 px-2 py-0.5 outline-none w-full transition-colors font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAddLesson(mod.id)}
                        disabled={hasLoadError}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${hasLoadError ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer'} rounded transition-colors flex items-center gap-1`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Aula</span>
                      </button>
                      <button
                        onClick={() => handleDeleteModule(mod.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Excluir Módulo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons list inside Module */}
                  <div className="space-y-3 pl-2">
                    {mod.lessons.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Nenhuma aula cadastrada neste módulo. Adicione uma aula para alocar as UCs.</p>
                    ) : (
                      mod.lessons.map((lesson) => {
                        runningLessonSeq += 1;
                        const lessonSeq = runningLessonSeq;
                        const lessonSlots = slots.filter(s => s.aula_group === lessonSeq);
                        const isDragOver = dragOverLessonSeq === lessonSeq;

                        return (
                          <div
                            key={lesson.id}
                            onDragOver={(e) => handleDragOverLesson(e, lessonSeq)}
                            onDragLeave={() => setDragOverLessonSeq(null)}
                            onDrop={(e) => handleDropOnLesson(e, lessonSeq)}
                            className={`p-3.5 rounded-md border transition-all space-y-3 ${
                              isDragOver
                                ? 'border-[#1890ff] bg-blue-50/40 ring-2 ring-blue-100'
                                : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                            }`}
                          >
                            {/* Lesson Title Editor */}
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1 pr-4">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-mono font-bold rounded shrink-0">
                                    Aula {lesson.number}
                                  </span>
                                  <input
                                    type="text"
                                    value={lesson.title}
                                    onChange={(e) => handleUpdateLesson(mod.id, lesson.id, { title: e.target.value })}
                                    className="bg-slate-100 focus:bg-white border border-transparent focus:border-[#1890ff] font-bold text-xs text-slate-800 px-2 py-0.5 rounded outline-none w-full max-w-sm transition-colors"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={lesson.description || ''}
                                  onChange={(e) => handleUpdateLesson(mod.id, lesson.id, { description: e.target.value })}
                                  placeholder="Escreva o objetivo pedagógico ou resumo da aula..."
                                  className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#1890ff] text-[10px] text-slate-400 px-2 py-0.5 outline-none w-full transition-colors font-medium"
                                />
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => onOpenSlideEditor(course, [lesson.id])}
                                  className="p-1 bg-white hover:bg-blue-50 text-[#1890ff] border border-slate-200 hover:border-blue-200 rounded transition-colors cursor-pointer"
                                  title="Editar Aulas no Editor de Slides"
                                >
                                  <Presentation className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Excluir Aula"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* UCs alocadas na Aula */}
                            <div className="space-y-1.5 pl-4 border-l-2 border-slate-200">
                              {lessonSlots.length === 0 ? (
                                <div className="text-[10px] text-slate-400 py-2 border border-dashed border-slate-300 rounded bg-white/50 text-center">
                                  Arraste UCs aqui para alocá-las nesta Aula
                                </div>
                              ) : (
                                lessonSlots.map((slot, sIdx) => {
                                  const uc = getUc(slot.uc_id);
                                  if (!uc) return null;

                                  return (
                                    <div
                                      key={slot.id}
                                      draggable
                                      onDragStart={(e) => handleSlotDragStart(e, slot.id)}
                                      className="bg-white border border-slate-200 hover:border-[#1890ff] rounded p-2.5 flex items-center justify-between gap-3 shadow-3xs cursor-grab active:cursor-grabbing transition-all group"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-[#1890ff] shrink-0" />
                                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[8px] font-mono font-bold rounded shrink-0">
                                          {uc.codigo}
                                        </span>
                                        <span className="text-xs font-bold text-slate-700 truncate">
                                          {uc.titulo}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        {/* Reordenar em lote */}
                                        <div className="flex items-center">
                                          <button
                                            onClick={() => handleMoveUcInLesson(slot.id, 'up')}
                                            disabled={sIdx === 0}
                                            className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                                          >
                                            <ChevronUp className="w-3 h-3 text-slate-500" />
                                          </button>
                                          <button
                                            onClick={() => handleMoveUcInLesson(slot.id, 'down')}
                                            disabled={sIdx === lessonSlots.length - 1}
                                            className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 cursor-pointer"
                                          >
                                            <ChevronDown className="w-3 h-3 text-slate-500" />
                                          </button>
                                        </div>

                                        <label className="flex items-center gap-1 cursor-pointer" title="Prorrogar Objetos desta UC para a próxima Aula">
                                          <input 
                                            type="checkbox" 
                                            className="w-3 h-3 rounded border-slate-300 text-[#1890ff] cursor-pointer"
                                            checked={slot.is_split || false}
                                            onChange={() => handleToggleSplit(slot.id)}
                                          />
                                          <span className="text-[9px] font-bold text-slate-400">SPLIT</span>
                                        </label>

                                        <button
                                          onClick={() => handleRemoveSlot(slot.id)}
                                          className="text-slate-300 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: Available UCs */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-3">
          <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 220px)' }}>
            <div className="p-3 border-b border-slate-100 space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-[#1890ff]" />
                  UCs Disponíveis
                </h3>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {availableUcs.length}
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar UC por título ou código..."
                  className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {availableUcs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  {searchTerm
                    ? 'Nenhuma UC encontrada com este filtro.'
                    : 'Todas as UCs já foram adicionadas ao curso.'}
                </div>
              ) : (
                availableUcs.map(uc => (
                  <div
                    key={uc.id}
                    draggable
                    onDragStart={(e) => handleSidebarDragStart(e, uc.id)}
                    className="bg-slate-50 border border-slate-200 rounded-md p-3 cursor-grab active:cursor-grabbing hover:border-[#1890ff] hover:bg-blue-50/30 transition-all group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-[#1890ff] shrink-0" />
                        {uc.signatures && uc.signatures.length > 0 ? (
                          uc.signatures.map((sig: any, sIdx: number) => (
                            <span key={sIdx} className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[9px] font-mono font-bold rounded shadow-2xs">
                              {sig.code}
                            </span>
                          ))
                        ) : (
                          <span className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-600 text-[9px] font-mono font-bold rounded">
                            {uc.codigo}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddUcDirectly(uc.id)}
                        className="p-1 bg-[#1890ff]/10 hover:bg-[#1890ff]/20 text-[#1890ff] rounded transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Adicionar ao curso"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2">
                      {uc.titulo}
                    </h4>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 border text-[8px] font-bold rounded ${getBloomBadgeStyle(uc.meta_bloom)}`}>
                        {getBloomLabel(uc.meta_bloom)}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {uc.duracao_estimada_minutos}min
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 border-t border-slate-100 bg-blue-50/50 shrink-0">
              <div className="flex items-start gap-2 text-[10px] text-blue-700">
                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#1890ff]" />
                <span className="font-medium leading-relaxed">
                  Arraste as UCs para uma das Aulas criadas no painel central para vincular os objetos de aprendizagem.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
