import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Course } from '../../types';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingFromPanel, setIsDraggingFromPanel] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Load slots from Supabase on mount
  useEffect(() => {
    const loadSlots = async () => {
      try {
        const { data, error } = await supabase
          .from('course_knowledge_units')
          .select('*')
          .eq('course_id', course.id)
          .order('sequence_order', { ascending: true });

        if (error) throw error;
        if (data) {
          setSlots(data.map((item: any) => ({
            id: item.id,
            uc_id: item.uc_id,
            sequence_order: item.sequence_order,
            aula_group: item.aula_group || undefined
          })));
        }
      } catch (err) {
        console.error('Failed to load course composition from Supabase:', err);
      }
    };
    loadSlots();
  }, [course.id]);

  // Bloom level display helper
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

  // UCs already in the composition
  const usedUcIds = new Set(slots.map(s => s.uc_id));

  // Filter available UCs (not yet added + search)
  const availableUcs = unidades.filter(uc => {
    if (usedUcIds.has(uc.id)) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      uc.titulo.toLowerCase().includes(q) ||
      uc.codigo.toLowerCase().includes(q) ||
      (uc.descricao_curta || '').toLowerCase().includes(q)
    );
  });

  // Get UC data by id
  const getUc = useCallback(
    (ucId: string) => unidades.find(u => u.id === ucId),
    [unidades]
  );

  // ─── Drag from sidebar panel ───
  const handleSidebarDragStart = (e: React.DragEvent, ucId: string) => {
    e.dataTransfer.setData('text/uc-id', ucId);
    e.dataTransfer.setData('text/source', 'panel');
    e.dataTransfer.effectAllowed = 'copy';
    setIsDraggingFromPanel(true);
  };

  // ─── Drag from composition (reorder) ───
  const handleSlotDragStart = (e: React.DragEvent, slotIndex: number) => {
    e.dataTransfer.setData('text/slot-index', String(slotIndex));
    e.dataTransfer.setData('text/source', 'composition');
    e.dataTransfer.effectAllowed = 'move';
    setIsDraggingFromPanel(false);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = isDraggingFromPanel ? 'copy' : 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    setIsDraggingFromPanel(false);

    const source = e.dataTransfer.getData('text/source');

    if (source === 'panel') {
      // Adding a new UC from the sidebar
      const ucId = e.dataTransfer.getData('text/uc-id');
      if (!ucId || usedUcIds.has(ucId)) return;

      const newSlot: CourseUCSlot = {
        id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        uc_id: ucId,
        sequence_order: targetIndex,
      };

      const newSlots = [...slots];
      newSlots.splice(targetIndex, 0, newSlot);
      // Recalculate sequence_order
      setSlots(newSlots.map((s, i) => ({ ...s, sequence_order: i })));
    } else if (source === 'composition') {
      // Reordering within composition
      const fromIndex = parseInt(e.dataTransfer.getData('text/slot-index'), 10);
      if (isNaN(fromIndex) || fromIndex === targetIndex) return;

      const newSlots = [...slots];
      const [moved] = newSlots.splice(fromIndex, 1);
      newSlots.splice(targetIndex, 0, moved);
      setSlots(newSlots.map((s, i) => ({ ...s, sequence_order: i })));
    }
  };

  const handleDropOnZone = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    setIsDraggingFromPanel(false);

    const source = e.dataTransfer.getData('text/source');
    if (source === 'panel') {
      const ucId = e.dataTransfer.getData('text/uc-id');
      if (!ucId || usedUcIds.has(ucId)) return;

      const newSlot: CourseUCSlot = {
        id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        uc_id: ucId,
        sequence_order: slots.length,
      };
      setSlots([...slots, newSlot]);
    } else if (source === 'composition') {
      const fromIndex = parseInt(e.dataTransfer.getData('text/slot-index'), 10);
      if (isNaN(fromIndex)) return;
      
      const newSlots = [...slots];
      const [moved] = newSlots.splice(fromIndex, 1);
      newSlots.push(moved);
      setSlots(newSlots.map((s, i) => ({ ...s, sequence_order: i })));
    }
  };

  const handleRemoveSlot = (slotId: string) => {
    setSlots(slots.filter(s => s.id !== slotId).map((s, i) => ({ ...s, sequence_order: i })));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSlots = [...slots];
    [newSlots[index - 1], newSlots[index]] = [newSlots[index], newSlots[index - 1]];
    setSlots(newSlots.map((s, i) => ({ ...s, sequence_order: i })));
  };

  const handleMoveDown = (index: number) => {
    if (index >= slots.length - 1) return;
    const newSlots = [...slots];
    [newSlots[index], newSlots[index + 1]] = [newSlots[index + 1], newSlots[index]];
    setSlots(newSlots.map((s, i) => ({ ...s, sequence_order: i })));
  };

  const handleAddUcDirectly = (ucId: string) => {
    if (usedUcIds.has(ucId)) return;
    const newSlot: CourseUCSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      uc_id: ucId,
      sequence_order: slots.length,
    };
    setSlots([...slots, newSlot]);
  };

  const handleSave = async () => {
    try {
      // Delete existing slots for this course first
      const { error: deleteError } = await supabase
        .from('course_knowledge_units')
        .delete()
        .eq('course_id', course.id);

      if (deleteError) throw deleteError;

      // Insert current slots
      if (slots.length > 0) {
        const payload = slots.map(s => ({
          course_id: course.id,
          uc_id: s.uc_id,
          sequence_order: s.sequence_order,
          aula_group: s.aula_group || null
        }));

        const { error: insertError } = await supabase
          .from('course_knowledge_units')
          .insert(payload);

        if (insertError) throw insertError;
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save course composition to Supabase:', err);
      alert('Erro ao salvar composição do curso no banco de dados.');
    }
  };

  // Calculate totals
  const totalMinutes = slots.reduce((sum, s) => {
    const uc = getUc(s.uc_id);
    return sum + (uc?.duracao_estimada_minutos || 0);
  }, 0);

  const totalElements = slots.reduce((sum, s) => {
    const uc = getUc(s.uc_id);
    return sum + (uc?.layout_template.components.length || 0);
  }, 0);

  return (
    <div className="pt-16 md:pt-18 px-3 md:px-5 pb-8 max-w-[1440px] mx-auto space-y-4 bg-[#f9f9ff] min-h-screen">
      {/* Toast */}
      {savedSuccess && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white font-bold px-3.5 py-2 rounded shadow-lg flex items-center gap-2 animate-bounce border border-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs">Composição salva com sucesso!</span>
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
              Cadastre e organize as Unidades de Conhecimento que compõem este curso.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Stats */}
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
              <span className="font-bold text-slate-700">{totalElements} elementos</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Composição</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Center + Right Sidebar */}
      <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 220px)' }}>
        {/* ─── CENTER: Drop Zone / Composition Area ─── */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1890ff]" />
              Grade Curricular do Curso
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              Arraste UCs do painel lateral ou use o botão +
            </span>
          </div>

          <div
            ref={dropZoneRef}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={handleDropOnZone}
            className={`min-h-[400px] rounded-md border-2 border-dashed transition-all p-3 space-y-2 ${
              isDraggingFromPanel
                ? 'border-[#1890ff] bg-blue-50/50'
                : slots.length === 0
                ? 'border-slate-200 bg-white'
                : 'border-transparent bg-transparent'
            }`}
          >
            {slots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-md bg-slate-100 flex items-center justify-center">
                  <Layers className="w-8 h-8 text-slate-300" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-slate-500">Nenhuma UC cadastrada neste curso</p>
                  <p className="text-xs">
                    Arraste Unidades de Conhecimento do painel lateral direito para compor a grade curricular.
                  </p>
                </div>
              </div>
            ) : (
              slots.map((slot, index) => {
                const uc = getUc(slot.uc_id);
                if (!uc) return null;

                return (
                  <div key={slot.id}>
                    {/* Drop indicator line */}
                    {dragOverIndex === index && (
                      <div className="h-1 bg-[#1890ff] rounded-md mx-4 my-1 animate-pulse" />
                    )}

                    <div
                      draggable
                      onDragStart={(e) => handleSlotDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      className="bg-white border border-slate-200 rounded-md p-4 hover:border-[#1890ff] transition-all shadow-2xs group flex items-start gap-3 cursor-grab active:cursor-grabbing"
                    >
                      {/* Drag handle + Order */}
                      <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                        <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-[#1890ff] transition-colors" />
                        <span className="text-[10px] font-mono font-black text-slate-400">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex flex-col gap-0.5 mt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                            disabled={index === 0}
                            className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 cursor-pointer transition-colors"
                          >
                            <ChevronUp className="w-3 h-3 text-slate-500" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                            disabled={index >= slots.length - 1}
                            className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 cursor-pointer transition-colors"
                          >
                            <ChevronDown className="w-3 h-3 text-slate-500" />
                          </button>
                        </div>
                      </div>

                      {/* UC Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-mono font-bold rounded">
                            {uc.codigo}
                          </span>
                          <span className={`px-2 py-0.5 border text-[9px] font-bold rounded ${getBloomBadgeStyle(uc.meta_bloom)}`}>
                            {getBloomLabel(uc.meta_bloom)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {uc.duracao_estimada_minutos} min
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                          {uc.titulo}
                        </h4>

                        <p className="text-xs text-slate-500 font-medium line-clamp-1">
                          {uc.descricao_curta}
                        </p>

                        {/* Elements preview */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-bold">
                            {uc.layout_template.components.length} elementos:
                          </span>
                          {uc.layout_template.components.slice(0, 4).map((comp, ci) => (
                            <span
                              key={ci}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100 text-slate-500 font-medium capitalize"
                            >
                              {comp.type === 'text' ? '📝 Texto' :
                               comp.type === 'image' ? '🖼️ Imagem' :
                               comp.type === 'video' ? '🎬 Vídeo' :
                               comp.type === 'audio' ? '🔊 Áudio' :
                               comp.type === 'question' ? '❓ Questão' :
                               comp.type === 'simulation' ? '⚡ Simulação' :
                               comp.type}
                            </span>
                          ))}
                          {uc.layout_template.components.length > 4 && (
                            <span className="text-[9px] text-slate-400 font-bold">
                              +{uc.layout_template.components.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSlideEditor(course, [slot.uc_id]);
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1890ff] border border-blue-200 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Presentation className="w-3.5 h-3.5" />
                          <span>Editar Aula</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveSlot(slot.id); }}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                          title="Remover UC do curso"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Drop indicator at the end */}
            {dragOverIndex !== null && dragOverIndex >= slots.length && (
              <div className="h-1 bg-[#1890ff] rounded-md mx-4 my-1 animate-pulse" />
            )}
          </div>
        </div>

        {/* ─── RIGHT SIDEBAR: Available UCs ─── */}
        <div className="w-[320px] shrink-0 space-y-3">
          <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 220px)' }}>
            {/* Sidebar header */}
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

            {/* Sidebar list */}
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
                    onDragEnd={() => setIsDraggingFromPanel(false)}
                    className="bg-slate-50 border border-slate-200 rounded-md p-3 cursor-grab active:cursor-grabbing hover:border-[#1890ff] hover:bg-blue-50/30 transition-all group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-[#1890ff] shrink-0" />
                        <span className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-600 text-[9px] font-mono font-bold rounded">
                          {uc.codigo}
                        </span>
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
                      <span className="text-[9px] text-slate-400 font-medium">
                        {uc.layout_template.components.length} elem.
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar footer hint */}
            <div className="p-2.5 border-t border-slate-100 bg-blue-50/50 shrink-0">
              <div className="flex items-start gap-2 text-[10px] text-blue-700">
                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#1890ff]" />
                <span className="font-medium leading-relaxed">
                  Arraste os cards para a área central ou clique no botão <strong>+</strong> para adicionar ao final da grade.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
