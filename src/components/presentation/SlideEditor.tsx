import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slide, SlideElement } from '../../types/presentation';
import { usePresentationStore } from '../../store/usePresentationStore';
import { HelpCircle, Sparkles, Move, Maximize2, Type, Image as ImageIcon } from 'lucide-react';

interface SlideEditorProps {
  slide: Slide;
  aspectRatio?: '16:9' | '4:3';
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  slide,
  aspectRatio = '16:9',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedElementId, setSelectedElementId, updateElement, updateElementContent } = usePresentationStore();

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

  return (
    <div
      ref={containerRef}
      onClick={(e) => {
        if (e.target === containerRef.current) {
          setSelectedElementId(null);
        }
      }}
      className={`w-full ${aspectClass} relative rounded-2xl overflow-hidden shadow-2xl border-2 border-dashed border-white/20 select-none bg-slate-950 cursor-crosshair`}
      style={{
        backgroundColor: slide.background.type === 'color' ? slide.background.value : '#0f172a',
        backgroundImage:
          slide.background.type === 'image' ? `url(${slide.background.value})` : undefined,
        backgroundSize: 'cover',
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
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:5%_5%] pointer-events-none" />

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
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            className={`absolute transition-shadow ${
              isSelected ? 'ring-2 ring-[#0a6ed1] shadow-[0_0_20px_rgba(10,110,209,0.5)] z-40' : 'hover:ring-1 hover:ring-white/40'
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
              <div
                contentEditable={isSelected}
                suppressContentEditableWarning
                onClick={(e) => e.stopPropagation()}
                onFocus={() => setSelectedElementId(element.id)}
                onBlur={(e) =>
                  updateElementContent(slide.id, element.id, { text: e.currentTarget.innerText })
                }
                className="w-full h-full outline-none p-1 box-border overflow-hidden"
                style={{
                  fontSize: element.content.style?.fontSize || '1.25rem',
                  fontWeight: element.content.style?.fontWeight || '600',
                  color: element.content.style?.color || '#ffffff',
                  backgroundColor: element.content.style?.backgroundColor || 'transparent',
                  padding: element.content.style?.padding || '4px',
                  borderRadius: element.content.style?.borderRadius || '4px',
                  ...element.content.style,
                }}
              >
                {element.content.text}
              </div>
            )}

            {element.type === 'image' && (
              <img
                src={element.content.src || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'}
                alt="Element image"
                className="w-full h-full object-cover rounded-lg pointer-events-none"
              />
            )}

            {element.type === 'quiz' && (
              <div className="w-full h-full bg-[#1c222b]/95 border border-[#0a6ed1]/50 rounded-xl p-4 text-white text-xs flex flex-col justify-center pointer-events-none">
                <span className="text-[10px] text-[#0a6ed1] font-mono font-bold block mb-1">
                  [QUIZ INTERATIVO]
                </span>
                <p className="font-bold">{element.content.quizData?.question || 'Questão do Quiz'}</p>
              </div>
            )}

            {element.type === 'custom-widget' && (
              <div className="w-full h-full bg-[#1c222b] border border-[#0a6ed1]/50 rounded-xl p-3 text-white text-xs flex items-center justify-center pointer-events-none">
                <Sparkles className="w-5 h-5 text-[#0a6ed1] mr-2" />
                <span className="font-mono text-[#0a6ed1] font-bold">Widget Customizado SAP</span>
              </div>
            )}

            {/* Resize Handles for Selected Element */}
            {isSelected && (
              <>
                {/* Drag badge handle */}
                <div className="absolute -top-6 left-0 bg-[#0a6ed1] text-white font-mono text-[9px] font-extrabold px-2 py-0.5 rounded-t flex items-center gap-1 shadow-md">
                  <Move className="w-2.5 h-2.5" />
                  <span>
                    X:{Math.round(element.x)}% Y:{Math.round(element.y)}%
                  </span>
                </div>

                {/* Bottom-Right Resize Handle */}
                <div
                  onMouseDown={(e) => handleResizeMouseDown(e, element, 'se')}
                  className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-[#0a6ed1] border-2 border-slate-950 rounded-full cursor-se-resize shadow-md hover:scale-125 transition-transform"
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
