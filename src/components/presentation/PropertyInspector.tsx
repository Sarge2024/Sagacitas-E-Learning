import React, { useRef, useState, useEffect } from 'react';
import { Slide, SlideElement, ElementType, ElementAnimation } from '../../types/presentation';
import { usePresentationStore } from '../../store/usePresentationStore';
import { Sliders, Type, Image as ImageIcon, HelpCircle, Sparkles, Trash2, Plus, Zap, Layers, Palette, Video, Music, Grid, Copy, Paintbrush } from 'lucide-react';
import { LayoutThumbnail } from './LayoutThumbnail';

// Helpers for WCAG Contrast Calculation
function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getRelativeLuminance(color: { r: number; g: number; b: number }) {
  const a = [color.r, color.g, color.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(color1Hex: string, color2Hex: string) {
  const c1 = hexToRgb(color1Hex);
  const c2 = hexToRgb(color2Hex);
  if (!c1 || !c2) return 1;
  const l1 = getRelativeLuminance(c1);
  const l2 = getRelativeLuminance(c2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

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
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [showImagePopup, setShowImagePopup] = useState(false);

  const [repBg, setRepBg] = useState(true);
  const [repLayout, setRepLayout] = useState(true);
  const [repStyle, setRepStyle] = useState(true);
  const [repAnim, setRepAnim] = useState(true);

  const [showLayoutPopup, setShowLayoutPopup] = useState(false);
  const [showSavePresetPopup, setShowSavePresetPopup] = useState(false);
  const [showReplicateLayoutPopup, setShowReplicateLayoutPopup] = useState(false);
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [layoutSaveName, setLayoutSaveName] = useState('');
  const [selectedReplicateLayoutName, setSelectedReplicateLayoutName] = useState('');

  const {
    updateElement,
    updateElementContent,
    updateElementAnimation,
    removeElement,
    addElement,
    updateSlideBackground,
    replicateBackgroundToAll,
    setReplicateBackgroundToAll,
    replicateSlideBackgroundToAll,
    defaultTitleColor,
    defaultBodyColor,
    defaultSlideElementsTemplate,
    layoutPresets,
    applyLayoutToSlide,
    updateLayoutPreset,
    createLayoutPreset,
    colorPalettes,
    applyColorPaletteToPresentation,
    copiedElementStyle,
    copyElementStyle,
    pasteElementStyle,
  } = usePresentationStore();

  const selectedElement = slide.elements.find((el) => el.id === selectedElementId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'audio' | 'image') => {
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
      
      let newElem: SlideElement;
      
      if (type === 'image') {
        let baseTemplate = defaultSlideElementsTemplate?.find(el => el.type === 'image');
        newElem = {
          id: newId,
          type: 'image',
          x: baseTemplate ? baseTemplate.x : 20,
          y: baseTemplate ? baseTemplate.y : 20,
          width: baseTemplate ? baseTemplate.width : 60,
          height: baseTemplate ? baseTemplate.height : 50,
          zIndex: baseTemplate ? baseTemplate.zIndex : 5,
          role: 'image',
          content: {
            src: base64Data,
            style: baseTemplate?.content?.style ? { ...baseTemplate.content.style } : {
              borderRadius: '12px',
              objectFit: 'cover',
            },
          },
          animation: baseTemplate?.animation ? { ...baseTemplate.animation, order: slide.elements.length + 1 } : {
            effect: 'zoomIn',
            duration: 0.8,
            delay: 0.2,
            order: slide.elements.length + 1,
          },
        };
      } else {
        newElem = {
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
      }
      addElement(slide.id, newElem);
      setShowImagePopup(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleReplicateClick = () => {
    if (repLayout) {
      setSelectedReplicateLayoutName(slide.layoutName || (layoutPresets.length > 0 ? layoutPresets[0].name : ''));
      setShowReplicateLayoutPopup(true);
    } else {
      replicateSlideBackgroundToAll(slide.id, {
        background: repBg,
        layout: false,
        style: repStyle,
        animation: repAnim,
      });
    }
  };

  const confirmReplicateLayout = () => {
    if (selectedReplicateLayoutName) {
      updateLayoutPreset(selectedReplicateLayoutName, slide.elements);
    }
    replicateSlideBackgroundToAll(slide.id, {
      background: repBg,
      layout: true,
      style: repStyle,
      animation: repAnim,
    });
    setShowReplicateLayoutPopup(false);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
        for (const imageType of imageTypes) {
          const blob = await clipboardItem.getType(imageType);
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Data = event.target?.result as string;
            const newId = `elem-${Date.now()}`;
            const newElem: SlideElement = {
              id: newId,
              type: 'image',
              x: 20,
              y: 20,
              width: 60,
              height: 50,
              zIndex: 5,
              role: 'image',
              content: {
                src: base64Data,
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
            addElement(slide.id, newElem);
            setShowImagePopup(false);
          };
          reader.readAsDataURL(blob);
          return; // Stop after first image found
        }
      }
      alert('Nenhuma imagem encontrada na área de transferência.');
    } catch (err) {
      console.error(err);
      alert('Erro ao ler a área de transferência. Certifique-se de ter concedido permissão e de que há uma imagem copiada.');
    }
  };

  // Helper to add new elements
  const handleAddElement = (type: ElementType | 'title' | 'bodyText') => {
    const newId = `elem-${Date.now()}`;
    let newElem: SlideElement;

    if (type === 'text' || type === 'title' || type === 'bodyText') {
      const isTitle = type === 'title' || type === 'text';
      const roleKey = isTitle ? 'title' : 'bodyText';
      
      let baseTemplate: SlideElement | undefined;
      if (defaultSlideElementsTemplate) {
        const typeKey = isTitle ? 'title' : 'body';
        const isTitleElem = (el: any) => {
          return el.content.style?.fontWeight === '800' || 
                 el.content.style?.fontWeight === '700' || 
                 parseFloat(el.content.style?.fontSize || '0') >= 1.5;
        };
        baseTemplate = defaultSlideElementsTemplate
          .filter(el => el.type === 'text' && (el.role === typeKey || (!el.role && (isTitleElem(el) ? 'title' : 'body') === typeKey)))
          .sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
      }

      newElem = {
        id: newId,
        type: 'text',
        x: baseTemplate ? baseTemplate.x : 10,
        y: baseTemplate ? baseTemplate.y : (isTitle ? 20 : 45),
        width: baseTemplate ? baseTemplate.width : 80,
        height: baseTemplate ? baseTemplate.height : (isTitle ? 15 : 30),
        zIndex: baseTemplate ? baseTemplate.zIndex : 10,
        role: roleKey,
        content: {
          text: isTitle ? 'Novo Título do Slide' : 'Novo parágrafo de texto principal do slide...',
          style: baseTemplate?.content?.style ? { ...baseTemplate.content.style } : {
            fontSize: isTitle ? '2rem' : '1.1rem',
            fontWeight: isTitle ? '800' : '400',
            color: isTitle 
              ? (defaultTitleColor || '#0a6ed1') 
              : (defaultBodyColor || (theme === 'dark' ? '#cbd5e1' : '#1e293b')),
          },
        },
        animation: baseTemplate?.animation ? { ...baseTemplate.animation, order: slide.elements.length + 1 } : {
          effect: 'fadeIn',
          duration: 0.8,
          delay: 0.1,
          order: slide.elements.length + 1,
        },
      };
    } else if (type === 'image') {
      setShowImagePopup(true);
      return;
    } else if (type === 'question') {
      newElem = {
        id: newId,
        type: 'question',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
        zIndex: 10,
        role: 'question',
        content: {
          quizData: {
            question: 'Escreva a pergunta aqui...',
            options: ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'],
            correctIndex: 0,
            explanation: 'Explicação da resposta correta.',
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
        role: 'simulation',
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
    <div className="w-full space-y-5 text-xs pb-6">
        <input
          type="file"
          ref={videoInputRef}
          className="hidden"
          accept="video/*"
          onChange={(e) => handleFileUpload(e, 'video')}
        />
        <input
          type="file"
          ref={audioInputRef}
          className="hidden"
          accept="audio/*"
          onChange={(e) => handleFileUpload(e, 'audio')}
        />
        <input
          type="file"
          ref={imageInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileUpload(e, 'image')}
        />

        {/* Image Upload Popup */}
        {showImagePopup && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`w-full max-w-sm rounded-xl p-5 shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Adicionar Imagem</h3>
                <button onClick={() => setShowImagePopup(false)} className="text-slate-400 hover:text-slate-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => imageInputRef.current?.click()}
                  className="p-3 w-full border rounded-lg hover:bg-[#0a6ed1]/10 hover:border-[#0a6ed1] transition-colors flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-5 h-5 text-[#0a6ed1]" />
                  <span>Do Computador</span>
                </button>
                <button 
                  onClick={handlePasteFromClipboard}
                  className="p-3 w-full border rounded-lg hover:bg-[#0a6ed1]/10 hover:border-[#0a6ed1] transition-colors flex items-center justify-center gap-2"
                >
                  <Layers className="w-5 h-5 text-emerald-500" />
                  <span>Colar do Clipboard (Ctrl+V)</span>
                </button>
              </div>
              <p className="text-xs text-center mt-4 text-slate-500">
                O arquivo será incorporado diretamente no slide.
              </p>
            </div>
          </div>
        )}

      {/* Add New Elements Header */}
      <div>
        <span className="text-[10px] font-mono font-bold text-[#0a6ed1] uppercase tracking-wider block mb-2">
          ➕ Adicionar Elementos
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleAddElement('title')}
            className={`p-2 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 border-white/10 text-white' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            <Type className="w-3.5 h-3.5 text-[#0a6ed1]" />
            <span>Título</span>
          </button>
          <button
            onClick={() => handleAddElement('bodyText')}
            className={`p-2 rounded-md font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 border-white/10 text-white' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'}`}
          >
            <Type className="w-3.5 h-3.5 text-emerald-500" />
            <span>Texto Principal</span>
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
      <div className={`pt-3 border-t space-y-3 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
          🎨 Fundo do Slide
        </span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={slide.background.value.startsWith('#') ? slide.background.value : '#0f172a'}
            onChange={(e) =>
              updateSlideBackground(slide.id, { ...slide.background, type: 'color', value: e.target.value })
            }
            className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
          />
          <span className={`font-mono ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{slide.background.value}</span>
          
          <select
            value={slide.background.pattern || ''}
            onChange={(e) => {
              const patVal = e.target.value ? e.target.value : undefined;
              updateSlideBackground(slide.id, {
                ...slide.background,
                pattern: patVal
              });
            }}
            className={`p-1 rounded border text-[10px] font-bold cursor-pointer max-w-[100px] ml-auto outline-none ${
              theme === 'dark'
                ? 'bg-slate-900 border-white/10 text-white hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
            }`}
            title="Selecionar Textura de Fundo"
          >
            <option value="">Sem textura</option>
            <option value={`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(128,128,128,0.15)' stroke-width='1'/%3E%3C/svg%3E")`}>Grade</option>
            <option value={`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(128,128,128,0.25)'/%3E%3C/svg%3E")`}>Pontilhado</option>
            <option value={`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 40 L40 0 M-10 10 L10 -10 M30 50 L50 30' fill='none' stroke='rgba(128,128,128,0.15)' stroke-width='1'/%3E%3C/svg%3E")`}>Diagonais</option>
            <option value={`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='20' viewBox='0 0 80 20'%3E%3Cpath d='M 0,10 C 20,0 20,20 40,10 C 60,0 60,20 80,10' fill='none' stroke='rgba(128,128,128,0.15)' stroke-width='1'/%3E%3C/svg%3E")`}>Ondas</option>
          </select>
        </div>

      {/* Layout Presets Section */}
      <div className={`pt-3 border-t space-y-2 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            📐 Layouts e Templates
          </span>
          {slide.layoutName && (
            <span className="text-[9px] bg-[#0a6ed1]/10 text-[#0a6ed1] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              {slide.layoutName}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowLayoutPopup(true)}
            className={`flex-1 py-1.5 px-3 rounded-md font-extrabold text-[10px] transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 ${
              theme === 'dark'
                ? 'bg-slate-900 hover:bg-slate-800 text-white border border-white/10'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-[#0a6ed1]" />
            <span>+ Layouts</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLayoutSaveName('');
              setShowSavePresetPopup(true);
            }}
            className={`py-1.5 px-3 rounded-md font-extrabold text-[10px] transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 ${
              theme === 'dark'
                ? 'bg-slate-900 hover:bg-slate-800 text-white border border-white/10'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
            title="Salvar layout atual como novo preset na biblioteca"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-500" />
            <span>Criar Layout</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowTemplatePopup(true)}
          className={`w-full py-1.5 px-3 rounded-md font-extrabold text-[10px] transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 mt-1.5 ${
            theme === 'dark'
              ? 'bg-slate-900 hover:bg-slate-800 text-white border border-white/10'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
          title="Alterar padrão de paleta de cores global do curso"
        >
          <Palette className="w-3.5 h-3.5 text-purple-500" />
          <span>+ Templates (Paleta de Cores)</span>
        </button>
      </div>

      <div className="flex flex-col gap-2 pt-1.5 border-t border-dashed border-slate-200/50 space-y-1">
        <span className={`text-[9px] font-black uppercase tracking-wider block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          Opções de Replicação
        </span>
        <div className="grid grid-cols-2 gap-2 text-[10px] pb-1">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={repBg}
              onChange={(e) => setRepBg(e.target.checked)}
              className="rounded text-[#0a6ed1] focus:ring-0 w-3 h-3"
            />
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Fundo</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={repLayout}
              onChange={(e) => setRepLayout(e.target.checked)}
              className="rounded text-[#0a6ed1] focus:ring-0 w-3 h-3"
            />
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Layout</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={repStyle}
              onChange={(e) => setRepStyle(e.target.checked)}
              className="rounded text-[#0a6ed1] focus:ring-0 w-3 h-3"
            />
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Estilos</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={repAnim}
              onChange={(e) => setRepAnim(e.target.checked)}
              className="rounded text-[#0a6ed1] focus:ring-0 w-3 h-3"
            />
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Animações</span>
          </label>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={replicateBackgroundToAll}
            onChange={(e) => setReplicateBackgroundToAll(e.target.checked)}
            className="rounded text-[#0a6ed1] focus:ring-0 w-3.5 h-3.5"
          />
          <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Replicar alterações automaticamente
          </span>
        </label>

        <button
          type="button"
          onClick={handleReplicateClick}
          className={`w-full py-1.5 px-3 rounded-md font-extrabold text-[10px] transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 ${
            theme === 'dark'
              ? 'bg-slate-900 hover:bg-slate-800 text-white border border-white/10'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-[#0a6ed1]" />
          <span>Replicar Slide</span>
        </button>
      </div>
    </div>

      {/* Selected Element Property Editor */}
      {selectedElement ? (
        <div className={`pt-3 border-t space-y-4 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#0a6ed1] uppercase tracking-wider">
              ⚙️ Elemento: {selectedElement.type}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  copyElementStyle(slide.id, selectedElement.id);
                }}
                className="p-1 bg-[#0a6ed1]/15 hover:bg-[#0a6ed1]/30 text-[#0a6ed1] rounded-md transition-all cursor-pointer flex items-center gap-1 text-[9px] font-extrabold px-2"
                title="Copiar parâmetros e estilo deste elemento"
              >
                <Copy className="w-3 h-3" />
                <span>Copiar Estilo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!copiedElementStyle) return;
                  pasteElementStyle(slide.id, selectedElement.id);
                }}
                disabled={!copiedElementStyle}
                className={`p-1 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[9px] font-extrabold px-2 ${
                  copiedElementStyle
                    ? 'bg-purple-500/20 hover:bg-purple-500/40 text-purple-400'
                    : 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                }`}
                title={copiedElementStyle ? "Aplicar estilo/parâmetros copiados neste elemento" : "Nenhum estilo copiado ainda"}
              >
                <Paintbrush className="w-3 h-3" />
                <span>Colar Estilo</span>
              </button>

              <button
                type="button"
                onClick={() => removeElement(slide.id, selectedElement.id)}
                className="p-1 bg-[#bb0000]/20 hover:bg-[#bb0000]/40 text-rose-500 rounded-md transition-all cursor-pointer ml-1"
                title="Excluir Elemento"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
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
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Cor:</span>
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
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Fonte:</span>
                  <div className={`flex items-center border rounded overflow-hidden ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                    <input
                      type="number"
                      step="0.1"
                      value={parseFloat(selectedElement.content.style?.fontSize || '1.2') || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const unit = (selectedElement.content.style?.fontSize || '1.2rem').replace(/[\d.]/g, '') || 'rem';
                        updateElementContent(slide.id, selectedElement.id, {
                          style: { ...selectedElement.content.style, fontSize: val ? `${val}${unit}` : '' },
                        });
                      }}
                      className={`w-14 p-1 text-[10px] text-center outline-none border-none ${
                        theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                      }`}
                    />
                    <span className={`px-1.5 text-[9px] h-full flex items-center ${
                      theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {(selectedElement.content.style?.fontSize || '1.2rem').replace(/[\d.]/g, '') || 'rem'}
                    </span>
                  </div>
                </div>
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
              <span className={`text-[10px] font-bold block pt-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Texto Alternativo (Acessibilidade)</span>
              <input
                type="text"
                value={selectedElement.content.alt || ''}
                onChange={(e) =>
                  updateElementContent(slide.id, selectedElement.id, { alt: e.target.value })
                }
                placeholder="Descreva a imagem para leitores de tela..."
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
                
                {/* Contrast Badge */}
                {(() => {
                  const textColor = selectedElement.content.style?.color || '#ffffff';
                  const isBgColor = slide.background.type === 'color';
                  const bgColor = isBgColor ? (slide.background.value || '#12171c') : '#12171c';
                  
                  if (!isBgColor) {
                    return (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        Contraste: Não verificado (Fundo Imagem/Estampa)
                      </span>
                    );
                  }
                  
                  const ratio = getContrastRatio(textColor, bgColor);
                  const pass = ratio >= 4.5;
                  
                  return (
                    <span 
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-all ${
                        pass 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                      title={pass ? "Atende aos critérios de acessibilidade WCAG AA (>= 4.5:1)" : "Abaixo da proporção recomendada de 4.5:1 para acessibilidade"}
                    >
                      WCAG Contraste: {ratio.toFixed(1)}:1 ({pass ? 'Passou AA' : 'Baixo'})
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`pt-3 border-t text-center py-6 ${theme === 'dark' ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
          <p className="text-[11px]">Clique em um elemento no slide para editar suas propriedades.</p>
        </div>
      )}
      {/* Layout Selection Popup */}
      {showLayoutPopup && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-900 border border-white/10 text-white' : 'bg-white text-slate-800'} rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-white/10">
              <div>
                <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-wider text-[#0a6ed1]">
                  <Grid className="w-4 h-4" />
                  Biblioteca de Layouts & Wireframes
                </h3>
                <p className="text-[10px] opacity-70 mt-0.5">
                  Escolha uma estrutura pré-definida para preencher com os recursos da UC.
                </p>
              </div>
              <button 
                onClick={() => setShowLayoutPopup(false)}
                className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {layoutPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    if (slide.elements.length > 0 && !confirm('Você deseja mesmo aplicar este layout? Isto apagará os elementos atuais deste slide.')) {
                      return;
                    }
                    applyLayoutToSlide(slide.id, preset.name);
                    setShowLayoutPopup(false);
                  }}
                  className={`group flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.02] shadow-2xs hover:shadow-md ${
                    slide.layoutName === preset.name
                      ? 'ring-2 ring-[#0a6ed1] border-[#0a6ed1] bg-[#0a6ed1]/5'
                      : theme === 'dark'
                      ? 'border-white/10 bg-slate-950 hover:bg-slate-800 hover:border-white/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <LayoutThumbnail elements={preset.elements} theme={theme} className="mb-2 group-hover:border-[#0a6ed1]/50" />
                  <span className="text-[11px] font-black truncate block text-slate-800 dark:text-slate-100 group-hover:text-[#0a6ed1]">
                    {preset.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold block truncate mt-0.5">
                    {preset.elements.length === 0 ? 'Slide em Branco' : `${preset.elements.length} container(s)`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create/Save New Layout Popup */}
      {showSavePresetPopup && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-900 border border-white/10 text-white' : 'bg-white text-slate-800'} rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4`}>
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5 text-emerald-500">
              <Plus className="w-4 h-4" />
              Criar Layout Personalizado
            </h3>
            <p className="text-[11px] opacity-75">
              O arranjo atual de elementos do slide será salvo como um novo modelo na biblioteca. Ele servirá de padrão para inserção.
            </p>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider block opacity-70">Nome do Layout</label>
              <input
                type="text"
                value={layoutSaveName}
                onChange={(e) => setLayoutSaveName(e.target.value)}
                placeholder="Ex: Título + Três Colunas"
                className={`w-full p-2 text-xs rounded border outline-none font-bold ${
                  theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              />
            </div>
            <div className="flex gap-2 justify-end pt-2 text-[10px]">
              <button
                onClick={() => setShowSavePresetPopup(false)}
                className={`px-3 py-1.5 rounded font-bold cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!layoutSaveName.trim()) {
                    alert('Por favor, informe um nome para o layout.');
                    return;
                  }
                  createLayoutPreset(layoutSaveName.trim(), slide.elements);
                  setShowSavePresetPopup(false);
                  alert('Layout criado com sucesso!');
                }}
                className="px-3 py-1.5 rounded font-black bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
              >
                Salvar Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replicate Layout Popup Confirmation */}
      {showReplicateLayoutPopup && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-900 border border-white/10 text-white' : 'bg-white text-slate-800'} rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4`}>
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
              ⚠️ Confirmar Replicação de Layout
            </h3>
            <p className="text-[11px] opacity-75">
              Você marcou para replicação de Layout. Escolha em qual modelo da biblioteca você gostaria de salvar esta nova disposição física de containers como o padrão de inserção:
            </p>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-wider block opacity-70">Modelo a ser atualizado</label>
              <select
                value={selectedReplicateLayoutName}
                onChange={(e) => setSelectedReplicateLayoutName(e.target.value)}
                className={`w-full p-2 text-xs rounded border outline-none font-bold cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {layoutPresets.map(l => (
                  <option key={l.name} value={l.name}>{l.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-2 text-[10px]">
              <button
                onClick={() => setShowReplicateLayoutPopup(false)}
                className={`px-3 py-1.5 rounded font-bold cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                Cancelar
              </button>
              <button
                onClick={confirmReplicateLayout}
                className="px-3 py-1.5 rounded font-black bg-[#0a6ed1] hover:bg-[#085db1] text-white cursor-pointer"
              >
                Confirmar e Replicar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Color Palettes / Templates Popup */}
      {showTemplatePopup && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className={`${theme === 'dark' ? 'bg-slate-900 border border-white/10 text-white' : 'bg-white text-slate-800'} rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-white/10">
              <div>
                <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-wider text-purple-500">
                  <Palette className="w-4 h-4" />
                  Templates & Paletas de Cores do Curso
                </h3>
                <p className="text-[10px] opacity-70 mt-0.5">
                  Selecione uma paleta para aplicar o tema de cores geral em todas as aulas e elementos do curso.
                </p>
              </div>
              <button 
                onClick={() => setShowTemplatePopup(false)}
                className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {colorPalettes.map((pal) => (
                <button
                  key={pal.id}
                  onClick={() => {
                    if (confirm(`Deseja aplicar a paleta "${pal.name}" globalmente a todos os slides do curso?`)) {
                      applyColorPaletteToPresentation(pal);
                      setShowTemplatePopup(false);
                    }
                  }}
                  className={`group flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.02] shadow-2xs hover:shadow-md ${
                    theme === 'dark' 
                      ? 'border-white/10 bg-slate-950 hover:bg-slate-800 hover:border-white/20' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black truncate block text-slate-800 dark:text-slate-100 group-hover:text-purple-500">
                      {pal.name}
                    </span>
                  </div>
                  
                  {/* Palette Swatch Visualizer */}
                  <div 
                    className="w-full h-12 rounded-lg p-2 border flex items-center justify-between relative overflow-hidden"
                    style={{ backgroundColor: pal.background }}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black truncate" style={{ color: pal.titleColor }}>
                        Título Exemplo
                      </span>
                      <span className="text-[8px] opacity-80 truncate" style={{ color: pal.bodyColor }}>
                        Texto do corpo...
                      </span>
                    </div>
                    <div 
                      className="w-5 h-5 rounded-full border border-white/20 shadow-xs flex items-center justify-center text-[8px]"
                      style={{ backgroundColor: pal.titleColor, color: pal.background }}
                    >
                      Aa
                    </div>
                  </div>
                  
                  <div className="flex gap-1.5 mt-2">
                    <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: pal.background }} title={`Fundo: ${pal.background}`} />
                    <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: pal.titleColor }} title={`Título: ${pal.titleColor}`} />
                    <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: pal.bodyColor }} title={`Texto: ${pal.bodyColor}`} />
                    <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: pal.accentColor }} title={`Destaque: ${pal.accentColor}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
