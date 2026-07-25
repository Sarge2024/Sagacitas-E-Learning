import React, { useState, useEffect } from 'react';
import { Slide } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Download,
  BookOpen,
  Sparkles,
  Calculator,
  MessageSquare,
  FileText,
  Presentation,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Layers,
  Check,
  X,
  Compass,
} from 'lucide-react';

interface LessonSlideDeckViewerProps {
  slides: Slide[];
  lessonTitle: string;
  lessonNumber: string;
  onOpenAITutor?: (query?: string) => void;
  onOpenSlideQuestionModal?: (slide: Slide) => void;
  showToast?: (message: string) => void;
}

export const LessonSlideDeckViewer: React.FC<LessonSlideDeckViewerProps> = ({
  slides,
  lessonTitle,
  lessonNumber,
  onOpenAITutor,
  onOpenSlideQuestionModal,
  showToast,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);

  const activeSlide = slides[currentSlideIndex] || slides[0];

  // Reset selected quiz option when slide changes
  useEffect(() => {
    setSelectedQuizOption(null);
  }, [currentSlideIndex]);

  // Auto-play timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlay) {
      timer = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      }, 8000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlay, slides.length]);

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleDownloadSlides = () => {
    if (showToast) {
      showToast(`Download do deck de slides da Aula ${lessonNumber} em PDF iniciado!`);
    }
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'capa':
        return { label: '🎯 Capa & Provocação', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'operacao':
        return { label: '🔪 Conexão com a Operação', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'conceito':
        return { label: '💡 Conceito & Metáfora', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'alchymist':
        return { label: '💻 No Alchymist Manager', color: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'ancoragem':
        return { label: '🏆 Regra de Ouro', color: 'bg-yellow-200 text-amber-950 border-yellow-400 font-extrabold' };
      case 'resumo':
        return { label: '📌 Resumo & Ação', color: 'bg-teal-100 text-teal-900 border-teal-300' };
      case 'quiz_pergunta':
        return { label: '❓ Quiz: Pergunta & Cenário', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'quiz_opcoes':
        return { label: '📝 Quiz: Opções de Resposta', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'quiz_gabarito':
        return { label: '✅ Quiz: Gabarito & Decisão', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      default:
        return { label: 'Sagacitas DRE', color: 'bg-sky-100 text-sky-900 border-sky-300' };
    }
  };

  const badge = getCategoryBadge(activeSlide.slideCategory);

  return (
    <div
      className={`w-full bg-white border border-slate-200/90 rounded-md overflow-hidden shadow-lg transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none p-6 flex flex-col justify-between bg-slate-50' : 'p-5 md:p-6 space-y-4'
      }`}
    >
      {/* Slide Deck Header Toolbar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 font-bold">
            <Presentation className="w-4 h-4 text-indigo-600" />
            <span>SLIDES DA AULA {lessonNumber}</span>
          </div>
          <span className="hidden sm:inline font-bold text-slate-800 truncate max-w-xs">
            {lessonTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Badge */}
          <span className={`px-2.5 py-1 rounded-md border font-extrabold text-[10px] uppercase tracking-wider ${badge.color}`}>
            {badge.label}
          </span>

          {/* Slide counter pill */}
          <span className="px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-indigo-900 font-mono font-bold text-xs">
            {currentSlideIndex + 1} / {slides.length}
          </span>

          {/* Auto play button */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-semibold text-[11px] cursor-pointer border ${
              isAutoPlay
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title={isAutoPlay ? 'Pausar apresentação' : 'Iniciar reprodução automática'}
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isAutoPlay ? 'Apresentando' : 'Auto Play'}</span>
          </button>

          {/* Speaker Notes button */}
          <button
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className={`p-2 rounded-md transition-all flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer border ${
              showSpeakerNotes
                ? 'bg-purple-100 text-purple-900 border-purple-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
            title="Anotações do instrutor"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden md:inline">Anotações</span>
          </button>

          {/* Download Slides PDF */}
          <button
            onClick={handleDownloadSlides}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-all border border-slate-200 cursor-pointer"
            title="Baixar Slides em PDF"
          >
            <Download className="w-4 h-4 text-slate-700" />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-all border border-slate-200 cursor-pointer"
            title={isFullscreen ? 'Sair do Modo Tela Cheia' : 'Apresentar em Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Slide Card Stage - High Legibility Light Theme */}
      <div className={`relative min-h-[400px] md:min-h-[460px] flex flex-col justify-between p-6 md:p-10 rounded-md bg-gradient-to-br from-slate-50 via-white to-blue-50/40 border border-slate-200 shadow-2xs transition-all ${
        isFullscreen ? 'flex-1 my-4' : ''
      }`}>
        {/* Top Title Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-indigo-700">
              Alchymist Manager E-Learning • Sagacitas DRE
            </span>
            <span className="text-xs text-slate-500 font-mono font-bold">
              Slide {activeSlide.slideNumber}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {activeSlide.title}
          </h2>

          {activeSlide.subtitle && (
            <p className="text-sm md:text-base text-indigo-700 font-semibold">
              {activeSlide.subtitle}
            </p>
          )}
        </div>

        {/* Dynamic Category Content Rendering */}
        <div className="my-6">
          {/* SLIDE 1: Capa & Provocação */}
          {activeSlide.provocationQuestion && (
            <div className="p-6 md:p-8 rounded-md bg-gradient-to-r from-sky-50 via-indigo-50/60 to-blue-50 border-2 border-indigo-200/80 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-800">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span>Pergunta Central do Cotidiano</span>
              </div>
              <p className="text-lg md:text-2xl font-black text-slate-900 leading-snug">
                "{activeSlide.provocationQuestion}"
              </p>
            </div>
          )}

          {/* SLIDE 2: Conexão com a Operação */}
          {(activeSlide.practicalScenario || activeSlide.identifiedPain) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeSlide.practicalScenario && (
                <div className="p-5 rounded-md bg-amber-50 border border-amber-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-800">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span>Cenário Prático do Dia a Dia</span>
                  </div>
                  <p className="text-sm md:text-base text-amber-950 font-medium leading-relaxed">
                    {activeSlide.practicalScenario}
                  </p>
                </div>
              )}

              {activeSlide.identifiedPain && (
                <div className="p-5 rounded-md bg-rose-50 border border-rose-200 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Dor Identificada do Gestor</span>
                  </div>
                  <p className="text-sm md:text-base text-rose-950 font-medium leading-relaxed">
                    {activeSlide.identifiedPain}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SLIDE 3: Conceito Direto & Metáfora */}
          {activeSlide.metaphorName && (
            <div className="p-5 rounded-md bg-indigo-50/90 border border-indigo-200 space-y-2 mb-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-800">
                <Compass className="w-4 h-4 text-indigo-600" />
                <span>Metáfora Orientadora: {activeSlide.metaphorName}</span>
              </div>
              <p className="text-sm md:text-base text-slate-800 font-medium">
                {activeSlide.metaphorDescription}
              </p>
            </div>
          )}

          {/* SLIDE 4: Visão no Alchymist Manager */}
          {(activeSlide.systemLocation || activeSlide.numericalExample) && (
            <div className="space-y-4">
              {activeSlide.systemLocation && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-sky-50 border border-sky-200 text-xs font-mono font-bold text-sky-900 shadow-xs">
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>Onde Olhar no Sistema: {activeSlide.systemLocation}</span>
                </div>
              )}

              {activeSlide.numericalExample && (
                <div className="p-4 rounded-md bg-slate-900 text-emerald-300 font-mono text-sm border border-slate-800 shadow-2xs">
                  <span className="text-white font-bold block mb-1">Exemplo Numérico (R$ e %):</span>
                  {activeSlide.numericalExample}
                </div>
              )}
            </div>
          )}

          {/* SLIDE 5: Regra de Ouro / Frase de Ancoragem */}
          {activeSlide.goldenRule && (
            <div className="p-8 rounded-md bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-2 border-amber-400/80 shadow-2xs text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-amber-200/80 text-amber-950 border border-amber-400 text-xs font-black uppercase tracking-widest">
                <Award className="w-4 h-4 text-amber-700" />
                <span>Princípio Inegociável de Decisão</span>
              </div>
              <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                "{activeSlide.goldenRule}"
              </p>
            </div>
          )}

          {/* Bullet Points List (Fallback or Standard) */}
          {activeSlide.bulletPoints && activeSlide.bulletPoints.length > 0 && !activeSlide.provocationQuestion && !activeSlide.goldenRule && (
            <div className="space-y-3">
              {activeSlide.bulletPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-3 p-3.5 rounded-md bg-white border border-slate-200 shadow-xs">
                  <div className="w-2.5 h-2.5 rounded-md bg-indigo-600 mt-2 shrink-0"></div>
                  <p className="text-sm md:text-base text-slate-800 font-medium leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Table Data (Numerical Examples & Summary) */}
          {activeSlide.tableData && (
            <div className="mt-4 p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 mb-2">
                Resumo de Indicadores e Metas Alchymist
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activeSlide.tableData.map((row, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs p-2.5 rounded-md border ${
                      row.highlight
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-black shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{row.label}</span>
                    <span className="font-mono font-bold text-indigo-700">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUIZ SLIDES RENDERING */}
          {/* Quiz Slide 1: Pergunta / Estudo de Caso */}
          {activeSlide.quizQuestion && (
            <div className="space-y-4">
              {activeSlide.quizCase && (
                <div className="p-4 rounded-md bg-purple-50 border border-purple-200 text-purple-900 text-xs md:text-sm font-extrabold">
                  📌 {activeSlide.quizCase}
                </div>
              )}
              <div className="p-6 rounded-md bg-white border-2 border-indigo-200 text-lg md:text-xl font-extrabold text-slate-900 leading-relaxed shadow-2xs">
                {activeSlide.quizQuestion}
              </div>
            </div>
          )}

          {/* Quiz Slide 2: Opções Interativas */}
          {activeSlide.quizOptions && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
                Clique na alternativa que você considera correta:
              </p>
              <div className="grid grid-cols-1 gap-3">
                {activeSlide.quizOptions.map((opt) => {
                  const isSelected = selectedQuizOption === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedQuizOption(opt.key)}
                      className={`w-full p-4 rounded-md text-left font-medium transition-all flex items-start gap-4 border cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-white text-indigo-700' : 'bg-slate-100 text-indigo-700 border border-slate-200'
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-sm md:text-base leading-relaxed pt-0.5 font-semibold">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quiz Slide 3: Gabarito Comentado */}
          {activeSlide.correctOptionKey && (
            <div className="space-y-4">
              <div className="p-5 rounded-md bg-emerald-50 border border-emerald-300 flex items-center gap-4 shadow-xs">
                <div className="w-12 h-12 rounded-md bg-emerald-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-2xs">
                  {activeSlide.correctOptionKey}
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    Gabarito Correto
                  </div>
                  <div className="text-sm font-bold text-emerald-950">
                    Opção {activeSlide.correctOptionKey} é a resposta adequada
                  </div>
                </div>
              </div>

              {activeSlide.quizJustification && (
                <div className="p-5 rounded-md bg-white border border-slate-200 space-y-2 shadow-xs">
                  <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Justificativa Pedagógica
                  </div>
                  <p className="text-sm md:text-base text-slate-800 leading-relaxed font-medium">
                    {activeSlide.quizJustification}
                  </p>
                </div>
              )}

              {activeSlide.quizActionRequired && (
                <div className="p-5 rounded-md bg-sky-50 border border-sky-200 space-y-2 shadow-xs">
                  <div className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    <span>Ação de Matriz de Decisão no Alchymist</span>
                  </div>
                  <p className="text-sm md:text-base text-slate-900 font-bold leading-relaxed">
                    {activeSlide.quizActionRequired}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Takeaway / Key Highlight Banner */}
        {activeSlide.takeaway && (
          <div className="p-4 rounded-md bg-sky-50 border-l-4 border-sky-600 border border-sky-200/60 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />
            <p className="text-xs md:text-sm font-bold text-slate-800">
              <span className="text-sky-700 uppercase tracking-wider font-black mr-2">Próximo Passo:</span>
              {activeSlide.takeaway}
            </p>
          </div>
        )}

        {/* Speaker Notes Drawer */}
        {showSpeakerNotes && activeSlide.speakerNotes && (
          <div className="mt-4 p-4 rounded-md bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-1">
            <div className="flex items-center gap-2 font-bold text-purple-800 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Anotações do Instrutor Sagacitas</span>
            </div>
            <p className="text-purple-900 italic leading-relaxed font-medium">
              "{activeSlide.speakerNotes}"
            </p>
          </div>
        )}
      </div>

      {/* Slide Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={handlePrev}
          className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-300 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
          <span>Slide Anterior</span>
        </button>

        {/* Slide thumbnails / dots navigation */}
        <div className="flex items-center gap-1.5 max-w-md overflow-x-auto py-1 px-2">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2.5 rounded-md transition-all cursor-pointer ${
                idx === currentSlideIndex
                  ? 'w-8 bg-indigo-600 shadow-2xs'
                  : 'w-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
              title={`Ir para o Slide ${idx + 1}: ${s.title}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onOpenSlideQuestionModal ? (
            <button
              onClick={() => onOpenSlideQuestionModal(activeSlide)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-extrabold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              title="Enviar dúvida deste slide para a Carteira do Instrutor"
            >
              <HelpCircle className="w-4 h-4 text-white" />
              <span>Dúvida do Slide</span>
            </button>
          ) : onOpenAITutor ? (
            <button
              onClick={() => onOpenAITutor(`Me explique melhor o conteúdo do Slide ${activeSlide.slideNumber}: ${activeSlide.title}`)}
              className="px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 border border-purple-200 cursor-pointer shadow-xs"
              title="Tirar dúvida sobre este slide com a IA"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              <span>Dúvida do Slide</span>
            </button>
          ) : null}

          <button
            onClick={handleNext}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <span>Próximo Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
