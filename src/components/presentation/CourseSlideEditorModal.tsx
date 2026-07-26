import React, { useState } from 'react';
import { usePresentationStore, SAMPLE_PRESENTATION } from '../../store/usePresentationStore';
import { SlidePlayer } from './SlidePlayer';
import { SlideEditor } from './SlideEditor';
import { PropertyInspector } from './PropertyInspector';
import { X, Play, Edit3, Plus, Trash2, Save, Undo2, Redo2, Layers, Check, Sparkles, BookOpen, Image as ImageIcon, Loader2, Sun, Moon } from 'lucide-react';
import { Course } from '../../types';
import { analyzeSlideImage } from '../../utils/slideImport';
import { UnidadeConhecimento } from '../../types/edtechExpert';
import { FileText, Volume2, HelpCircle, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface CourseSlideEditorModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSaveCourseSlides?: (courseId: string, updatedPresentation: any) => void;
  unidades?: UnidadeConhecimento[];
  initialUcId?: string;
}

export const CourseSlideEditorModal: React.FC<CourseSlideEditorModalProps> = ({
  course,
  isOpen,
  onClose,
  onSaveCourseSlides,
  unidades = [],
  initialUcId = '',
}) => {
  const {
    presentation,
    setPresentation,
    currentSlideIndex,
    mode,
    theme,
    setMode,
    setTheme,
    setCurrentSlideIndex,
    nextSlide,
    prevSlide,
    addSlide,
    removeSlide,
    addElement,
    undo,
    redo,
    historyIndex,
    history,
  } = usePresentationStore();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Right sidebar tab and selection states
  const [editorRightTab, setEditorRightTab] = useState<'properties' | 'uc-materials'>('properties');
  const [selectedUcIdForEditor, setSelectedUcIdForEditor] = useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      if (course.presentation) {
        setPresentation(course.presentation);
      } else {
        setPresentation(SAMPLE_PRESENTATION);
      }
      if (initialUcId) {
        setSelectedUcIdForEditor(initialUcId);
        setEditorRightTab('uc-materials');
      }
    }
  }, [isOpen, course.id, course.presentation, initialUcId, setPresentation]);

  const [learningObjects, setLearningObjects] = useState<any[]>([]);
  const [maxAulas, setMaxAulas] = useState<number>(1);
  const [collapsedAulas, setCollapsedAulas] = useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (selectedUcIdForEditor) {
      const fetchObjects = async () => {
        const uc = unidades.find(u => u.id === selectedUcIdForEditor);
        
        // Mapear objetos armazenados localmente na própria UC (do EdTechExpertView)
        if (uc && uc.layout_template?.components && uc.layout_template.components.length > 0) {
          const mapped = uc.layout_template.components.map((comp: any, idx: number) => {
            let objType = comp.type;
            let title = comp.title || 'Objeto ' + (idx + 1);
            let payload: any = { text: comp.body };
            
            if (comp.type === 'image') {
              payload.url = comp.metadata?.url || '';
            } else if (comp.type === 'video') {
              payload.url = comp.metadata?.url || '';
            } else if (comp.type === 'question') {
              objType = 'question';
              payload.question = comp.body;
              payload.options = comp.metadata?.options?.map((o: any) => o.text) || [];
              payload.correctIndex = comp.metadata?.options?.findIndex((o: any) => o.isCorrect) || 0;
              payload.explanation = comp.metadata?.justification || '';
            } else if (comp.type === 'simulation') {
              objType = 'simulation';
            }

            return {
              id: `mapped-${idx}`,
              object_type: objType,
              title: title,
              content_payload: payload,
              _originalComp: comp
            };
          });
          setLearningObjects(mapped);
          return;
        }

        // Fallback: buscar na tabela do Supabase
        const { data } = await supabase
          .from('learning_objects')
          .select('*')
          .eq('knowledge_unit_id', selectedUcIdForEditor);
        setLearningObjects(data || []);
      };
      fetchObjects();
    } else {
      setLearningObjects([]);
    }
  }, [selectedUcIdForEditor, unidades]);

  React.useEffect(() => {
    if (presentation.slides.length > 0) {
      setMaxAulas(prev => Math.max(prev, ...presentation.slides.map(s => s.aula_group || 1)));
    }
  }, [presentation.slides]);

  const toggleAulaCollapse = (aulaId: number) => {
    setCollapsedAulas(prev => {
      const next = new Set(prev);
      if (next.has(aulaId)) next.delete(aulaId);
      else next.add(aulaId);
      return next;
    });
  };

  const handleAddNewAula = () => setMaxAulas(prev => prev + 1);

  const handleInsertUcElement = (oa: any) => {
    if (!currentSlide) return;
    
    let elemType: any = 'text';
    let elemContent: any = {};
    
    switch (oa.object_type) {
      case 'reading':
      case 'case_study':
        elemType = 'text';
        elemContent = {
          text: oa.content_payload?.text || oa.title,
          style: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: theme === 'dark' ? '#ffffff' : '#0f172a',
            fontFamily: 'Outfit, sans-serif'
          }
        };
        break;
      case 'video':
        elemType = 'video';
        elemContent = {
          src: oa.content_payload?.url || 'https://www.w3schools.com/html/mov_bbb.mp4',
          mediaSettings: {
            autoPlay: false,
            controls: true
          }
        };
        break;
      case 'image':
        elemType = 'image';
        elemContent = {
          src: oa.content_payload?.url || 'https://via.placeholder.com/800x600?text=Nova+Imagem',
          alt: oa.title
        };
        break;
      case 'question':
      case 'quiz':
        elemType = 'question';
        elemContent = {
          quizData: {
            question: oa.content_payload?.question || oa.title,
            options: oa.content_payload?.options || ['A', 'B', 'C', 'D'],
            correctIndex: oa.content_payload?.correctIndex ?? 0,
            explanation: oa.content_payload?.explanation
          }
        };
        break;
      case 'simulation':
      case 'dre_simulation':
        elemType = 'simulation';
        elemContent = {
          widgetComponent: 'DRESimulatorWidget',
          text: oa.title
        };
        break;
      default:
        elemType = 'text';
        elemContent = { text: oa.title };
    }

    const newElement = {
      id: `elem-uc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: elemType,
      x: 20,
      y: elemType === 'question' || elemType === 'simulation' ? 10 : 30,
      width: elemType === 'question' || elemType === 'simulation' ? 80 : 60,
      height: elemType === 'question' || elemType === 'simulation' ? 80 : 20,
      zIndex: currentSlide.elements.length + 10,
      content: elemContent,
      animation: {
        effect: 'fadeIn',
        duration: 0.8,
        delay: 0.1,
        order: 1
      }
    };

    addElement(currentSlide.id, newElement as any);
  };

  if (!isOpen) return null;

  const currentSlide = presentation.slides[currentSlideIndex] || presentation.slides[0];

  const handleAddNewSlideToAula = (aulaGroup: number) => {
    const newSlideId = `slide-${Date.now()}`;
    addSlide({
      id: newSlideId,
      aula_group: aulaGroup,
      title: `Slide ${presentation.slides.length + 1}`,
      background: {
        type: 'color',
        value: '#12171c',
      },
      elements: [
        {
          id: `elem-${Date.now()}-1`,
          type: 'text',
          x: 10,
          y: 20,
          width: 80,
          height: 20,
          zIndex: 10,
          content: {
            text: 'Novo Slide do Treinamento',
            style: {
              fontSize: '1.8rem',
              fontWeight: '800',
              color: '#0a6ed1',
            },
          },
          animation: {
            effect: 'fadeIn',
            duration: 0.8,
            delay: 0.1,
            order: 1,
          },
        },
      ],
    });
  };

  const handleRunAiOcr = async () => {
    if (!currentSlide) return;
    setIsAnalyzing(true);
    try {
      const detectedElements = await analyzeSlideImage(currentSlide.background.value || '');
      detectedElements.forEach((elem) => {
        addElement(currentSlide.id, elem);
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (onSaveCourseSlides) {
      onSaveCourseSlides(course.id, presentation);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden ${theme === 'dark' ? 'bg-slate-950/90' : 'bg-slate-500/50'}`}>
      <div className={`w-full max-w-[1500px] h-[92vh] border rounded-md shadow-2xs flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
        {/* Modal Header */}
        <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${theme === 'dark' ? 'bg-[#12171c] border-white/10' : 'bg-[#f9f9ff] border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[#0a6ed1] to-[#0854a0] flex items-center justify-center text-white font-black shrink-0 shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0a6ed1]">
                  Editor & Player de Slides
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${theme === 'dark' ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>
                  {course.title}
                </span>
              </div>
              <h2 className={`text-base font-extrabold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {presentation.title}
              </h2>
            </div>
          </div>

          {/* Controls & Toggle */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-md transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-200 text-indigo-600 hover:bg-slate-300'}`}
              title="Alternar Tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mode Toggle */}
            <div className={`p-1 border rounded-md flex items-center gap-1 ${theme === 'dark' ? 'bg-[#1c222b] border-white/10' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => setMode('player')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'player'
                    ? 'bg-[#0a6ed1] text-white shadow-2xs font-black'
                    : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Player</span>
              </button>
              <button
                onClick={() => setMode('editor')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'editor'
                    ? 'bg-[#0854a0] text-white shadow-2xs font-black'
                    : (theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
            </div>

            {/* Extrai Texto por IA (Only in Editor) */}
            {mode === 'editor' && (
              <button
                onClick={handleRunAiOcr}
                disabled={isAnalyzing}
                className="px-3 py-1.5 bg-[#0a6ed1]/20 hover:bg-[#0a6ed1]/30 border border-[#0a6ed1]/40 text-[#0a6ed1] rounded-md font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Extrair Camadas de Texto da Imagem com IA/OCR"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#0a6ed1]" />
                )}
                <span>Extrair Texto IA</span>
              </button>
            )}

            {/* Undo / Redo (Only in Editor) */}
            {mode === 'editor' && (
              <div className={`flex items-center gap-1 border-l pl-2 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  disabled={historyIndex <= 0}
                  onClick={undo}
                  className={`p-2 border rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-white/10 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'}`}
                  title="Desfazer (Undo)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  disabled={historyIndex >= history.length - 1}
                  onClick={redo}
                  className={`p-2 border rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-900 border-white/10 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'}`}
                  title="Refazer (Redo)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-md font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95 shrink-0"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvo!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className={`p-2 rounded-md transition-all cursor-pointer ml-2 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Slides Thumbnails */}
          <div className={`w-64 border-r p-3 space-y-3 flex flex-col shrink-0 overflow-y-auto ${theme === 'dark' ? 'bg-slate-950/80 border-white/10' : 'bg-[#f9f9ff] border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#2fd9f4]" />
                <span>Total de Slides: {presentation.slides.length}</span>
              </span>
              <button
                onClick={handleAddNewAula}
                className="p-1.5 bg-[#2fd9f4]/15 hover:bg-[#2fd9f4]/30 text-[#2fd9f4] rounded-md transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                title="Nova Aula"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Aula</span>
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {Array.from({ length: maxAulas }).map((_, aulaIdx) => {
                const aulaNumber = aulaIdx + 1;
                const isCollapsed = collapsedAulas.has(aulaNumber);
                const slidesInAula = presentation.slides
                  .map((slideItem, index) => ({ slideItem, index }))
                  .filter(({ slideItem }) => (slideItem.aula_group || 1) === aulaNumber);

                return (
                  <div key={`aula-${aulaNumber}`} className="space-y-2">
                    <div className={`flex items-center justify-between p-2 rounded-md cursor-pointer select-none transition-colors ${theme === 'dark' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-200/50 hover:bg-slate-200'}`} onClick={() => toggleAulaCollapse(aulaNumber)}>
                      <div className="flex items-center gap-2">
                        {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        <span className={`text-[11px] font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                          Aula {String(aulaNumber).padStart(2, '0')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{slidesInAula.length} slides</span>
                    </div>

                    {!isCollapsed && (
                      <div className="pl-2 space-y-2.5 border-l-2 border-slate-200/50 ml-3">
                        {slidesInAula.map(({ slideItem, index }) => {
                          const isActive = index === currentSlideIndex;
                          return (
                            <div
                              key={slideItem.id}
                              onClick={() => setCurrentSlideIndex(index)}
                              className={`p-2.5 rounded-md border transition-all cursor-pointer relative group ${
                                isActive
                                  ? 'border-[#2fd9f4] bg-[#2fd9f4]/10 shadow-[0_0_15px_rgba(47,217,244,0.15)]'
                                  : (theme === 'dark' ? 'border-white/10 bg-slate-900/60 hover:border-white/20' : 'border-slate-200 bg-white hover:border-slate-300')
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-mono font-bold text-slate-400">
                                  Slide 0{index + 1}
                                </span>
                                {presentation.slides.length > 1 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeSlide(slideItem.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                                    title="Excluir Slide"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <div
                                className="w-full aspect-video rounded-md border border-white/10 p-2 flex items-center justify-center text-center overflow-hidden text-[9px] text-slate-300 font-medium"
                                style={{
                                  backgroundColor:
                                    slideItem.background.type === 'color' ? slideItem.background.value : '#0f172a',
                                }}
                              >
                                <span className="line-clamp-2">{slideItem.title}</span>
                              </div>
                            </div>
                          );
                        })}

                        <button
                          onClick={() => handleAddNewSlideToAula(aulaNumber)}
                          className="w-full py-2 flex items-center justify-center gap-1 text-[10px] font-bold rounded-md border border-dashed transition-all cursor-pointer opacity-50 hover:opacity-100 mt-2"
                          style={{ borderColor: '#2fd9f4', color: '#2fd9f4' }}
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Slide
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Stage: Player or Canvas Editor */}
          <div className={`flex-1 p-4 md:p-6 flex flex-col justify-center items-center overflow-y-auto ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
            <div className="w-full max-w-4xl">
              {mode === 'player' ? (
                <SlidePlayer
                  slide={currentSlide}
                  aspectRatio={presentation.aspectRatio}
                  autoPlay={true}
                  onNextSlide={nextSlide}
                  onPrevSlide={prevSlide}
                  hasNextSlide={currentSlideIndex < presentation.slides.length - 1}
                  hasPrevSlide={currentSlideIndex > 0}
                  slideNumber={currentSlideIndex + 1}
                  totalSlides={presentation.slides.length}
                />
              ) : (
                <SlideEditor
                  slide={currentSlide}
                  aspectRatio={presentation.aspectRatio}
                />
              )}
            </div>
          </div>

          {/* Right Sidebar: Property Inspector or UC Materials (Only in Editor Mode) */}
          {mode === 'editor' && (
            <div className={`w-80 border-l p-3 shrink-0 flex flex-col overflow-hidden ${theme === 'dark' ? 'border-white/10 bg-[#12171c]' : 'border-slate-200 bg-white'}`}>
              {/* Tab Selector */}
              <div className={`flex border-b pb-2 shrink-0 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  onClick={() => setEditorRightTab('properties')}
                  className={`flex-1 py-1.5 text-center text-xs font-extrabold rounded-md transition-all cursor-pointer ${
                    editorRightTab === 'properties'
                      ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900')
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Propriedades
                </button>
                <button
                  onClick={() => {
                    setEditorRightTab('uc-materials');
                    if (unidades.length > 0 && !selectedUcIdForEditor) {
                      setSelectedUcIdForEditor(unidades[0].id);
                    }
                  }}
                  className={`flex-1 py-1.5 text-center text-xs font-extrabold rounded-md transition-all cursor-pointer ${
                    editorRightTab === 'uc-materials'
                      ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900')
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Recursos de UCs
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto mt-3 custom-scrollbar">
                {editorRightTab === 'properties' ? (
                  <PropertyInspector slide={currentSlide} />
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className={`text-[10px] font-black uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Selecionar Unidade de Conhecimento
                      </label>
                      <select
                        value={selectedUcIdForEditor}
                        onChange={(e) => setSelectedUcIdForEditor(e.target.value)}
                        className={`w-full p-2 rounded-md text-xs border ${
                          theme === 'dark' 
                            ? 'bg-slate-900 border-white/10 text-white' 
                            : 'bg-white border-slate-200 text-slate-950'
                        }`}
                      >
                        <option value="">Selecione uma UC...</option>
                        {unidades.map(u => (
                          <option key={u.id} value={u.id}>
                            [{u.codigo}] {u.titulo}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Didactic Elements List for Selected UC */}
                    {(() => {
                      const selectedUc = unidades.find(u => u.id === selectedUcIdForEditor);
                      if (!selectedUc) {
                        return (
                          <div className={`text-center py-8 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Selecione uma UC para ver os Objetos de Aprendizagem vinculados a ela.
                          </div>
                        );
                      }

                      if (learningObjects.length === 0) {
                        return (
                          <div className={`text-center py-8 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Nenhum objeto de aprendizagem encontrado para esta UC.
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            Objetos de Aprendizagem ({learningObjects.length})
                          </span>
                          
                          <div className="space-y-2">
                            {learningObjects.map((oa, cIdx) => {
                              let elementIcon = <FileText className="w-3.5 h-3.5" />;
                              let elementLabel = 'Leitura';
                              
                              if (oa.object_type === 'video') {
                                elementIcon = <Play className="w-3.5 h-3.5 text-blue-400" />;
                                elementLabel = 'Vídeo';
                              } else if (oa.object_type === 'image') {
                                elementIcon = <ImageIcon className="w-3.5 h-3.5 text-pink-400" />;
                                elementLabel = 'Imagem';
                              } else if (oa.object_type === 'question' || oa.object_type === 'quiz') {
                                elementIcon = <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />;
                                elementLabel = 'Questão';
                              } else if (oa.object_type === 'simulation' || oa.object_type === 'dre_simulation') {
                                elementIcon = <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
                                elementLabel = 'Simulação';
                              } else if (oa.object_type === 'case_study') {
                                elementIcon = <BookOpen className="w-3.5 h-3.5 text-amber-400" />;
                                elementLabel = 'Estudo de Caso';
                              }

                              return (
                                <div
                                  key={oa.id || cIdx}
                                  className={`p-2.5 rounded-md border flex flex-col justify-between gap-2 text-xs transition-all ${
                                    theme === 'dark'
                                      ? 'border-white/5 bg-white/5 text-[#dae2fd]'
                                      : 'border-slate-200 bg-slate-50 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-1.5 font-bold">
                                      <div className="pt-0.5">{elementIcon}</div>
                                      <span className="leading-tight">{elementLabel}: {oa.title}</span>
                                    </div>
                                    <button
                                      onClick={() => handleInsertUcElement(oa)}
                                      className="px-2 py-1 bg-[#1890ff] hover:bg-[#116ebc] text-white font-extrabold text-[9px] uppercase tracking-wider rounded-md transition-colors cursor-pointer shrink-0"
                                    >
                                      Inserir
                                    </button>
                                  </div>
                                  {oa.content_payload?.text && (
                                    <p className={`text-[10px] line-clamp-2 mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                      {oa.content_payload.text}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
