import React, { useRef, useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, HelpCircle, CheckCircle2, XCircle, Sparkles, Gauge } from 'lucide-react';
import { Slide, SlideElement } from '../../types/presentation';
import { usePresentationStore } from '../../store/usePresentationStore';

// Register GSAP plugin
gsap.registerPlugin(useGSAP);

interface SlidePlayerProps {
  slide: Slide;
  aspectRatio?: '16:9' | '4:3';
  autoPlay?: boolean;
  onNextSlide?: () => void;
  onPrevSlide?: () => void;
  hasNextSlide?: boolean;
  hasPrevSlide?: boolean;
  slideNumber?: number;
  totalSlides?: number;
}

export const SlidePlayer: React.FC<SlidePlayerProps> = ({
  slide,
  aspectRatio = '16:9',
  autoPlay = true,
  onNextSlide,
  onPrevSlide,
  hasNextSlide = false,
  hasPrevSlide = false,
  slideNumber = 1,
  totalSlides = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [progress, setProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.75); // Velocidade padrão suave
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // GSAP Animation setup using useGSAP
  useGSAP(
    () => {
      if (!containerRef.current || !slide) return;

      // Kill previous timeline if any
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // Reset ONLY transform and opacity so React's left, top, width, height are preserved!
      elementsRef.current.forEach((el) => {
        if (el) {
          gsap.set(el, { clearProps: 'transform,opacity,visibility,scale,x,y' });
        }
      });

      // Sort elements by animation order or delay
      const sortedElements = [...slide.elements].sort((a, b) => {
        const orderA = a.animation?.order ?? 99;
        const orderB = b.animation?.order ?? 99;
        return orderA - orderB;
      });

      // Master Timeline for this slide
      const tl = gsap.timeline({
        paused: !isPlaying,
        onUpdate: () => {
          if (tl) {
            setProgress(tl.progress());
          }
        },
        onComplete: () => {
          setIsPlaying(false);
        },
      });

      tl.timeScale(playbackSpeed);
      timelineRef.current = tl;

      // Build animation for each element
      sortedElements.forEach((element) => {
        const elDom = elementsRef.current.get(element.id);
        if (!elDom) return;

        const anim = element.animation || {
          effect: 'fadeIn',
          duration: 1.0,
          delay: 0,
          order: 1,
        };

        const duration = anim.duration || 1.0;
        const delay = anim.delay || 0;

        // Set initial state based on effect using smooth transforms
        switch (anim.effect) {
          case 'fadeIn':
            gsap.set(elDom, { opacity: 0 });
            tl.to(elDom, { opacity: 1, duration, ease: 'power2.out' }, `+=${delay}`);
            break;

          case 'slideLeft':
            gsap.set(elDom, { x: -40, opacity: 0 });
            tl.to(elDom, { x: 0, opacity: 1, duration, ease: 'power3.out' }, `+=${delay}`);
            break;

          case 'slideRight':
            gsap.set(elDom, { x: 40, opacity: 0 });
            tl.to(elDom, { x: 0, opacity: 1, duration, ease: 'power3.out' }, `+=${delay}`);
            break;

          case 'zoomIn':
            gsap.set(elDom, { scale: 0.85, opacity: 0 });
            tl.to(elDom, { scale: 1, opacity: 1, duration, ease: 'back.out(1.4)' }, `+=${delay}`);
            break;

          case 'custom':
          default:
            gsap.set(elDom, { opacity: 0, y: 20 });
            tl.to(elDom, { opacity: 1, y: 0, duration, ease: 'power2.out' }, `+=${delay}`);
            break;
        }
      });

      if (autoPlay) {
        tl.play(0);
        setIsPlaying(true);
      }
    },
    { scope: containerRef, dependencies: [slide.id] }
  );

  // Synchronize playback speed with GSAP timeline
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.timeScale(playbackSpeed);
    }
  }, [playbackSpeed]);

  // Play / Pause toggle
  const handlePlayPause = () => {
    if (!timelineRef.current) return;
    if (isPlaying) {
      timelineRef.current.pause();
      setIsPlaying(false);
    } else {
      if (timelineRef.current.progress() === 1) {
        timelineRef.current.restart();
      } else {
        timelineRef.current.play();
      }
      setIsPlaying(true);
    }
  };

  // Replay timeline
  const handleReplay = () => {
    if (!timelineRef.current) return;
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
    timelineRef.current.restart();
    setIsPlaying(true);
  };

  // Seek timeline
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (timelineRef.current) {
      timelineRef.current.progress(val);
    }
  };

  // Reset quiz state when slide changes
  useEffect(() => {
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
  }, [slide.id]);

  const renderElementContent = (element: SlideElement) => {
    const { content, type } = element;

    switch (type) {
      case 'text':
        return (
          <div
            className="w-full h-full flex flex-col justify-center overflow-hidden rounded-md p-3 box-border"
            style={{
              fontSize: content.style?.fontSize || '1.25rem',
              fontWeight: content.style?.fontWeight || '600',
              color: content.style?.color || '#ffffff',
              backgroundColor: content.style?.backgroundColor || 'transparent',
              padding: content.style?.padding || '8px',
              borderRadius: content.style?.borderRadius || '8px',
              lineHeight: content.style?.lineHeight || '1.5',
              textAlign: (content.style?.textAlign as any) || 'left',
              wordBreak: 'break-word',
            }}
          >
            <p 
              className="whitespace-pre-line leading-relaxed w-full" 
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.text || '') }} 
            />
          </div>
        );

      case 'image':
        return content.src ? (
          <img
            src={content.src}
            alt={content.alt || 'Slide visual element'}
            className="w-full h-full object-cover rounded-md shadow-2xs border border-white/10"
            style={content.style}
          />
        ) : (
          <div className="w-full h-full bg-slate-900/80 border border-white/10 rounded-md flex flex-col items-center justify-center text-slate-400">
            <span className="text-[24px] mb-2 opacity-50">🖼️</span>
            <span className="text-xs font-mono">Imagem não carregada</span>
          </div>
        );

      case 'video':
        return (
          <div className="w-full h-full bg-slate-950 rounded-md overflow-hidden border border-white/20 flex items-center justify-center shadow-2xs">
            {content.src ? (
              <video
                src={content.src}
                className="w-full h-full object-cover"
                autoPlay={content.mediaSettings?.autoPlay}
                loop={content.mediaSettings?.loop}
                controls={content.mediaSettings?.controls !== false}
              />
            ) : (
              <div className="text-center p-4">
                <Play className="w-10 h-10 text-[#0a6ed1] mx-auto mb-2 opacity-80" />
                <span className="text-xs text-slate-300">Vídeo não carregado</span>
              </div>
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="w-full h-full bg-slate-800 rounded-md overflow-hidden border border-white/20 flex flex-col items-center justify-center p-4 shadow-2xs">
            {content.src ? (
              <>
                <span className="text-[32px] mb-3">🎵</span>
                <span className="text-xs font-bold text-slate-300 font-mono mb-4 text-center">Faixa de Áudio</span>
                <audio
                  src={content.src}
                  className="w-full max-w-full"
                  autoPlay={content.mediaSettings?.autoPlay}
                  loop={content.mediaSettings?.loop}
                  controls={content.mediaSettings?.controls !== false}
                />
              </>
            ) : (
              <span className="text-xs text-slate-400">Áudio não configurado</span>
            )}
          </div>
        );

      case 'question':
        const quiz = content.quizData;
        if (!quiz) return null;

        const isCorrect = quizSelectedOption === quiz.correctIndex;

        return (
          <div className="w-full h-full bg-[#1c222b]/95 backdrop-blur-md border border-[#0a6ed1]/40 rounded-md p-6 shadow-2xs flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 text-[#0a6ed1] text-xs font-mono font-bold uppercase mb-2">
                <HelpCircle className="w-4 h-4" />
                <span>Pergunta de Fixação</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                {quiz.question}
              </h3>

              <div className="space-y-2.5 mb-4">
                {quiz.options.map((opt, idx) => {
                  let btnStyle = 'border-white/15 bg-slate-950/60 text-slate-200 hover:border-[#0a6ed1]/60';
                  if (quizSubmitted) {
                    if (idx === quiz.correctIndex) {
                      btnStyle = 'border-[#107e3e] bg-[#107e3e]/20 text-[#2b7d2b] font-bold';
                    } else if (idx === quizSelectedOption) {
                      btnStyle = 'border-[#bb0000] bg-[#bb0000]/20 text-rose-300';
                    } else {
                      btnStyle = 'border-white/5 opacity-50 bg-slate-950';
                    }
                  } else if (quizSelectedOption === idx) {
                    btnStyle = 'border-[#0a6ed1] bg-[#0a6ed1]/20 text-white font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizSubmitted}
                      onClick={() => setQuizSelectedOption(idx)}
                      className={`w-full text-left px-4 py-3 rounded-md border text-xs md:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && idx === quiz.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-[#107e3e] shrink-0" />
                      )}
                      {quizSubmitted && idx === quizSelectedOption && idx !== quiz.correctIndex && (
                        <XCircle className="w-4 h-4 text-[#bb0000] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              {!quizSubmitted ? (
                <button
                  disabled={quizSelectedOption === null}
                  onClick={() => setQuizSubmitted(true)}
                  className="w-full py-2.5 bg-[#0a6ed1] hover:bg-[#0854a0] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-2xs"
                >
                  Confirmar Resposta
                </button>
              ) : (
                <div
                  className={`p-3 rounded-md border text-xs flex items-start gap-2.5 ${
                    isCorrect
                      ? 'bg-[#107e3e]/15 border-[#107e3e]/40 text-[#107e3e]'
                      : 'bg-[#bb0000]/15 border-[#bb0000]/40 text-rose-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-1">
                      {isCorrect ? '✨ Parabéns! Resposta Correta.' : '⚠️ Atenção à explicação:'}
                    </span>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {quiz.explanation || 'Reveja o conteúdo do slide anterior para consolidar o aprendizado.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'simulation':
        return (
          <div className="w-full h-full bg-[#1c222b]/95 border border-[#0a6ed1]/40 rounded-md p-4 shadow-2xs flex flex-col justify-between overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[10px] font-mono font-bold text-[#0a6ed1] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0a6ed1]" />
                <span>Simulador DRE Operacional • Sagacitas Builder</span>
              </span>
              <span className="text-[9px] bg-[#0a6ed1]/20 text-[#0a6ed1] font-bold px-2 py-0.5 rounded-md">
                Widget Ativo
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2 text-[11px]">
              <div className="bg-slate-950 p-2.5 rounded-md border border-white/10">
                <span className="text-slate-400 block text-[9px]">Receita Bruta Estimada</span>
                <span className="text-[#107e3e] font-extrabold text-sm">R$ 120.000,00</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-md border border-white/10">
                <span className="text-slate-400 block text-[9px]">CMV Meta (30%)</span>
                <span className="text-[#0a6ed1] font-extrabold text-sm">R$ 36.000,00</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-md border border-white/10">
                <span className="text-slate-400 block text-[9px]">Folha de Pagamento (25%)</span>
                <span className="text-[#e66000] font-extrabold text-sm">R$ 30.000,00</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-md border border-white/10">
                <span className="text-slate-400 block text-[9px]">EBITDA Estimado (18%)</span>
                <span className="text-[#107e3e] font-extrabold text-sm">R$ 21.600,00</span>
              </div>
            </div>

            <div className="p-2 bg-[#0a6ed1]/10 border border-[#0a6ed1]/30 rounded-md text-[10px] text-[#f5f6f7] text-center">
              💡 Dica do Instrutor: Ajustes de 2% no CMV representam R$ 2.400,00 a mais de lucro no mês!
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const aspectClass = aspectRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-video';

  return (
    <div className="w-full space-y-3">
      {/* Slide Viewport Frame */}
      <div
        ref={containerRef}
        className={`w-full ${aspectClass} relative rounded-md overflow-hidden shadow-2xs border border-white/10 select-none`}
        style={{
          backgroundColor: slide.background.type === 'color' ? slide.background.value : '#0f172a',
          backgroundImage:
            slide.background.type === 'image' 
              ? `url(${slide.background.value})` 
              : (slide.background.pattern ? slide.background.pattern : undefined),
          backgroundSize: slide.background.type === 'image' ? 'cover' : 'auto',
          backgroundPosition: 'center',
        }}
      >
        {/* Elements Container */}
        {slide.elements.map((element) => {
          return (
            <div
              key={element.id}
              ref={(el) => {
                if (el) elementsRef.current.set(element.id, el);
                else elementsRef.current.delete(element.id);
              }}
              className="absolute transition-shadow"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: `${element.width}%`,
                height: `${element.height}%`,
                zIndex: element.zIndex || 1,
              }}
            >
              {renderElementContent(element)}
            </div>
          );
        })}

        {/* Slide Counter Overlay */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/70 border border-white/10 text-[10px] font-mono text-slate-300 backdrop-blur-md">
          {slideNumber} / {totalSlides}
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-slate-900/90 border border-white/10 p-3 rounded-md flex items-center gap-3 shadow-lg backdrop-blur-md">
        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          className="w-8 h-8 rounded-md bg-[#2fd9f4] hover:bg-[#28c4dd] text-slate-950 flex items-center justify-center font-bold transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
          title={isPlaying ? 'Pausar Animação' : 'Reproduzir Animação'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Replay */}
        <button
          onClick={handleReplay}
          className="w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
          title="Reiniciar Slide"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Speed Selector */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="h-8 px-2.5 rounded-md bg-slate-950 border border-white/10 hover:border-[#2fd9f4]/40 text-white text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Ajustar Velocidade de Reprodução"
          >
            <Gauge className="w-3.5 h-3.5 text-[#2fd9f4]" />
            <span>{playbackSpeed}x</span>
          </button>

          {showSpeedMenu && (
            <div className="absolute bottom-10 left-0 bg-slate-950 border border-white/15 rounded-md p-1.5 shadow-2xs z-50 flex flex-col gap-1 w-28">
              <span className="text-[9px] font-mono font-bold text-slate-400 px-2 py-1 uppercase">
                Velocidade
              </span>
              {[
                { label: '0.5x (Lento)', val: 0.5 },
                { label: '0.75x (Suave)', val: 0.75 },
                { label: '1.0x (Normal)', val: 1.0 },
                { label: '1.25x (Rápido)', val: 1.25 },
                { label: '1.5x (Até 1.5x)', val: 1.5 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => {
                    setPlaybackSpeed(opt.val);
                    setShowSpeedMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                    playbackSpeed === opt.val
                      ? 'bg-[#2fd9f4] text-slate-950 font-extrabold'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeline Slider Progress */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={handleSeek}
            className="w-full accent-[#2fd9f4] cursor-pointer h-1.5 bg-slate-950 rounded-md"
          />
          <span className="text-[10px] font-mono text-slate-400 w-9 text-right">
            {Math.round(progress * 100)}%
          </span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-1 shrink-0 border-l border-white/10 pl-2">
          <button
            disabled={!hasPrevSlide}
            onClick={onPrevSlide}
            className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
            title="Slide Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={!hasNextSlide}
            onClick={onNextSlide}
            className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
            title="Próximo Slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
