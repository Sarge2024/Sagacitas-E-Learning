import React, { useRef } from 'react';
import { Slide, SlideElement, ElementType, ElementAnimation } from '../../types/presentation';
import { usePresentationStore } from '../../store/usePresentationStore';
import { Sliders, Type, Image as ImageIcon, HelpCircle, Sparkles, Trash2, Plus, Zap, Layers, Palette, Video, Music } from 'lucide-react';

interface PropertyInspectorProps {
  slide: Slide;
  selectedElementId?: string | null;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  slide,
  selectedElementId: propSelectedElementId,
}) => {
  const storeSelectedElementId = usePresentationStore((state) => state.selectedElementId);
  const theme = usePresentationStore((state) => state.theme);
  const selectedElementId = propSelectedElementId !== undefined ? propSelectedElementId : storeSelectedElementId;
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const {
    updateElement,
    updateElementContent,
    updateElementAnimation,
    removeElement,
    addElement,
    updateSlideBackground,
  } = usePresentationStore();

  const selectedElement = slide.elements.find((el) => el.id === selectedElementId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      alert('O arquivo é muito grande! O limite é de 30MB para não comprometer o banco de dados.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const newId = `elem-${Date.now()}`;
      const newElem: SlideElement = {
        id: newId,
        type: type,
        x: type === 'video' ? 15 : 10,
        y: type === 'video' ? 20 : 80,
        width: type === 'video' ? 70 : 15,
        height: type === 'video' ? 60 : 10,
        zIndex: 5,
        content: {
          src: base64Data,
          mediaSettings: {
            autoPlay: false,
            loop: false,
            controls: true,
          }
        },
        animation: {
          effect: 'fadeIn',
          duration: 0.8,
          delay: 0.2,
          order: slide.elements.length + 1,
        },
      };
      addElement(slide.id, newElem);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

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
    } else if (type === 'question') {
      newElem = {
        id: newId,
        type: 'question',
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
        type: 'simulation',
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
    <div className={`w-full lg:w-80 rounded-md p-4 space-y-5 text-xs overflow-y-auto max-h-[720px] scrollbar-none ${theme === 'dark' ? 'bg-[#1c222b]/95 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
      <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
      <input type="file" ref={audioInputRef} accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} />

      {/* Add New Elements Header */}
      <div>
        <span className="text-[10px] font-mono font-bold text-[#0a6ed1] uppercase tracking-wider block mb-2">
          ➕ Adicionar Elementos
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAddElement('text')}
            className={`p-2 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 border-white/10 text-white' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            <Type className="w-3.5 h-3.5 text-[#0a6ed1]" />
            <span>Texto</span>
          </button>
          <button
            onClick={() => handleAddElement('image')}
            className={`p-2 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 border-white/10 text-white' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#05828e]" />
            <span>Imagem</span>
          </button>
          <button
            onClick={() => handleAddElement('question')}
            className={`p-2 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 border-white/10 text-white' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#107e3e]" />
            <span>Questão</span>
          </button>
          <button
            onClick={() => handleAddElement('simulation')}
            className={`p-2 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 border-white/10 text-white' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e66000]" />
            <span>Simulação</span>
          </button>
          <button
            onClick={() => videoInputRef.current?.click()}
            className={`p-2 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 border-white/10 text-white' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            <Video className="w-3.5 h-3.5 text-purple-500" />
            <span>Vídeo</span>
          </button>
          <button
            onClick={() => audioInputRef.current?.click()}
            className={`p-2 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 border-white/10 text-white' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            <Music className="w-3.5 h-3.5 text-pink-500" />
            <span>Áudio</span>
          </button>
        </div>
      </div>

      {/* Slide Background Setting */}
      <div className={`pt-3 border-t space-y-2 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
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
          <span className={`font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{slide.background.value}</span>
        </div>
      </div>

      {/* Selected Element Property Editor */}
      {selectedElement ? (
        <div className={`pt-3 border-t space-y-4 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#0a6ed1] uppercase tracking-wider">
              ⚙️ Elemento: {selectedElement.type}
            </span>
            <button
              onClick={() => removeElement(slide.id, selectedElement.id)}
              className="p-1 bg-[#bb0000]/20 hover:bg-[#bb0000]/40 text-rose-500 rounded-md transition-all cursor-pointer"
              title="Excluir Elemento"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Position & Size (%) */}
          <div className="space-y-2">
            <span className={`text-[10px] font-bold block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Posição e Dimensões (%)</span>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div>
                <label className={`text-[9px] block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>X (%)</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.x)}
                  onChange={(e) =>
                    updateElement(slide.id, selectedElement.id, { x: parseFloat(e.target.value) || 0 })
                  }
                  className={`w-full border rounded-md p-1.5 ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
              </div>
              <div>
                <label className={`text-[9px] block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Y (%)</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.y)}
                  onChange={(e) =>
                    updateElement(slide.id, selectedElement.id, { y: parseFloat(e.target.value) || 0 })
                  }
                  className={`w-full border rounded-md p-1.5 ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
              </div>
              <div>
                <label className={`text-[9px] block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Largura (%)</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.width)}
                  onChange={(e) =>
                    updateElement(slide.id, selectedElement.id, { width: parseFloat(e.target.value) || 10 })
                  }
                  className={`w-full border rounded-md p-1.5 ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
              </div>
              <div>
                <label className={`text-[9px] block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Altura (%)</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.height)}
                  onChange={(e) =>
                    updateElement(slide.id, selectedElement.id, { height: parseFloat(e.target.value) || 10 })
                  }
                  className={`w-full border rounded-md p-1.5 ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
              </div>
            </div>
          </div>

          {/* Layer Ordering (Z-Index) */}
          <div className="space-y-2">
            <span className={`text-[10px] font-bold block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Ordem de Exibição (Z-Index: {selectedElement.zIndex || 1})</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateElement(slide.id, selectedElement.id, { zIndex: Math.max(1, (selectedElement.zIndex || 1) - 1) })}
                className={`flex-1 p-1.5 rounded-md text-[10px] font-bold transition-all border ${theme === 'dark' ? 'bg-slate-950 border-white/10 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                title="Descer um nível"
              >
                Descer (-1)
              </button>
              <button
                onClick={() => updateElement(slide.id, selectedElement.id, { zIndex: (selectedElement.zIndex || 1) + 1 })}
                className={`flex-1 p-1.5 rounded-md text-[10px] font-bold transition-all border ${theme === 'dark' ? 'bg-slate-950 border-white/10 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                title="Subir um nível"
              >
                Subir (+1)
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateElement(slide.id, selectedElement.id, { zIndex: 1 })}
                className={`flex-1 p-1.5 rounded-md text-[10px] font-bold transition-all border ${theme === 'dark' ? 'bg-slate-950 border-white/10 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                title="Enviar totalmente para o fundo"
              >
                Ao Fundo
              </button>
              <button
                onClick={() => {
                  const maxZ = Math.max(10, ...slide.elements.map(e => e.zIndex || 1));
                  updateElement(slide.id, selectedElement.id, { zIndex: maxZ + 1 });
                }}
                className={`flex-1 p-1.5 rounded-md text-[10px] font-bold transition-all border ${theme === 'dark' ? 'bg-slate-950 border-white/10 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                title="Trazer totalmente para a frente"
              >
                À Frente
              </button>
            </div>
          </div>

          {/* Content Inputs according to type */}
          {selectedElement.type === 'text' && (
            <div className="space-y-2">
              <span className={`text-[10px] font-bold block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Conteúdo de Texto</span>
              <textarea
                value={selectedElement.content.text || ''}
                onChange={(e) =>
                  updateElementContent(slide.id, selectedElement.id, { text: e.target.value })
                }
                rows={3}
                className={`w-full border rounded-md p-2 outline-none focus:ring-1 focus:ring-[#2fd9f4] ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
              />
              <div className="flex items-center gap-2">
                <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Cor do Texto:</span>
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
              <span className={`text-[10px] font-bold block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>URL da Imagem</span>
              <input
                type="text"
                value={selectedElement.content.src || ''}
                onChange={(e) =>
                  updateElementContent(slide.id, selectedElement.id, { src: e.target.value })
                }
                className={`w-full border rounded-md p-1.5 ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
              />
            </div>
          )}

          {selectedElement.type === 'question' && selectedElement.content.quizData && (
            <div className="space-y-2">
              <span className={`text-[10px] font-bold block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Pergunta do Quiz</span>
              <input
                type="text"
                value={selectedElement.content.quizData.question}
                onChange={(e) =>
                  updateElementContent(slide.id, selectedElement.id, {
                    quizData: { ...selectedElement.content.quizData!, question: e.target.value },
                  })
                }
                className={`w-full border rounded-md p-1.5 ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
              />
            </div>
          )}

          {(selectedElement.type === 'video' || selectedElement.type === 'audio') && (
            <div className={`pt-2 border-t space-y-2 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
               <span className={`text-[10px] font-bold block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Configurações de Mídia</span>
               
               <div className="flex items-center justify-between">
                 <span className={`text-[9px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Mostrar Controles</span>
                 <input 
                   type="checkbox" 
                   checked={selectedElement.content.mediaSettings?.controls ?? true}
                   onChange={(e) => updateElementContent(slide.id, selectedElement.id, {
                     mediaSettings: { ...selectedElement.content.mediaSettings, controls: e.target.checked }
                   })}
                 />
               </div>
               <div className="flex items-center justify-between">
                 <span className={`text-[9px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Tocar Automaticamente (AutoPlay)</span>
                 <input 
                   type="checkbox" 
                   checked={selectedElement.content.mediaSettings?.autoPlay ?? false}
                   onChange={(e) => updateElementContent(slide.id, selectedElement.id, {
                     mediaSettings: { ...selectedElement.content.mediaSettings, autoPlay: e.target.checked }
                   })}
                 />
               </div>
               <div className="flex items-center justify-between">
                 <span className={`text-[9px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Repetir (Loop)</span>
                 <input 
                   type="checkbox" 
                   checked={selectedElement.content.mediaSettings?.loop ?? false}
                   onChange={(e) => updateElementContent(slide.id, selectedElement.id, {
                     mediaSettings: { ...selectedElement.content.mediaSettings, loop: e.target.checked }
                   })}
                 />
               </div>
            </div>
          )}

          {/* GSAP Animation Settings */}
          <div className={`pt-2 border-t space-y-2 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
            <span className="text-[10px] font-mono font-bold text-[#8083ff] uppercase tracking-wider block">
              ⚡ Animação GSAP
            </span>
            <div className="space-y-2 font-mono">
              <div>
                <label className={`text-[9px] block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Efeito de Entrada</label>
                <select
                  value={selectedElement.animation?.effect || 'fadeIn'}
                  onChange={(e) =>
                    updateElementAnimation(slide.id, selectedElement.id, {
                      effect: e.target.value as any,
                    })
                  }
                  className={`w-full border rounded-md p-1.5 cursor-pointer ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                >
                  <option value="fadeIn">Fade In</option>
                  <option value="slideLeft">Slide da Esquerda</option>
                  <option value="slideRight">Slide da Direita</option>
                  <option value="zoomIn">Zoom In</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`text-[9px] block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Duração (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedElement.animation?.duration ?? 0.8}
                    onChange={(e) =>
                      updateElementAnimation(slide.id, selectedElement.id, {
                        duration: parseFloat(e.target.value) || 0.5,
                      })
                    }
                    className={`w-full border rounded-md p-1.5 ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  />
                </div>
                <div>
                  <label className={`text-[9px] block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Atraso / Delay (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedElement.animation?.delay ?? 0}
                    onChange={(e) =>
                      updateElementAnimation(slide.id, selectedElement.id, {
                        delay: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full border rounded-md p-1.5 ${theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`pt-3 border-t text-center py-6 ${theme === 'dark' ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <p className="text-[11px]">Clique em um elemento no slide para editar suas propriedades.</p>
        </div>
      )}
    </div>
  );
};
