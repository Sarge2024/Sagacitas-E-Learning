import React, { useState } from 'react';
import { usePresentationStore, SAMPLE_PRESENTATION } from '../../store/usePresentationStore';
import { SlideElement } from '../../types/presentation';
import { SlidePlayer } from './SlidePlayer';
import { SlideEditor } from './SlideEditor';
import { PropertyInspector } from './PropertyInspector';
import { X, Play, Edit3, Plus, Trash2, Save, Undo2, Redo2, Layers, Check, Sparkles, BookOpen, Image as ImageIcon, Loader2, Sun, Moon, Maximize2 } from 'lucide-react';
import { Course } from '../../types';
import { analyzeSlideImage } from '../../utils/slideImport';
import { UnidadeConhecimento } from '../../types/edtechExpert';
import { FileText, Volume2, HelpCircle, ChevronDown, ChevronRight, Folder, ChevronsUp, ChevronsDown } from 'lucide-react';
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
    updateElement,
    selectedElementId,
    undo,
    redo,
    historyIndex,
    history,
    defaultSlideBackground,
    defaultTitleColor,
    defaultBodyColor,
    defaultSlideElementsTemplate,
  } = usePresentationStore();

  const currentSlide = presentation?.slides?.[currentSlideIndex] || presentation?.slides?.[0];

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Right sidebar tab and selection states
  const [editorRightTab, setEditorRightTab] = useState<'properties' | 'uc-materials'>('properties');
  const [courseSlots, setCourseSlots] = useState<any[]>([]);
  const [viewingResource, setViewingResource] = useState<any | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);

  React.useEffect(() => {
    if (isOpen && course.id) {
      const fetchSlots = async () => {
        const { data } = await supabase
          .from('course_knowledge_units')
          .select('*')
          .eq('course_id', course.id);
        if (data) {
          setCourseSlots(data);
        }
      };
      fetchSlots();
    }
  }, [isOpen, course.id]);

  React.useEffect(() => {
    if (isOpen) {
      setMode('editor');
      if (course.presentation) {
        // Garantir que a apresentação tenha a propriedade slides, inicializando com 1 slide vazio se necessário
        const safePresentation = {
          ...course.presentation,
          slides: course.presentation.slides && course.presentation.slides.length > 0 
            ? course.presentation.slides 
            : [{
                id: `slide-${Date.now()}`,
                title: 'Novo Slide',
                background: { type: 'color', value: '#12171c' },
                elements: []
              }]
        };
        setPresentation(safePresentation as any);
      } else {
        setPresentation(SAMPLE_PRESENTATION);
      }
      if (initialUcId) {
        setEditorRightTab('uc-materials');
      }
    }
  }, [isOpen, course.id, course.presentation, initialUcId, setPresentation, setMode]);

  const [learningObjects, setLearningObjects] = useState<any[]>([]);
  const [maxAulas, setMaxAulas] = useState<number>(1);
  const [collapsedAulas, setCollapsedAulas] = useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (!currentSlide || !courseSlots.length) {
      setLearningObjects([]);
      return;
    }
    
    const aulaSeq = currentSlide.aula_group || 1;
    // Find all UC IDs allocated to this lesson (aula)
    const activeUcIds = courseSlots.filter(s => s.aula_group === aulaSeq).map(s => s.uc_id);
    
    if (activeUcIds.length === 0) {
      setLearningObjects([]);
      return;
    }

    const fetchObjects = async () => {
      let allMappedComponents: any[] = [];
      
      for (const ucId of activeUcIds) {
        const uc = unidades.find(u => u.id === ucId);
        if (!uc) continue;
        
        let rawComponents: any[] = [];
        
        if (uc.subgroups && uc.subgroups.length > 0) {
          rawComponents = uc.subgroups.flatMap(sg => sg.content_payload || []);
        } else if (uc.layout_template?.components && uc.layout_template.components.length > 0) {
          rawComponents = uc.layout_template.components;
        }

        if (rawComponents.length > 0) {
          const mapped = rawComponents.map((comp: any, idx: number) => {
            let objType = comp.type;
            let title = comp.title || `Objeto ${idx + 1}`;
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
              id: `mapped-${uc.id}-${idx}`,
              object_type: objType,
              title: title,
              content_payload: payload,
              _originalComp: comp,
              _ucLabel: `[${uc.codigo}] ${uc.titulo}`
            };
          });
          allMappedComponents = [...allMappedComponents, ...mapped];
        } else {
          // Fallback Supabase
          const { data } = await supabase
            .from('learning_objects')
            .select('*')
            .eq('knowledge_unit_id', ucId);
          if (data) {
            allMappedComponents = [...allMappedComponents, ...data.map((d: any) => ({
              ...d,
              _ucLabel: `[${uc.codigo}] ${uc.titulo}`
            }))];
          }
        }
      }
      setLearningObjects(allMappedComponents);
    };
    fetchObjects();
  }, [currentSlide?.aula_group, courseSlots, unidades]);

  React.useEffect(() => {
    const totalLessonsFromModules = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 1;
    if (presentation.slides.length > 0) {
      setMaxAulas(prev => Math.max(prev, totalLessonsFromModules, ...presentation.slides.map(s => s.aula_group || 1)));
    } else {
      setMaxAulas(Math.max(1, totalLessonsFromModules));
    }
  }, [presentation.slides, course.modules]);

  const toggleAulaCollapse = (aulaId: number) => {
    setCollapsedAulas(prev => {
      const next = new Set(prev);
      if (next.has(aulaId)) next.delete(aulaId);
      else next.add(aulaId);
      return next;
    });
  };

  const handleAddNewAula = () => setMaxAulas(prev => prev + 1);

  const handleCollapseAll = () => {
    const all = new Set(Array.from({ length: maxAulas }).map((_, i) => i + 1));
    setCollapsedAulas(all);
  };

  const handleExpandAll = () => {
    setCollapsedAulas(new Set());
  };

  const handleInsertUcElement = (oa: any) => {
    if (!currentSlide) return;
    
    let elemType: any = 'text';
    let elemContent: any = {};
    let baseTemplate: any = undefined;

    if (defaultSlideElementsTemplate) {
      if (['text', 'reading', 'case_study'].includes(oa.object_type) || !['video','image','question','quiz','simulation','dre_simulation'].includes(oa.object_type)) {
        const isTitleElem = (el: any) => el.content.style?.fontWeight === '800' || el.content.style?.fontWeight === '700' || parseFloat(el.content.style?.fontSize || '0') >= 1.5;
        baseTemplate = defaultSlideElementsTemplate
          .filter(el => el.type === 'text' && (el.role === 'bodyText' || (!el.role && !isTitleElem(el))))
          .sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
      } else {
        let mappedType = oa.object_type;
        if (oa.object_type === 'quiz') mappedType = 'question';
        if (oa.object_type === 'dre_simulation') mappedType = 'simulation';
        baseTemplate = defaultSlideElementsTemplate.find(el => el.type === mappedType);
      }
    }
    
    switch (oa.object_type) {
      case 'text':
      case 'reading':
      case 'case_study':
        elemType = 'text';
        elemContent = {
          text: oa.content_payload?.text || oa.title,
          style: baseTemplate?.content?.style ? { ...baseTemplate.content.style } : {
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
          src: oa.content_payload?.url || '',
          mediaSettings: baseTemplate?.content?.mediaSettings ? { ...baseTemplate.content.mediaSettings } : {
            autoPlay: false,
            controls: true
          }
        };
        break;
      case 'image':
        elemType = 'image';
        elemContent = {
          src: oa.content_payload?.url || '',
          alt: oa.title || 'Imagem',
          style: baseTemplate?.content?.style ? { ...baseTemplate.content.style } : {}
        };
        break;
      case 'question':
      case 'quiz':
        elemType = 'question';
        elemContent = {
          quizData: {
            question: oa.content_payload?.question || oa.title || 'Pergunta não configurada',
            options: oa.content_payload?.options || ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'],
            correctIndex: oa.content_payload?.correctIndex ?? 0,
            explanation: oa.content_payload?.explanation || 'Explicação não fornecida.'
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
        elemContent = {
          text: oa.content_payload?.text || oa.title,
          style: baseTemplate?.content?.style ? { ...baseTemplate.content.style } : {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: theme === 'dark' ? '#ffffff' : '#0f172a',
            fontFamily: 'Outfit, sans-serif'
          }
        };
    }

    const selectedElement = currentSlide.elements.find(el => el.id === selectedElementId);
    if (selectedElement) {
      updateElement(currentSlide.id, selectedElement.id, {
        type: elemType,
        content: {
          ...selectedElement.content,
          ...elemContent,
          sourceId: oa.id
        }
      });
      return;
    }

    const newElement = {
      id: `elem-uc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: elemType,
      x: baseTemplate ? baseTemplate.x : 20,
      y: baseTemplate ? baseTemplate.y : (elemType === 'question' || elemType === 'simulation' ? 10 : 30),
      width: baseTemplate ? baseTemplate.width : (elemType === 'question' || elemType === 'simulation' ? 80 : 60),
      height: baseTemplate ? baseTemplate.height : (elemType === 'question' || elemType === 'simulation' ? 80 : 20),
      zIndex: baseTemplate ? baseTemplate.zIndex : (currentSlide.elements.length + 10),
      role: elemType === 'text' ? 'bodyText' : elemType,
      content: { ...elemContent, sourceId: oa.id },
      animation: baseTemplate?.animation ? { ...baseTemplate.animation, order: currentSlide.elements.length + 1 } : {
        effect: 'fadeIn',
        duration: 0.8,
        delay: 0.1,
        order: currentSlide.elements.length + 1
      }
    };

    addElement(currentSlide.id, newElement as any);
  };

  if (!isOpen) return null;

  const handleAddNewSlideToAula = (aulaGroup: number) => {
    const newSlideId = `slide-${Date.now()}`;
    const defaultElements: SlideElement[] = defaultSlideElementsTemplate
      ? defaultSlideElementsTemplate.map((el, idx) => {
          let newContent = { ...el.content };
          if (el.type === 'text') {
            const isTitle = el.role === 'title' || (el.content.style?.fontWeight === '800' || el.content.style?.fontWeight === '700');
            newContent.text = isTitle ? 'Novo Título do Slide' : 'Novo parágrafo de texto principal do slide...';
          } else if (el.type === 'image' || el.type === 'video' || el.type === 'audio') {
            newContent.src = '';
          }
          return {
            ...el,
            id: `elem-${Date.now()}-${idx}`,
            content: newContent
          };
        })
      : [
          {
            id: `elem-${Date.now()}-1`,
            type: 'text' as const,
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
                color: defaultTitleColor || '#0a6ed1',
              },
            },
            animation: {
              effect: 'fadeIn',
              duration: 0.8,
              delay: 0.1,
              order: 1,
            },
          },
        ];

    addSlide({
      id: newSlideId,
      aula_group: aulaGroup,
      title: `Slide ${presentation.slides.length + 1}`,
      background: defaultSlideBackground || {
        type: 'color',
        value: '#12171c',
      },
      elements: defaultElements,
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
                <span>{presentation.slides.length} SLIDES</span>
              </span>
              <div className="flex gap-1">
                <button
                  onClick={handleExpandAll}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
                  title="Expandir Todas as Aulas"
                >
                  <ChevronsDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCollapseAll}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}
                  title="Colapsar Todas as Aulas"
                >
                  <ChevronsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleAddNewAula}
                  className="p-1.5 bg-[#2fd9f4]/15 hover:bg-[#2fd9f4]/30 text-[#2fd9f4] rounded-md transition-all cursor-pointer ml-1"
                  title="Nova Aula"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {(() => {
                let currentAulaNumber = 1;
                const allModules = course.modules || [];
                const groups = allModules.map((modulo, mIdx) => {
                  const lessons = modulo.lessons || [];
                  const aulaNumbers = lessons.map(() => currentAulaNumber++);
                  return {
                    id: modulo.id || `mod-${mIdx}`,
                    title: modulo.title || `Módulo ${mIdx + 1}`,
                    aulaNumbers
                  };
                });

                if (currentAulaNumber <= maxAulas) {
                  const extraAulas = [];
                  for (let i = currentAulaNumber; i <= maxAulas; i++) {
                    extraAulas.push(i);
                  }
                  groups.push({
                    id: 'mod-extras',
                    title: allModules.length > 0 ? 'Aulas Adicionais' : 'Aulas do Curso',
                    aulaNumbers: extraAulas
                  });
                }

                return groups.map((group, gIdx) => (
                  <div key={group.id} className={gIdx > 0 ? 'mt-4' : ''}>
                    {group.title && (
                      <div className="flex items-center gap-1.5 mb-2 px-1 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <Folder className="w-3 h-3 text-[#2fd9f4]/80" />
                        <span className="truncate">{group.title}</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      {group.aulaNumbers.map(aulaNumber => {
                        const isCollapsed = collapsedAulas.has(aulaNumber);
                        const slidesInAula = presentation.slides
                          .map((slideItem, index) => ({ slideItem, index }))
                          .filter(({ slideItem }) => (slideItem.aula_group || 1) === aulaNumber);

                        const hasUCs = slidesInAula.some(({ slideItem }) =>
                          slideItem.elements.some(el => !!el.content?.sourceId)
                        );

                        return (
                          <div key={`aula-${aulaNumber}`} className="space-y-2">
                            <div className={`flex items-center justify-between p-2 rounded-md cursor-pointer select-none transition-colors ${theme === 'dark' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-200/50 hover:bg-slate-200'}`} onClick={() => toggleAulaCollapse(aulaNumber)}>
                              <div className="flex items-center gap-2">
                                {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[11px] font-extrabold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                                    Aula {String(aulaNumber).padStart(2, '0')}
                                  </span>
                                  {hasUCs && (
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Esta aula possui UCs inseridas" />
                                  )}
                                </div>
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
                ));
              })()}
            </div>
          </div>

          {/* Center Stage: Player or Canvas Editor */}
          <div className={`flex-1 p-4 md:p-6 flex flex-col justify-start items-center overflow-y-auto ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
            {mode === 'editor' && (
              <div className={`w-full max-w-4xl flex items-center justify-between gap-3 mb-4 px-3 py-1.5 rounded-lg border text-xs ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-white/10 text-slate-300' 
                  : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  <Maximize2 className="w-3.5 h-3.5 text-[#0a6ed1]" />
                  <span>Visualização: {Math.round(zoomScale * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="0.5" 
                    max="1.5" 
                    step="0.05" 
                    value={zoomScale} 
                    onChange={(e) => setZoomScale(parseFloat(e.target.value))} 
                    className="w-32 cursor-pointer accent-[#0a6ed1] h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <button 
                    onClick={() => setZoomScale(1)} 
                    className={`px-2 py-0.5 font-extrabold rounded transition-colors ${
                      theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    100%
                  </button>
                </div>
              </div>
            )}
            <div className={`w-full ${mode === 'player' ? 'max-w-[1400px]' : 'max-w-4xl'}`}>
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
                  zoomScale={zoomScale}
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
                    {/* Didactic Elements List for Current Lesson */}
                    {(() => {
                      const usedSourceIdsList = presentation.slides.flatMap(s => 
                        s.elements.map(e => ({ 
                          sourceId: e.content.sourceId, 
                          slideId: s.id, 
                          slideGroup: s.aula_group 
                        }))
                      ).filter((e): e is { sourceId: string; slideId: string; slideGroup: number } => !!e.sourceId);
                      const usedSourceIds = new Set(usedSourceIdsList.map(u => u.sourceId));
                      
                      const availableLearningObjects = learningObjects.filter(oa => !usedSourceIds.has(oa.id));
                      const usedImages = learningObjects.filter(oa => usedSourceIds.has(oa.id) && oa.object_type === 'image');

                      if (learningObjects.length === 0) {
                        return (
                          <div className={`text-center py-8 px-4 text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Nenhum componente multimidia encontrado para as UCs alocadas na Aula {currentSlide?.aula_group || 1}.
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-6 pb-10">
                          {/* Pending Elements */}
                          <div className="space-y-3">
                            <span className={`text-[10px] font-black uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              Componentes Pendentes ({availableLearningObjects.length})
                            </span>
                            
                            {availableLearningObjects.length === 0 && (
                              <div className={`text-center py-6 px-4 text-xs ${theme === 'dark' ? 'text-slate-400 bg-slate-800' : 'text-slate-500 bg-slate-100'} rounded-md border border-dashed`}>
                                <p className="font-bold mb-1">🎉 Todos os componentes foram inseridos!</p>
                                <p>Crie um novo slide para continuar editando.</p>
                              </div>
                            )}

                            <div className="space-y-2">
                            {availableLearningObjects.map((oa, cIdx) => {
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
                                  onClick={() => setViewingResource(oa)}
                                  className={`p-3 rounded-md border flex flex-col justify-between gap-3 text-xs transition-all hover:border-[#1890ff] cursor-pointer ${
                                    theme === 'dark'
                                      ? 'border-white/5 bg-white/5 text-[#dae2fd]'
                                      : 'border-slate-200 bg-slate-50 text-slate-800'
                                  }`}
                                >
                                  {/* Main text to insert (Emphasized) */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex gap-2">
                                      <div className="pt-0.5 shrink-0">{elementIcon}</div>
                                      <div className="font-extrabold text-xs leading-relaxed text-balance line-clamp-3">
                                        {oa.content_payload?.text || oa.title}
                                      </div>
                                    </div>
                                    
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleInsertUcElement(oa);
                                      }}
                                      className="px-2.5 py-1 bg-[#1890ff] hover:bg-[#116ebc] text-white font-black text-[9px] uppercase tracking-wider rounded-md transition-colors cursor-pointer shrink-0"
                                    >
                                      Inserir
                                    </button>
                                  </div>

                                  {/* Small metadata at bottom */}
                                  <div className={`text-[9px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {elementLabel}: <span className="italic font-medium">{oa.title}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          </div>

                          {/* Used Images (Reusable) */}
                          {usedImages.length > 0 && (
                            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                              <span className={`text-[10px] font-black uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Imagens Já Utilizadas ({usedImages.length})
                              </span>
                              <div className="space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                                {usedImages.map((oa, cIdx) => {
                                  // Find which slides this image is used in
                                  const slidesUsingIt = usedSourceIdsList.filter(u => u.sourceId === oa.id);
                                  const uniqueSlideGroups = Array.from(new Set(slidesUsingIt.map(s => s.slideGroup)));
                                  
                                  return (
                                    <div
                                      key={`used-${oa.id || cIdx}`}
                                      onClick={() => setViewingResource(oa)}
                                      className={`p-3 rounded-md border flex flex-col justify-between gap-3 text-xs transition-all hover:border-[#1890ff] cursor-pointer ${
                                        theme === 'dark'
                                          ? 'border-white/5 bg-[#12171c] text-[#dae2fd]'
                                          : 'border-slate-200 bg-white text-slate-600'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex gap-2">
                                          <div className="pt-0.5 shrink-0"><ImageIcon className="w-3.5 h-3.5 text-pink-400" /></div>
                                          <div className="font-extrabold text-xs leading-relaxed text-balance line-clamp-3">
                                            {oa.content_payload?.text || oa.title}
                                          </div>
                                        </div>
                                        
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleInsertUcElement(oa);
                                          }}
                                          className="px-2.5 py-1 bg-transparent border border-[#1890ff] text-[#1890ff] hover:bg-[#1890ff] hover:text-white font-black text-[9px] uppercase tracking-wider rounded-md transition-colors cursor-pointer shrink-0"
                                        >
                                          Inserir Nov.
                                        </button>
                                      </div>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${theme === 'dark' ? 'bg-white/10 text-white/70' : 'bg-slate-200 text-slate-500'}`}>
                                          Usado na(s) Aula(s): {uniqueSlideGroups.join(', ')}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
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
      {/* Full Resource Preview Popup Modal */}
      {viewingResource && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className={`w-full max-w-2xl rounded-lg p-3.5 border shadow-xl flex flex-col max-h-[85vh] ${
            theme === 'dark' ? 'bg-[#1c222b] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-1.5 mb-2.5 border-slate-200 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <span className="text-base">📖</span>
                <span>Visualizar Recurso Completo</span>
              </div>
              <button 
                onClick={() => setViewingResource(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-1 text-[13px] leading-relaxed whitespace-pre-wrap font-medium">
              <div className="mb-2">
                <span className="text-[9px] uppercase font-bold text-[#1890ff] block mb-0.5">
                  Título do Objeto
                </span>
                <h4 className="text-xs font-extrabold">{viewingResource.title}</h4>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-[#1890ff] block mb-0.5">
                  Texto Completo / Conteúdo
                </span>
                <p className={`p-2.5 rounded border text-[12px] leading-relaxed whitespace-pre-wrap ${
                  theme === 'dark' ? 'bg-slate-950 border-white/5 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  {viewingResource.content_payload?.text || viewingResource.title}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-1.5 border-t pt-2 mt-2.5 border-slate-200 dark:border-white/10 shrink-0">
              <button
                onClick={() => setViewingResource(null)}
                className={`px-2.5 py-1 rounded font-bold text-[10px] transition-colors cursor-pointer border ${
                  theme === 'dark' 
                    ? 'border-white/10 bg-transparent text-slate-300 hover:bg-white/5' 
                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  handleInsertUcElement(viewingResource);
                  setViewingResource(null);
                }}
                className="px-3.5 py-1 bg-[#1890ff] hover:bg-[#116ebc] text-white font-black text-[10px] rounded transition-colors cursor-pointer shadow-xs"
              >
                Inserir no Slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
