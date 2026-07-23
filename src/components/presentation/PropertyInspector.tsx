import React from 'react';
import { Slide, SlideElement, ElementType, ElementAnimation } from '../../types/presentation';
import { usePresentationStore } from '../../store/usePresentationStore';
import { Sliders, Type, Image as ImageIcon, HelpCircle, Sparkles, Trash2, Plus, Zap, Layers, Palette } from 'lucide-react';

interface PropertyInspectorProps {
  slide: Slide;
  selectedElementId?: string | null;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  slide,
  selectedElementId: propSelectedElementId,
}) => {
  const storeSelectedElementId = usePresentationStore((state) => state.selectedElementId);
  const selectedElementId = propSelectedElementId !== undefined ? propSelectedElementId : storeSelectedElementId;

  const {
    updateElement,
    updateElementContent,
    updateElementAnimation,
    removeElement,
    addElement,
    updateSlideBackground,
  } = usePresentationStore();

  const selectedElement = slide.elements.find((el) => el.id === selectedElementId);

  // Helper to add new elements
  const handleAddElement = (type: ElementType) => {
    const newId = `elem-${Date.now()}`;
    let newElem: SlideElement;

    if (type === 'text') {
      newElem = {
        id: newId,
        type: 'text',
        x: 10,
        y: 40,
        width: 80,
        height: 15,
        zIndex: 10,
        content: {
          text: 'Novo Título do Slide',
          style: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#0a6ed1',
          },
        },
        animation: {
          effect: 'fadeIn',
          duration: 0.8,
          delay: 0.1,
          order: slide.elements.length + 1,
        },
      };
    } else if (type === 'image') {
      newElem = {
        id: newId,
        type: 'image',
        x: 20,
        y: 20,
        width: 60,
        height: 50,
        zIndex: 5,
        content: {
          src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
          style: {
            borderRadius: '12px',
            objectFit: 'cover',
          },
        },
        animation: {
          effect: 'zoomIn',
          duration: 0.8,
          delay: 0.2,
          order: slide.elements.length + 1,
        },
      };
    } else if (type === 'quiz') {
      newElem = {
        id: newId,
        type: 'quiz',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
        zIndex: 10,
        content: {
          quizData: {
            question: 'Qual a margem de contribuição ideal?',
            options: ['10%', '20%', '30% ou mais', 'Nenhuma das anteriores'],
            correctIndex: 2,
            explanation: 'A margem ideal varia conforme o perfil do restaurante.',
          },
        },
        animation: {
          effect: 'fadeIn',
          duration: 0.8,
          delay: 0.1,
          order: slide.elements.length + 1,
        },
      };
    } else {
      newElem = {
        id: newId,
        type: 'custom-widget',
        x: 15,
        y: 25,
        width: 70,
        height: 50,
        zIndex: 10,
        content: {
          widgetComponent: 'DRESimulatorWidget',
        },
        animation: {
          effect: 'slideRight',
          duration: 0.8,
          delay: 0.2,
          order: slide.elements.length + 1,
        },
      };
    }

    addElement(slide.id, newElem);
  };

  return (
    <div className="w-full lg:w-80 bg-[#1c222b]/95 border border-white/10 rounded-2xl p-4 space-y-5 text-xs overflow-y-auto max-h-[720px] scrollbar-none">
      {/* Add New Elements Header */}
      <div>
        <span className="text-[10px] font-mono font-bold text-[#0a6ed1] uppercase tracking-wider block mb-2">
          ➕ Adicionar Elementos (SAP Fiori)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAddElement('text')}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-white/10 rounded-xl text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-[#0a6ed1]" />
            <span>Texto</span>
          </button>
          <button
            onClick={() => handleAddElement('image')}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-white/10 rounded-xl text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#05828e]" />
            <span>Imagem</span>
          </button>
          <button
            onClick={() => handleAddElement('quiz')}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-white/10 rounded-xl text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#107e3e]" />
            <span>Quiz</span>
          </button>
          <button
            onClick={() => handleAddElement('custom-widget')}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-white/10 rounded-xl text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e66000]" />
            <span>Widget</span>
          </button>
        </div>
      </div>

      {/* Slide Background Setting */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
          🎨 Fundo do Slide
        </span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={slide.background.value.startsWith('#') ? slide.background.value : '#0f172a'}
            onChange={(e) =>
              updateSlideBackground(slide.id, { type: 'color', value: e.target.value })
            }
            className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
          />
          <span className="font-mono text-slate-300">{slide.background.value}</span>
        </div>
      </div>

      {/* Selected Element Property Editor */}
      {selectedElement ? (
        <div className="pt-3 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#0a6ed1] uppercase tracking-wider">
              ⚙️ Elemento: {selectedElement.type}
            </span>
            <button
              onClick={() => removeElement(slide.id, selectedElement.id)}
              className="p-1 bg-[#bb0000]/20 hover:bg-[#bb0000]/40 text-rose-300 rounded-lg transition-all cursor-pointer"
              title="Excluir Elemento"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Position & Size (%) */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-bold block">Posição e Dimensões (%)</span>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div>
                <label className="text-[9px] text-slate-400 block">X (%)</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.x)}
                  onChange={(e) =>
                    updateElement(slide.id, selectedElement.id, { x: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 block">Y (%)</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.y)}
                  onChange={(e) =>
                    updateElement(slide.id, selectedElement.id, { y: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 block">Largura (%)</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.width)}
                  onChange={(e) =>
                    updateElement(slide.id, selectedElement.id, { width: parseFloat(e.target.value) || 10 })
                  }
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 block">Altura (%)</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.height)}
                  onChange={(e) =>
                    updateElement(slide.id, selectedElement.id, { height: parseFloat(e.target.value) || 10 })
                  }
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-1.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Content Inputs according to type */}
          {selectedElement.type === 'text' && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold block">Conteúdo de Texto</span>
              <textarea
                value={selectedElement.content.text || ''}
                onChange={(e) =>
                  updateElementContent(slide.id, selectedElement.id, { text: e.target.value })
                }
                rows={3}
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white outline-none focus:ring-1 focus:ring-[#2fd9f4]"
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Cor do Texto:</span>
                <input
                  type="color"
                  value={selectedElement.content.style?.color || '#ffffff'}
                  onChange={(e) =>
                    updateElementContent(slide.id, selectedElement.id, {
                      style: { ...selectedElement.content.style, color: e.target.value },
                    })
                  }
                  className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                />
              </div>
            </div>
          )}

          {selectedElement.type === 'image' && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold block">URL da Imagem</span>
              <input
                type="text"
                value={selectedElement.content.src || ''}
                onChange={(e) =>
                  updateElementContent(slide.id, selectedElement.id, { src: e.target.value })
                }
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-1.5 text-white"
              />
            </div>
          )}

          {selectedElement.type === 'quiz' && selectedElement.content.quizData && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold block">Pergunta do Quiz</span>
              <input
                type="text"
                value={selectedElement.content.quizData.question}
                onChange={(e) =>
                  updateElementContent(slide.id, selectedElement.id, {
                    quizData: { ...selectedElement.content.quizData!, question: e.target.value },
                  })
                }
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-1.5 text-white"
              />
            </div>
          )}

          {/* GSAP Animation Settings */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#8083ff] uppercase tracking-wider block">
              ⚡ Animação GSAP
            </span>
            <div className="space-y-2 font-mono">
              <div>
                <label className="text-[9px] text-slate-400 block">Efeito de Entrada</label>
                <select
                  value={selectedElement.animation?.effect || 'fadeIn'}
                  onChange={(e) =>
                    updateElementAnimation(slide.id, selectedElement.id, {
                      effect: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-1.5 text-white cursor-pointer"
                >
                  <option value="fadeIn">Fade In</option>
                  <option value="slideLeft">Slide da Esquerda</option>
                  <option value="slideRight">Slide da Direita</option>
                  <option value="zoomIn">Zoom In</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-400 block">Duração (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedElement.animation?.duration ?? 0.8}
                    onChange={(e) =>
                      updateElementAnimation(slide.id, selectedElement.id, {
                        duration: parseFloat(e.target.value) || 0.5,
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block">Atraso / Delay (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedElement.animation?.delay ?? 0}
                    onChange={(e) =>
                      updateElementAnimation(slide.id, selectedElement.id, {
                        delay: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-1.5 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-3 border-t border-white/10 text-center py-6 text-slate-500">
          <p className="text-[11px]">Clique em um elemento no slide para editar suas propriedades.</p>
        </div>
      )}
    </div>
  );
};
