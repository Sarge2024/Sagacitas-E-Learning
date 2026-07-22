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
  ExternalLink,
  History,
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
  const currentModule = modules[0] || { title: 'MÓDULO 1: INTRODUÇÃO', lessons: [] };

  const [activeLesson, setActiveLesson] = useState<Lesson>(
    currentModule.lessons?.find((l) => l.active) ||
      currentModule.lessons?.[3] || {
        id: 'aula-04',
        number: '04',
        title: 'Aula 04: Fundamentos de IA',
        duration: '25:00',
        completed: false,
        active: true,
        description:
          'Nesta aula, exploramos os conceitos fundamentais que sustentam as Redes Neurais e como o processamento de linguagem natural transformou a indústria tech. Ideal para quem busca entender a base teórica antes da prática.',
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
  const [playbackRate, setPlaybackRate] = useState('1.25x');
  const [progressPercent, setProgressPercent] = useState(51);
  const [isCompleted, setIsCompleted] = useState(activeLesson.completed);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
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
    <div id="lesson-player-page" className="min-h-screen bg-slate-100/80 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header
        id="lesson-top-bar"
        className={`fixed top-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-12 transition-all duration-300 shadow-xs ${
          isSidebarCollapsed ? 'left-20' : 'left-64'
        }`}
      >
        <div className="flex items-center gap-4">
          {onToggleCollapse && (
            <button
              id="lesson-toggle-sidebar-btn"
              onClick={onToggleCollapse}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              title={isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          )}

          <button
            id="back-to-dashboard-btn"
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-700 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider hidden md:block">
              Voltar ao Dashboard
            </span>
          </button>
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Sagacitas E-Learning</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 rounded-full border border-indigo-200">
            <Award className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-extrabold text-indigo-900">
              {currentModule.title || 'Módulo: IA Generativa'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-slate-600 hover:text-indigo-600 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-slate-600 hover:text-indigo-600 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="pt-16 min-h-screen flex flex-col lg:flex-row overflow-hidden">
        {/* Central Lesson Content */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          {/* Media Mode Selector Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <div className="flex items-center gap-1.5">
              <button
                id="mode-slides-btn"
                onClick={() => setMediaMode('slides')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer border ${
                  mediaMode === 'slides'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Presentation className="w-4 h-4" />
                <span>Slides da Aula ({activeSlides.length})</span>
              </button>

              <button
                id="mode-video-btn"
                onClick={() => setMediaMode('video')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer border ${
                  mediaMode === 'video'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Vídeoaula</span>
              </button>

              <button
                id="mode-split-btn"
                onClick={() => setMediaMode('split')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer border ${
                  mediaMode === 'split'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Columns className="w-4 h-4" />
                <span className="hidden sm:inline">Modo Dividido (Vídeo + Slides)</span>
                <span className="sm:hidden">Dividido</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 px-2">
              <span className="text-[10px] bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full font-extrabold border border-sky-200 flex items-center gap-1">
                <Presentation className="w-3 h-3 text-sky-600" />
                Apresentação DRE Alchymist
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
              className="relative group aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 shadow-lg"
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
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <button
                  id="play-pause-center-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 fill-current" />
                  ) : (
                    <Play className="w-10 h-10 fill-current ml-1" />
                  )}
                </button>
              </div>

              {/* Bottom Controls Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent opacity-95 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between text-white text-xs font-semibold mb-3">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setIsMuted(!isMuted)} className="cursor-pointer">
                      {isMuted ? (
                        <VolumeX className="w-5 h-5 text-red-400" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white hover:text-sky-300" />
                      )}
                    </button>
                    <span>Tempo Decorrido: 12:45 / {activeLesson.duration}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        setPlaybackRate(
                          playbackRate === '1.0x'
                            ? '1.25x'
                            : playbackRate === '1.25x'
                            ? '1.5x'
                            : '1.0x'
                        )
                      }
                      className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors font-mono cursor-pointer"
                    >
                      {playbackRate}
                    </button>
                    <button onClick={toggleFullscreen} className="cursor-pointer">
                      <Maximize className="w-5 h-5 hover:text-sky-300" />
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
                    className="h-full bg-indigo-500 rounded-full shadow-sm transition-all duration-300"
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
                className="relative group aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 shadow-lg"
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <button
                    id="play-pause-center-btn-split"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 fill-current" />
                    ) : (
                      <Play className="w-8 h-8 fill-current ml-1" />
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

          {/* Lesson Info Header */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {activeLesson.title}
              </h2>
              <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
                {activeLesson.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <button
                id="toggle-complete-btn"
                onClick={handleToggleComplete}
                className={`px-8 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  isCompleted
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleted ? '✓ Concluída' : 'Marcar como concluída'}</span>
              </button>

              <div className="flex gap-2">
                <button
                  id="like-lesson-btn"
                  onClick={handleToggleLike}
                  className={`flex-1 px-4 py-2.5 border rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold cursor-pointer ${
                    liked
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{liked ? 'Gostou' : 'Gostei'} ({likeCount})</span>
                </button>

                <button
                  id="share-lesson-btn"
                  onClick={handleShare}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Anexos e Materiais Agrupados a Esta Aula */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4.5 h-4.5 text-indigo-600" />
                <h3 className="text-xs uppercase tracking-widest font-black text-indigo-900">
                  Anexos e Materiais Agrupados a Esta Aula
                </h3>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-full font-bold border border-indigo-200 flex items-center gap-1">
                <Paperclip className="w-3 h-3 text-indigo-600" />
                {(activeLesson.attachments?.length || 2)} {activeLesson.attachments?.length === 1 ? 'arquivo' : 'arquivos'}
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
                  className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all group"
                >
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-indigo-600 shadow-2xs">
                    {att.type === 'excel' ? (
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">
                      {att.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {att.size || 'Documento complementar'} • Agrupado nesta aula
                    </p>
                  </div>
                  <button
                    onClick={() => showToast(`Download de ${att.name} iniciado!`)}
                    className="p-2 bg-white hover:bg-indigo-600 text-slate-700 hover:text-white rounded-lg border border-slate-200 transition-all shrink-0 cursor-pointer shadow-2xs"
                    title="Baixar anexo da aula"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-2xl animate-bounce">
              {toastMessage}
            </div>
          )}

          {/* Comments Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-xs uppercase tracking-widest font-black text-slate-800">
              Comentários da Turma
            </h3>

            <form onSubmit={handleAddComment} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0 font-black border border-indigo-200">
                <User className="w-5 h-5" />
              </div>

              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Dúvida ou feedback sobre esta aula?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Postar Comentário</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-3 pt-2">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 text-xs font-black">
                    {comment.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
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

        {/* Right Sidebar: Course Structure */}
        <aside
          id="course-structure-sidebar"
          className="w-full lg:w-[410px] bg-white border-l border-slate-200 flex flex-col h-full lg:h-[calc(100vh-64px)] shadow-xs"
        >
          <div className="p-5 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Módulos do Treinamento</span>
              </h3>
              <span className="text-[10px] bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-full font-bold border border-indigo-200">
                {modules.length} Módulos
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {modules.reduce((acc, m) => acc + m.lessons.filter((l) => l.completed).length, 0)}/
                {modules.reduce((acc, m) => acc + m.lessons.length, 0)} aulas concluídas
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {modules.map((mod) => {
              const isExpanded = expandedModuleIds[mod.id] ?? true;
              const completedCount = mod.lessons.filter((l) => l.completed).length;
              const hasActiveLessonInMod = mod.lessons.some((l) => l.id === activeLesson.id);

              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    hasActiveLessonInMod
                      ? 'bg-indigo-50/40 border-indigo-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Module Header Toggle */}
                  <button
                    onClick={() => toggleModuleExpand(mod.id)}
                    className="w-full p-3.5 text-left flex flex-col gap-1.5 transition-colors cursor-pointer hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex-1 leading-snug">
                        {mod.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {mod.duration && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-indigo-600" />
                            {mod.duration}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Module Focus / Objective */}
                    {mod.focus && (
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200 leading-relaxed font-medium">
                        <Target className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-indigo-900 font-bold">Foco: </strong>
                          {mod.focus}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-0.5">
                      <span>{mod.lessons.length} aulas</span>
                      <span>{completedCount}/{mod.lessons.length} concluídas</span>
                    </div>
                  </button>

                  {/* Module Lessons Accordion Content */}
                  {isExpanded && (
                    <div className="px-2 pb-3 pt-1 border-t border-slate-200 space-y-1 bg-slate-50/60">
                      {mod.lessons.map((lesson) => {
                        const isActive = lesson.id === activeLesson.id;
                        const hasAttachments = lesson.attachments && lesson.attachments.length > 0;

                        return (
                          <div key={lesson.id} className="space-y-1">
                            <button
                              id={`lesson-item-${lesson.id}`}
                              onClick={() => {
                                if (!lesson.locked) {
                                  setActiveLesson(lesson);
                                  setIsCompleted(lesson.completed);
                                } else {
                                  showToast('Conclua a aula anterior para desbloquear!');
                                }
                              }}
                              className={`w-full text-left rounded-xl transition-all p-2.5 flex items-center gap-3 ${
                                isActive
                                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                                  : lesson.locked
                                  ? 'opacity-50 cursor-not-allowed hover:bg-slate-100'
                                  : 'hover:bg-slate-200/60 cursor-pointer text-slate-800'
                              }`}
                            >
                              {lesson.completed ? (
                                <CheckCircle2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-300' : 'text-emerald-600'}`} />
                              ) : isActive ? (
                                <Play className="w-4 h-4 text-white fill-current shrink-0" />
                              ) : lesson.locked ? (
                                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                              )}

                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-xs truncate ${
                                    isActive ? 'text-white font-extrabold' : 'text-slate-900 font-semibold'
                                  }`}
                                >
                                  {lesson.title}
                                </p>
                                <div className="flex items-center justify-between mt-0.5">
                                  <p className={`text-[10px] ${isActive ? 'text-indigo-100 font-medium' : 'text-slate-500'}`}>
                                    {isActive ? 'Assistindo agora • ' : ''}
                                    {lesson.duration}
                                  </p>
                                  {hasAttachments && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 ${
                                      isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                    }`}>
                                      <Paperclip className="w-2.5 h-2.5" />
                                      {lesson.attachments!.length}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>

                            {/* Sub-list of attachments grouped directly under ACTIVE lesson */}
                            {isActive && hasAttachments && (
                              <div className="ml-7 pl-2 border-l-2 border-indigo-400 space-y-1 py-1">
                                {lesson.attachments!.map((att) => (
                                  <a
                                    key={att.id}
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      showToast(`Download de ${att.name} iniciado!`);
                                    }}
                                    className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-[10px] text-slate-800 group shadow-2xs"
                                  >
                                    {att.type === 'excel' ? (
                                      <FileSpreadsheet className="w-3 h-3 text-emerald-600 shrink-0" />
                                    ) : (
                                      <FileText className="w-3 h-3 text-rose-600 shrink-0" />
                                    )}
                                    <span className="flex-1 truncate font-bold text-slate-800 group-hover:text-indigo-700">
                                      {att.name}
                                    </span>
                                    <Download className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Anexos Section da Aula Atual */}
            <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
              <div className="px-1 flex items-center justify-between">
                <h4 className="text-[10px] uppercase tracking-widest text-indigo-800 font-extrabold flex items-center gap-1.5">
                  <Paperclip className="w-3 h-3 text-indigo-600" />
                  <span>Anexos da Aula Ativa</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">
                  {activeLesson.attachments?.length || 2} arquivos
                </span>
              </div>

              {(activeLesson.attachments && activeLesson.attachments.length > 0
                ? activeLesson.attachments
                : [
                    { id: 'att-def-1', name: 'Apostila_Oficial_DRE_Alchymist.pdf', type: 'pdf' as const, size: '3.4 MB' },
                    { id: 'att-def-2', name: 'Planilha_Simulador_DRE_Restaurante.xlsx', type: 'excel' as const, size: '1.4 MB' }
                  ]
              ).map((att) => (
                <a
                  key={`sb-${att.id}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast(`Download de ${att.name} iniciado!`);
                  }}
                  className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors group text-xs text-slate-800 shadow-2xs"
                >
                  {att.type === 'excel' ? (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  )}
                  <span className="flex-1 truncate text-[11px] font-bold">{att.name}</span>
                  <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
