import React from 'react';
import { SlideElement } from '../../types/presentation';

interface LayoutThumbnailProps {
  elements: SlideElement[];
  theme?: 'dark' | 'light';
  className?: string;
}

export const LayoutThumbnail: React.FC<LayoutThumbnailProps> = ({
  elements,
  theme = 'dark',
  className = '',
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`w-full aspect-[16/9] rounded-md relative overflow-hidden border transition-all ${
        isDark ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200'
      } ${className}`}
    >
      {elements.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-500 uppercase tracking-wider">
          Em Branco
        </div>
      ) : (
        elements.map((el, i) => {
          const isTitle =
            el.role === 'title' ||
            (el.type === 'text' &&
              (el.content.style?.fontSize === '2rem' ||
                el.content.style?.fontWeight === '800' ||
                el.content.style?.fontWeight === '700'));

          return (
            <div
              key={el.id || i}
              className="absolute rounded flex flex-col justify-center items-center overflow-hidden p-0.5"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.width}%`,
                height: `${el.height}%`,
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(0, 0, 0, 0.04)',
                border: `1px dashed ${
                  isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                }`,
              }}
            >
              {el.type === 'text' && isTitle && (
                <div className="w-full h-full flex flex-col justify-center items-center px-1">
                  <div
                    className={`text-[7px] font-black uppercase tracking-tight truncate ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    T TÍTULO
                  </div>
                  <div
                    className={`w-3/4 h-[1.5px] rounded mt-0.5 ${
                      isDark ? 'bg-slate-500' : 'bg-slate-400'
                    }`}
                  />
                </div>
              )}

              {el.type === 'text' && !isTitle && (
                <div className="w-full h-full flex flex-col justify-center gap-0.5 p-1 opacity-70">
                  <div
                    className={`w-full h-[1.5px] rounded ${
                      isDark ? 'bg-slate-400' : 'bg-slate-500'
                    }`}
                  />
                  <div
                    className={`w-5/6 h-[1.5px] rounded ${
                      isDark ? 'bg-slate-400' : 'bg-slate-500'
                    }`}
                  />
                  <div
                    className={`w-4/6 h-[1.5px] rounded ${
                      isDark ? 'bg-slate-400' : 'bg-slate-500'
                    }`}
                  />
                  <div
                    className={`w-full h-[1.5px] rounded ${
                      isDark ? 'bg-slate-400' : 'bg-slate-500'
                    }`}
                  />
                </div>
              )}

              {el.type === 'image' && (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-0.5">
                  <svg
                    className="w-3.5 h-3.5 opacity-70 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {el.type === 'video' && (
                <div className="w-full h-full flex flex-col items-center justify-center text-purple-400">
                  <svg
                    className="w-3.5 h-3.5 opacity-80"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}

              {el.type === 'question' && (
                <div className="w-full h-full flex flex-col justify-center items-center gap-0.5 p-0.5 text-amber-500">
                  <span className="text-[7px] font-extrabold">Q?</span>
                  <div className="w-full flex flex-col gap-0.5 px-1">
                    <div
                      className={`w-full h-[1px] ${
                        isDark ? 'bg-slate-500' : 'bg-slate-400'
                      }`}
                    />
                    <div
                      className={`w-4/5 h-[1px] ${
                        isDark ? 'bg-slate-500' : 'bg-slate-400'
                      }`}
                    />
                  </div>
                </div>
              )}

              {el.type === 'simulation' && (
                <div className="w-full h-full flex items-center justify-center text-emerald-500 text-[7px] font-bold">
                  ⚙️ DRE
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
