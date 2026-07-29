import React, { useRef, useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Slide, SlideElement } from '../../types/presentation';
import { usePresentationStore } from '../../store/usePresentationStore';
import { HelpCircle, Sparkles, Move, Maximize2, Type, Image as ImageIcon, Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Play } from 'lucide-react';
import { applyInlineFormat, applyLink, applyList } from '../../utils/richTextFormat';

interface SlideEditorProps {
  slide: Slide;
  aspectRatio?: '16:9' | '4:3';
  zoomScale?: number;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  slide,
  aspectRatio = '16:9',
  zoomScale = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedElementId, setSelectedElementId, updateElement, updateElementContent, removeElement, theme } = usePresentationStore();

  const [isDragging, setIsDragging] = useState(false);
  const [showSnapX, setShowSnapX] = useState(false); // Snap line center X (50%)
  const [showSnapY, setShowSnapY] = useState(false); // Snap line center Y (50%)

  // Helper to handle mouse drag & snap
  const handleElementMouseDown = (e: React.MouseEvent, element: SlideElement) => {
    e.stopPropagation();
    setSelectedElementId(element.id);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startElemX = element.x;
    const startElemY = element.y;

    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;

      // Convert pixel delta to percentage of container
      let newX = startElemX + (deltaX / rect.width) * 100;
      let newY = startElemY + (deltaY / rect.height) * 100;

      // Snap logic to center (50%) with 2% tolerance
      const centerX = newX + element.width / 2;
      const centerY = newY + element.height / 2;

      if (Math.abs(centerX - 50) < 2) {
        newX = 50 - element.width / 2;
        setShowSnapX(true);
      } else {
        setShowSnapX(false);
      }

      if (Math.abs(centerY - 50) < 2) {
        newY = 50 - element.height / 2;
        setShowSnapY(true);
      } else {
        setShowSnapY(false);
      }

      // Constrain inside container bounds (0 to 100 - element size)
      newX = Math.max(0, Math.min(100 - element.width, newX));
      newY = Math.max(0, Math.min(100 - element.height, newY));

      updateElement(slide.id, element.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setShowSnapX(false);
      setShowSnapY(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, element: SlideElement, handle: string) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startWidth = element.width;
    const startHeight = element.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (handle.includes('e')) {
        newWidth = Math.max(5, startWidth + (deltaX / rect.width) * 100);
      }
      if (handle.includes('s')) {
        newHeight = Math.max(5, startHeight + (deltaY / rect.height) * 100);
      }

      updateElement(slide.id, element.id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const aspectClass = aspectRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-video';

  const applyRichTextFormat = (e: React.MouseEvent, format: 'bold' | 'italic' | 'underline', elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    applyInlineFormat(format);
    
    // Force sync the state immediately after applying the format
    const el = document.getElementById(`text-edit-${elementId}`);
    if (el) {
      const cleanHTML = DOMPurify.sanitize(el.innerHTML, {
        ALLOWED_TAGS: ['strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'br', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
      });
      updateElementContent(slide.id, elementId, { text: cleanHTML });
    }
  };

  const applyListFormat = (e: React.MouseEvent, type: 'bullet' | 'ordered', elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    applyList(type);
    
    const el = document.getElementById(`text-edit-${elementId}`);
    if (el) {
      const cleanHTML = DOMPurify.sanitize(el.innerHTML, {
        ALLOWED_TAGS: ['strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'br', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
      });
      updateElementContent(slide.id, elementId, { text: cleanHTML });
    }
  };

  const applyLinkFormat = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = prompt('Digite a URL para o hiperlink:');
    if (url !== null) {
      applyLink(url);
      const el = document.getElementById(`text-edit-${elementId}`);
      if (el) {
        const cleanHTML = DOMPurify.sanitize(el.innerHTML, {
          ALLOWED_TAGS: ['strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'br', 'span'],
          ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
        });
        updateElementContent(slide.id, elementId, { text: cleanHTML });
      }
    }
  };

  const applyAlignmentFormat = (e: React.MouseEvent, align: 'left' | 'center' | 'right' | 'justify', element: SlideElement) => {
    e.preventDefault();
    e.stopPropagation();
    
    updateElementContent(slide.id, element.id, {
      style: {
        ...element.content.style,
        textAlign: align,
      }
    });
  };

  const zoomStyle: React.CSSProperties = zoomScale !== 1 ? {
    transform: `scale(${zoomScale})`,
    transformOrigin: 'top center',
  } : {};

  return (
    <div className="w-full overflow-auto flex items-center justify-center p-2 min-h-0" style={{ maxHeight: '100%' }}>
      <div
        ref={containerRef}
        onClick={(e) => {
          if (e.target === containerRef.current) {
            setSelectedElementId(null);
          }
        }}
        className={`w-full ${aspectClass} relative rounded-md overflow-hidden shadow-2xs border-2 border-dashed select-none cursor-crosshair transition-all duration-200 ${theme === 'dark' ? 'border-white/20 bg-slate-950' : 'border-slate-300 bg-slate-50'}`}
        style={{
          ...zoomStyle,
          backgroundColor: slide.background.type === 'color' ? slide.background.value : '#0f172a',
          backgroundImage:
            slide.background.type === 'image' 
              ? `url(${slide.background.value})` 
              : (slide.background.pattern ? slide.background.pattern : undefined),
          backgroundSize: slide.background.type === 'image' ? 'cover' : 'auto',
          backgroundPosition: 'center',
        }}
      >
      {/* Snap Guides */}
      {showSnapX && (
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#0a6ed1] shadow-[0_0_10px_#0a6ed1] z-50 pointer-events-none" />
      )}
      {showSnapY && (
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[#0a6ed1] shadow-[0_0_10px_#0a6ed1] z-50 pointer-events-none" />
      )}

      {/* Grid Lines Overlay for Canvas Editor */}
      <div className={`absolute inset-0 pointer-events-none bg-[size:5%_5%] ${theme === 'dark' ? 'bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]'}`} />

      {/* Render Slide Elements */}
      {slide.elements.map((element) => {
        const isSelected = selectedElementId === element.id;

        return (
          <div
            key={element.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElementId(element.id);
            }}
            onMouseDown={(e) => {
              if (!isSelected) {
                handleElementMouseDown(e, element);
              }
            }}
            className={`absolute transition-shadow ${
              isSelected ? 'ring-2 ring-[#0a6ed1] shadow-[0_0_20px_rgba(10,110,209,0.5)] z-40 cursor-default' : 'hover:ring-1 hover:ring-white/40 cursor-move'
            }`}
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              width: `${element.width}%`,
              height: `${element.height}%`,
              zIndex: element.zIndex || 1,
            }}
          >
            {/* Inner Content Display */}
            {element.type === 'text' && (
              <>
                {isSelected && (element.role === 'bodyText' || element.role === 'title' || !element.role) && (
                  <div 
                    role="toolbar"
                    aria-label="Formatação de Texto"
                    className="absolute -top-7 right-0 bg-[#0a6ed1] dark:bg-slate-900 border dark:border-white/10 text-white flex items-center gap-1.5 px-2 py-1 rounded shadow-lg z-50 animate-fadeIn"
                    onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    <button 
                      onMouseDown={(e) => applyRichTextFormat(e, 'bold', element.id)}
                      className="p-0.5 rounded transition-colors hover:bg-white/10"
                      title="Negrito (Ctrl+B)"
                      aria-label="Negrito"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onMouseDown={(e) => applyRichTextFormat(e, 'italic', element.id)}
                      className="p-0.5 rounded transition-colors hover:bg-white/10"
                      title="Itálico (Ctrl+I)"
                      aria-label="Itálico"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onMouseDown={(e) => applyRichTextFormat(e, 'underline', element.id)}
                      className="p-0.5 rounded transition-colors hover:bg-white/10"
                      title="Sublinhado (Ctrl+U)"
                      aria-label="Sublinhado"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-3.5 bg-white/20" />
                    <button 
                      onMouseDown={(e) => applyAlignmentFormat(e, 'left', element)}
                      className={`p-0.5 rounded transition-colors hover:bg-white/10 ${element.content.style?.textAlign === 'left' ? 'bg-white/20' : ''}`}
                      title="Alinhar à Esquerda"
                      aria-label="Alinhar à Esquerda"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onMouseDown={(e) => applyAlignmentFormat(e, 'center', element)}
                      className={`p-0.5 rounded transition-colors hover:bg-white/10 ${element.content.style?.textAlign === 'center' ? 'bg-white/20' : ''}`}
                      title="Centralizar"
                      aria-label="Centralizar"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onMouseDown={(e) => applyAlignmentFormat(e, 'right', element)}
                      className={`p-0.5 rounded transition-colors hover:bg-white/10 ${element.content.style?.textAlign === 'right' ? 'bg-white/20' : ''}`}
                      title="Alinhar à Direita"
                      aria-label="Alinhar à Direita"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-3.5 bg-white/20" />
                    <button 
                      onMouseDown={(e) => applyListFormat(e, 'bullet', element.id)}
                      className="p-0.5 rounded transition-colors hover:bg-white/10"
                      title="Lista com Marcadores"
                      aria-label="Lista com Marcadores"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onMouseDown={(e) => applyListFormat(e, 'ordered', element.id)}
                      className="p-0.5 rounded transition-colors hover:bg-white/10"
                      title="Lista Numerada"
                      aria-label="Lista Numerada"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-3.5 bg-white/20" />
                    <button 
                      onMouseDown={(e) => applyLinkFormat(e, element.id)}
                      className="p-0.5 rounded transition-colors hover:bg-white/10"
                      title="Inserir Link"
                      aria-label="Inserir Link"
                    >
                      <Link className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div
                  id={`text-edit-${element.id}`}
                  contentEditable={isSelected}
                  suppressContentEditableWarning
                  onClick={(e) => e.stopPropagation()}
                  onFocus={() => setSelectedElementId(element.id)}
                  onBlur={(e) => {
                    const cleanHTML = DOMPurify.sanitize(e.currentTarget.innerHTML, {
                      ALLOWED_TAGS: ['strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'br', 'span'],
                      ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
                    });
                    updateElementContent(slide.id, element.id, { text: cleanHTML });
                  }}
                  onKeyDown={(e) => {
                    if (e.ctrlKey || e.metaKey) {
                      const key = e.key.toLowerCase();
                      if (key === 'b' || key === 'i' || key === 'u') {
                        e.preventDefault();
                        const formatMap = { b: 'bold', i: 'italic', u: 'underline' } as const;
                        applyInlineFormat(formatMap[key as 'b' | 'i' | 'u']);
                        
                        // Sync immediate
                        const el = document.getElementById(`text-edit-${element.id}`);
                        if (el) {
                          const cleanHTML = DOMPurify.sanitize(el.innerHTML, {
                            ALLOWED_TAGS: ['strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'br', 'span'],
                            ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
                          });
                          updateElementContent(slide.id, element.id, { text: cleanHTML });
                        }
                      }
                    }
                  }}
                  className="w-full h-full outline-none p-1 box-border overflow-hidden whitespace-pre-wrap"
                  style={{
                    fontSize: element.content.style?.fontSize || '1.25rem',
                    fontWeight: element.content.style?.fontWeight || '600',
                    fontStyle: element.content.style?.fontStyle || 'normal',
                    textDecoration: element.content.style?.textDecoration || 'none',
                    color: element.content.style?.color || '#ffffff',
                    backgroundColor: element.content.style?.backgroundColor || 'transparent',
                    padding: element.content.style?.padding || '4px',
                    borderRadius: element.content.style?.borderRadius || '4px',
                    ...element.content.style,
                  }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(element.content.text || '') }}
                />
              </>
            )}

            {element.type === 'image' && (
              element.content.src ? (
                <img
                  src={element.content.src}
                  alt={element.content.alt || 'Element image'}
                  className="w-full h-full object-cover rounded-md pointer-events-none"
                />
              ) : (
                <div className="w-full h-full bg-slate-900/50 border border-dashed border-white/20 rounded-md flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-6 h-6 mb-2 opacity-50" />
                  <span className="text-[10px] font-bold">Aguardando Imagem</span>
                </div>
              )
            )}

            {element.type === 'video' && (
              <div className="w-full h-full bg-slate-900 rounded-md overflow-hidden flex items-center justify-center relative border border-dashed border-white/20">
                {element.content.src ? (
                  <>
                    <video
                      src={element.content.src}
                      className="w-full h-full object-cover pointer-events-none"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/30 pointer-events-none flex items-center justify-center">
                      <span className="text-white font-bold text-[10px] bg-black/50 px-2 py-1 rounded">Vídeo</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Play className="w-6 h-6 mb-2 opacity-50" />
                    <span className="text-[10px] font-bold">Aguardando Vídeo</span>
                  </div>
                )}
              </div>
            )}

            {element.type === 'audio' && (
              <div className="w-full h-full bg-slate-800 border border-white/20 rounded-md p-2 text-white text-xs flex flex-col items-center justify-center relative">
                <span className="text-[24px] mb-1">🎵</span>
                <span className="text-[9px] font-mono font-bold text-slate-300 w-full text-center whitespace-normal px-2">
                  {element.content.src ? 'Áudio Selecionado' : 'Aguardando Áudio'}
                </span>
                <div className="absolute inset-0 pointer-events-none" />
              </div>
            )}

            {element.type === 'question' && (
              <div className="w-full h-full bg-[#1c222b]/95 border border-[#0a6ed1]/50 rounded-md p-4 text-white text-xs flex flex-col justify-center pointer-events-none">
                <span className="text-[10px] text-[#0a6ed1] font-mono font-bold block mb-1">
                  [QUESTÃO / QUIZ INTERATIVO]
                </span>
                <p className="font-bold">{element.content.quizData?.question || 'Questão do Quiz'}</p>
              </div>
            )}

            {element.type === 'simulation' && (
              <div className="w-full h-full bg-[#1c222b] border border-[#0a6ed1]/50 rounded-md p-3 text-white text-xs flex items-center justify-center pointer-events-none">
                <Sparkles className="w-5 h-5 text-[#0a6ed1] mr-2" />
                <span className="font-mono text-[#0a6ed1] font-bold">Simulador Interativo: DRE / Sandbox</span>
              </div>
            )}

            {/* Resize Handles for Selected Element */}
            {isSelected && (
              <>
                {/* Border Handles (for dragging selected element by its borders) */}
                <div 
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  className="absolute -top-1 left-0 right-0 h-2 bg-transparent cursor-move z-30" 
                  title="Arraste pelas bordas para mover"
                />
                <div 
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  className="absolute -bottom-1 left-0 right-0 h-2 bg-transparent cursor-move z-30" 
                  title="Arraste pelas bordas para mover"
                />
                <div 
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  className="absolute top-0 bottom-0 -left-1 w-2 bg-transparent cursor-move z-30" 
                  title="Arraste pelas bordas para mover"
                />
                <div 
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  className="absolute top-0 bottom-0 -right-1 w-2 bg-transparent cursor-move z-30" 
                  title="Arraste pelas bordas para mover"
                />

                {/* Drag badge handle */}
                <div 
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  className="absolute -top-6 left-0 bg-[#0a6ed1] text-white font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-t flex items-center gap-1 shadow-2xs cursor-move z-30"
                >
                  <Move className="w-2.5 h-2.5 pointer-events-none" />
                  <span className="pointer-events-none">
                    X:{Math.round(element.x)}% Y:{Math.round(element.y)}%
                  </span>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeElement(slide.id, element.id);
                    }}
                    className="ml-2 p-0.5 bg-rose-500 hover:bg-rose-600 rounded text-white cursor-pointer transition-colors"
                    title="Excluir Componente"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Bottom-Right Resize Handle */}
                <div
                  onMouseDown={(e) => handleResizeMouseDown(e, element, 'se')}
                  className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-[#0a6ed1] border-2 border-slate-950 rounded-md cursor-se-resize shadow-2xs hover:scale-125 transition-transform"
                />
              </>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
};
