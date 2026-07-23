import React, { useState } from 'react';
import { usePresentationStore } from '../../store/usePresentationStore';
import { SlidePlayer } from './SlidePlayer';
import { SlideEditor } from './SlideEditor';
import { PropertyInspector } from './PropertyInspector';
import { X, Play, Edit3, Plus, Trash2, Save, Undo2, Redo2, Layers, Check, Sparkles, BookOpen, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Course } from '../../types';
import { analyzeSlideImage } from '../../utils/slideImport';

interface CourseSlideEditorModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSaveCourseSlides?: (courseId: string, updatedPresentation: any) => void;
}

export const CourseSlideEditorModal: React.FC<CourseSlideEditorModalProps> = ({
  course,
  isOpen,
  onClose,
  onSaveCourseSlides,
}) => {
  const {
    presentation,
    currentSlideIndex,
    mode,
    setMode,
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

  if (!isOpen) return null;

  const currentSlide = presentation.slides[currentSlideIndex] || presentation.slides[0];

  const handleAddNewSlide = () => {
    const newSlideId = `slide-${Date.now()}`;
    addSlide({
      id: newSlideId,
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
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="w-full max-w-[1500px] h-[92vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-[#12171c] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a6ed1] to-[#0854a0] flex items-center justify-center text-white font-black shrink-0 shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0a6ed1]">
                  Editor & Player de Slides • SAP Fiori Standard
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {course.title}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-white">
                {presentation.title}
              </h2>
            </div>
          </div>

          {/* Controls & Toggle */}
          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="p-1 bg-[#1c222b] border border-white/10 rounded-xl flex items-center gap-1">
              <button
                onClick={() => setMode('player')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'player'
                    ? 'bg-[#0a6ed1] text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Player</span>
              </button>
              <button
                onClick={() => setMode('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'editor'
                    ? 'bg-[#0854a0] text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
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
                className="px-3 py-1.5 bg-[#0a6ed1]/20 hover:bg-[#0a6ed1]/30 border border-[#0a6ed1]/40 text-[#0a6ed1] rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
              <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                <button
                  disabled={historyIndex <= 0}
                  onClick={undo}
                  className="p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Desfazer (Undo)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  disabled={historyIndex >= history.length - 1}
                  onClick={redo}
                  className="p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Refazer (Redo)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 shrink-0"
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
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Slides Thumbnails */}
          <div className="w-64 bg-slate-950/80 border-r border-white/10 p-3 space-y-3 flex flex-col shrink-0 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#2fd9f4]" />
                <span>Slides ({presentation.slides.length})</span>
              </span>
              <button
                onClick={handleAddNewSlide}
                className="p-1.5 bg-[#2fd9f4]/15 hover:bg-[#2fd9f4]/30 text-[#2fd9f4] rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                title="Novo Slide"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            <div className="space-y-2.5 flex-1">
              {presentation.slides.map((slideItem, index) => {
                const isActive = index === currentSlideIndex;

                return (
                  <div
                    key={slideItem.id}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isActive
                        ? 'border-[#2fd9f4] bg-[#2fd9f4]/10 shadow-[0_0_15px_rgba(47,217,244,0.15)]'
                        : 'border-white/10 bg-slate-900/60 hover:border-white/20'
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
                      className="w-full aspect-video rounded-lg border border-white/10 p-2 flex items-center justify-center text-center overflow-hidden text-[9px] text-slate-300 font-medium"
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
            </div>
          </div>

          {/* Center Stage: Player or Canvas Editor */}
          <div className="flex-1 p-4 md:p-6 bg-slate-950 flex flex-col justify-center items-center overflow-y-auto">
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

          {/* Right Sidebar: Property Inspector (Only in Editor Mode) */}
          {mode === 'editor' && (
            <div className="w-80 border-l border-white/10 p-3 bg-slate-900 shrink-0 overflow-y-auto">
              <PropertyInspector slide={currentSlide} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
