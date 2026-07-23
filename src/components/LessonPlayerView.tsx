import React, { useState, useRef } from 'react';
import { Slide, Course, Lesson, Comment } from '../types';
import { INITIAL_COMMENTS } from '../data/coursesData';
import { LessonSlideDeckViewer } from './LessonSlideDeckViewer';
import { getSlidesForLesson } from '../data/lessonSlidesData';
import {
  ArrowLeft,
  Award,
  Bell,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  CheckCircle2,
  ThumbsUp,
  Share2,
  Lock,
  FileText,
  FileSpreadsheet,
  Paperclip,
  Download,
  Send,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Presentation,
  Video,
  Columns,
  ChevronDown,
  ChevronUp,
  Layers,
  Target,
  Clock,
  Star,
  MessageSquare,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface LessonPlayerViewProps {
  course: Course;
  onBackToDashboard: () => void;
  onOpenAITutor: (initialQuery?: string) => void;
  onOpenSlideQuestionModal?: (slide: Slide) => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const LessonPlayerView: React.FC<LessonPlayerViewProps> = ({
  course,
  onBackToDashboard,
  onOpenAITutor,
  onOpenSlideQuestionModal,
  isSidebarCollapsed = true,
  onToggleCollapse,
}) => {
  // Find current active module and lesson
  const modules = course.modules || [];
  const currentModule = modules[0] || { title: 'MÓDULO 3: DRE NA PRÁTICA', lessons: [] };

  const [activeLesson, setActiveLesson] = useState<Lesson>(
    currentModule.lessons?.find((l) => l.active) ||
      currentModule.lessons?.[3] || {
        id: 'aula-04',
        number: '04',
        title: 'Aula 04: A História do Resultado do Mês',
        duration: '25:00',
        completed: false,
        active: true,
        description:
          'Nesta aula, a Dra. Elena Sterling explica a estrutura completa da DRE de forma prática, conectando o faturamento bruto aos custos de produção e demonstrando a apuração da margem de contribuição.',
      }
  );

  const [mediaMode, setMediaMode] = useState<'video' | 'slides' | 'split'>('slides');
  const [expandedModuleIds, setExpandedModuleIds] = useState<Record<string, boolean>>({
    'mod-0': true,
    'mod-1': true,
    'mod-2': true,
    'mod-3': true,
    'mod-4': true,
    'mod-5': true,
  });

  const toggleModuleExpand = (modId: string) => {
    setExpandedModuleIds((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState('1.0x');
  const [progressPercent, setProgressPercent] = useState(48);
  const [isCompleted, setIsCompleted] = useState(activeLesson.completed);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(128);
  const [userRating, setUserRating] = useState<number>(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeSlides = activeLesson.slides || getSlidesForLesson(activeLesson.id, activeLesson.title, activeLesson.description);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleComplete = () => {
    setIsCompleted(!isCompleted);
    if (!isCompleted) {
      showToast('Aula marcada como concluída! 🎉');
    }
  };

  const handleToggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Link da aula copiado para a área de transferência!');
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    setRatingSubmitted(true);
    showToast('Obrigado! Sua avaliação foi registrada com sucesso.');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      author: 'Gabriel Mendes',
      text: newCommentText,
      timestamp: 'Agora mesmo',
      likes: 0,
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
    showToast('Comentário publicado com sucesso!');
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div id="virtual-classroom-page" className="min-h-screen bg-[#f9f9ff] text-slate-900 font-sans">
      {/* Top Header Bar */}
      <header
        id="lesson-top-bar"
        className={`fixed top-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 transition-all duration-300 shadow-2xs ${
          isSidebarCollapsed ? 'left-20' : 'left-64'
        }`}
      >
        <div className="flex items-center gap-4">
          {onToggleCollapse && (
            <button
              id="lesson-toggle-sidebar-btn"
              onClick={onToggleCollapse}
              className="p-1.5 text-slate-600 hover:text-[#1890ff] hover:bg-slate-100 rounded-md transition-all cursor-pointer"
              title={isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          )}

          <button
            id="back-to-dashboard-btn"
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-slate-600 hover:text-[#1890ff] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider hidden md:block">
              Voltar ao Portal
            </span>
          </button>
          <div className="h-5 w-px bg-slate-200 hidden md:block"></div>
          <h1 className="text-base font-black text-slate-900 tracking-tight">
            Sala Virtual • Sagacitas E-Learning
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#1890ff]/10 rounded-md border border-[#1890ff]/20">
            <GraduationCap className="w-4 h-4 text-[#1890ff]" />
            <span className="text-xs font-bold text-[#1890ff]">
              Treinamento Alchymist Manager
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-slate-600 hover:text-[#1890ff] transition-colors p-1.5 rounded-md hover:bg-slate-100 cursor-pointer">
              <Bell className="w-4.5 h-4.5" />
            </button>
            <button className="text-slate-600 hover:text-[#1890ff] transition-colors p-1.5 rounded-md hover:bg-slate-100 cursor-pointer">
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="pt-16 min-h-screen flex flex-col lg:flex-row overflow-hidden">
        {/* Central Lesson Content (Main Content) */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Media Mode Selector Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white border border-slate-200 rounded-md shadow-2xs">
            <div className="flex items-center gap-1.5">
              <button
                id="mode-slides-btn"
                onClick={() => setMediaMode('slides')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  mediaMode === 'slides'
                    ? 'bg-[#1890ff] text-white border-[#1890ff] shadow-xs'
                    : 'text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Presentation className="w-4 h-4" />
                <span>Slides da Aula ({activeSlides.length})</span>
              </button>

              <button
                id="mode-video-btn"
                onClick={() => setMediaMode('video')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  mediaMode === 'video'
                    ? 'bg-[#1890ff] text-white border-[#1890ff] shadow-xs'
                    : 'text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Vídeoaula</span>
              </button>

              <button
                id="mode-split-btn"
                onClick={() => setMediaMode('split')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  mediaMode === 'split'
                    ? 'bg-[#1890ff] text-white border-[#1890ff] shadow-xs'
                    : 'text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Columns className="w-4 h-4" />
                <span className="hidden sm:inline">Modo Dividido (Vídeo + Slides)</span>
                <span className="sm:hidden">Dividido</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 px-2">
              <span className="text-[10px] bg-blue-50 text-[#1890ff] px-2.5 py-1 rounded-md font-bold border border-blue-200 flex items-center gap-1">
                <Presentation className="w-3 h-3 text-[#1890ff]" />
                DRE Alchymist Manager
              </span>
            </div>
          </div>

          {/* Media Player / Slides Content Area */}
          {mediaMode === 'slides' && (
            <LessonSlideDeckViewer
              slides={activeSlides}
              lessonTitle={activeLesson.title}
              lessonNumber={activeLesson.number}
              onOpenAITutor={onOpenAITutor}
              onOpenSlideQuestionModal={onOpenSlideQuestionModal}
              showToast={showToast}
            />
          )}

          {mediaMode === 'video' && (
            <div
              ref={videoContainerRef}
              id="video-player-container"
              className="relative group aspect-video w-full rounded-md overflow-hidden bg-slate-950 border border-slate-300 shadow-sm"
            >
              <img
                src={
                  activeLesson.videoPoster ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAi2OSUiwM5su5vQhRiIf5shZABoahkI_oaSLTLmZ1Sp9revrSJASseCbGlbWIFlUB02tvy8y2iksxubCmDbcwddkBuSCqQIU_cEFXuTcRVu3kDZD11d5I-Lqren5ULNfggZzEFM-VSiIVz7iDgEplLPTJEx11J6cTDKTagiVfFKUlno4fzuL7kqQ-Gaqi5wwB1KJsmSNxLhYxRgk-AE_AoFsEBJWoSDSFMT-0UmIgA4mz_jGim2zSCt1nF14zCfEUi6yPbCD6kAVSH'
                }
                alt="Lesson Video Frame"
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isPlaying ? 'brightness-75' : 'brightness-90'
                }`}
              />

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <button
                  id="play-pause-center-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded-full flex items-center justify-center shadow-md transform transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current ml-1" />
                  )}
                </button>
              </div>

              {/* Bottom Controls Bar with Speed Control */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent opacity-95 group-hover:opacity-100 transition-opacity">
                <div className="flex flex-wrap items-center justify-between text-white text-xs font-semibold mb-2">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsMuted(!isMuted)} className="cursor-pointer">
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white hover:text-[#1890ff]" />
                      )}
                    </button>
                    <span>Tempo: 12:00 / {activeLesson.duration}</span>
                  </div>

                  {/* Speed Control Choices */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-300 font-mono">Velocidade:</span>
                    {['0.5x', '0.75x', '1.0x', '1.25x', '1.5x'].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackRate(speed)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                          playbackRate === speed
                            ? 'bg-[#1890ff] text-white font-bold'
                            : 'bg-white/20 hover:bg-white/30 text-slate-200'
                        }`}
                      >
                        {speed}
                      </button>
                    ))}
                    <button onClick={toggleFullscreen} className="cursor-pointer ml-2">
                      <Maximize className="w-4 h-4 hover:text-[#1890ff]" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar Scrub */}
                <div
                  className="relative h-2 w-full bg-white/30 rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newPercent = Math.round((clickX / rect.width) * 100);
                    setProgressPercent(newPercent);
                  }}
                >
                  <div
                    className="h-full bg-[#1890ff] rounded-full shadow-xs transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {mediaMode === 'split' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              {/* Video Frame */}
              <div
                ref={videoContainerRef}
                id="video-player-container-split"
                className="relative group aspect-video w-full rounded-md overflow-hidden bg-slate-950 border border-slate-300 shadow-sm"
              >
                <img
                  src={
                    activeLesson.videoPoster ||
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuAi2OSUiwM5su5vQhRiIf5shZABoahkI_oaSLTLmZ1Sp9revrSJASseCbGlbWIFlUB02tvy8y2iksxubCmDbcwddkBuSCqQIU_cEFXuTcRVu3kDZD11d5I-Lqren5ULNfggZzEFM-VSiIVz7iDgEplLPTJEx11J6cTDKTagiVfFKUlno4fzuL7kqQ-Gaqi5wwB1KJsmSNxLhYxRgk-AE_AoFsEBJWoSDSFMT-0UmIgA4mz_jGim2zSCt1nF14zCfEUi6yPbCD6kAVSH'
                  }
                  alt="Lesson Video Frame"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isPlaying ? 'brightness-75' : 'brightness-90'
                  }`}
                />

                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <button
                    id="play-pause-center-btn-split"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 bg-[#1890ff] text-white rounded-full flex items-center justify-center shadow-md transform transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-current" />
                    ) : (
                      <Play className="w-7 h-7 fill-current ml-1" />
                    )}
                  </button>
                </div>
              </div>

              {/* Slides Frame */}
              <LessonSlideDeckViewer
                slides={activeSlides}
                lessonTitle={activeLesson.title}
                lessonNumber={activeLesson.number}
                onOpenAITutor={onOpenAITutor}
                onOpenSlideQuestionModal={onOpenSlideQuestionModal}
                showToast={showToast}
              />
            </div>
          )}

          {/* Lesson Header & Progress Action */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 border-b border-slate-200 pb-5">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1890ff] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {currentModule.title || 'Módulo 3 (Active)'}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {activeLesson.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                {activeLesson.description}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 shrink-0 w-full md:w-auto">
              <button
                id="toggle-complete-btn"
                onClick={handleToggleComplete}
                className={`px-6 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                  isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-[#1890ff] hover:bg-[#096dd9] text-white shadow-xs'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? '✓ Concluída' : 'Marcar como concluída'}</span>
              </button>

              <div className="flex gap-2">
                <button
                  id="like-lesson-btn"
                  onClick={handleToggleLike}
                  className={`flex-1 px-3 py-2 border rounded-md transition-all flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer ${
                    liked
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{liked ? 'Gostou' : 'Gostei'} ({likeCount})</span>
                </button>

                <button
                  id="share-lesson-btn"
                  onClick={handleShare}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartilhar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Instructor Profile Card (Dr. Elena Sterling) */}
          <div className="bg-white border border-slate-200 p-5 rounded-md shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop"
                  alt="Dr. Elena Sterling"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#1890ff]"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Instrutora Online"></span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">Dr. Elena Sterling</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#1890ff]/10 text-[#1890ff] rounded border border-[#1890ff]/20">
                    Ph.D. Financial Management
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Especialista sênior em DRE, DFC e Contabilidade de Gestão para negócios de alimentação.
                </p>
                <p className="text-[11px] text-slate-500">
                  Mais de 15 anos orientando executivos e gestores de gastronomia.
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenAITutor('Dr. Elena Sterling, pode me tirar uma dúvida técnica sobre esta aula?')}
              className="px-4 py-2 bg-slate-100 hover:bg-[#1890ff] text-slate-800 hover:text-white border border-slate-200 hover:border-[#1890ff] rounded-md font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
            >
              <MessageSquare className="w-4 h-4 text-[#1890ff] group-hover:text-white" />
              <span>Dúvida para a Instrutora</span>
            </button>
          </div>

          {/* Lesson Rating System Component */}
          <div className="bg-white border border-slate-200 p-5 rounded-md shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Sistema de Avaliação da Aula</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Avalie o conteúdo didático e ajude a aprimorar a experiência da Sagacitas E-Learning.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md shrink-0">
                <span className="text-base font-black text-amber-900">4.9</span>
                <div className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] text-amber-800 font-medium">(128 avaliações)</span>
              </div>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Sua Nota:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= userRating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-600">{userRating} / 5 estrelas</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="Escreva um comentário opcional sobre a clareza da aula..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1890ff] outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded-md text-xs font-bold cursor-pointer transition-all shadow-xs"
                >
                  {ratingSubmitted ? '✓ Avaliado' : 'Enviar Avaliação'}
                </button>
              </div>
            </form>
          </div>

          {/* Anexos e Materiais */}
          <div className="bg-white border border-slate-200 p-5 rounded-md space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#1890ff]" />
                <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-900">
                  Materiais Complementares
                </h3>
              </div>
              <span className="text-[10px] bg-blue-50 text-[#1890ff] px-2 py-0.5 rounded font-bold border border-blue-200">
                {(activeLesson.attachments?.length || 2)} arquivos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(activeLesson.attachments && activeLesson.attachments.length > 0
                ? activeLesson.attachments
                : [
                    { id: 'att-def-1', name: 'Apostila_Oficial_DRE_Alchymist.pdf', type: 'pdf' as const, size: '3.4 MB' },
                    { id: 'att-def-2', name: 'Planilha_Simulador_DRE_Restaurante.xlsx', type: 'excel' as const, size: '1.4 MB' }
                  ]
              ).map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-all group"
                >
                  <div className="p-2 rounded bg-white border border-slate-200 text-[#1890ff]">
                    {att.type === 'excel' ? (
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1890ff] transition-colors">
                      {att.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {att.size || 'Documento complementar'}
                    </p>
                  </div>
                  <button
                    onClick={() => showToast(`Download de ${att.name} iniciado!`)}
                    className="p-1.5 bg-white hover:bg-[#1890ff] text-slate-700 hover:text-white rounded border border-slate-200 transition-all shrink-0 cursor-pointer shadow-2xs"
                    title="Baixar anexo"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-md font-bold text-xs shadow-xl animate-bounce">
              {toastMessage}
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-900">
              Discussão da Turma
            </h3>

            <form onSubmit={handleAddComment} className="bg-white p-4 rounded-md border border-slate-200 shadow-2xs flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#1890ff] shrink-0 font-bold border border-blue-200">
                <User className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Envie sua dúvida ou contribuição sobre a aula..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1890ff] outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded-md font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Publicar</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-2">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white p-3 rounded-md border border-slate-200 flex gap-3 shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 text-xs font-bold">
                    {comment.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs text-slate-900">{comment.author}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{comment.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Panel: Conteúdo do Curso (Right Sidebar) */}
        <aside
          id="right-panel-course-content"
          className="w-full lg:w-[380px] bg-white border-l border-slate-200 flex flex-col h-full lg:h-[calc(100vh-64px)] shadow-2xs"
        >
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1890ff]" />
                <span>Conteúdo do Curso</span>
              </h3>
              <span className="text-[10px] bg-blue-50 text-[#1890ff] px-2 py-0.5 rounded font-bold border border-blue-200">
                4 Módulos
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Virtual Classroom • Progresso em tempo real
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {[
              { id: 'mod-1', name: 'Módulo 1', title: 'Fundamentos & DRE do Restaurante', status: 'Concluído', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
              { id: 'mod-2', name: 'Módulo 2', title: 'Custos Operacionais & Margem de Contribuição', status: 'Concluído', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
              { id: 'mod-3', name: 'Módulo 3', title: 'Análise de Desempenho & EBITDA na Prática', status: '(Active)', badgeColor: 'bg-blue-50 text-[#1890ff] border-blue-200', active: true, icon: Play },
              { id: 'mod-4', name: 'Módulo 4', title: 'Ações de Mitigação & Ritual da DRE', status: '(Locked)', badgeColor: 'bg-slate-100 text-slate-600 border-slate-200', locked: true, icon: Lock },
            ].map((mod) => (
              <div
                key={mod.id}
                className={`p-3 rounded-md border transition-all ${
                  mod.active
                    ? 'bg-blue-50/50 border-[#1890ff] shadow-xs'
                    : mod.locked
                    ? 'bg-slate-50/60 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <mod.icon className={`w-3.5 h-3.5 ${mod.active ? 'text-[#1890ff]' : mod.locked ? 'text-slate-400' : 'text-emerald-600'}`} />
                    {mod.name}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold border ${mod.badgeColor}`}>
                    {mod.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-1">
                  {mod.title}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-medium">
                  <span>5 aulas</span>
                  <span>{mod.locked ? '0%' : mod.active ? '60%' : '100%'} concluído</span>
                </div>
              </div>
            ))}

            {/* Expanded Detailed Module Lessons Accordion */}
            <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Aulas do Módulo 3 (Ativo)
              </h4>
              {currentModule.lessons?.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full text-left p-2 rounded-md border text-xs transition-all cursor-pointer flex items-center justify-between ${
                    lesson.id === activeLesson.id
                      ? 'bg-[#1890ff] text-white border-[#1890ff] font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="truncate pr-2">{lesson.title}</span>
                  <span className="text-[10px] shrink-0 opacity-80">{lesson.duration}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
