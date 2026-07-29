import { create } from 'zustand';
import { Presentation, Slide, SlideElement, ElementAnimation, LayoutPreset, ColorPalette } from '../types/presentation';

// Sample presentation for DRE / Gastronomy Management
export const SAMPLE_PRESENTATION: Presentation = {
  id: 'pres-dre-101',
  title: 'Treinamento DRE & Engenharia de Cardápio Interativo',
  aspectRatio: '16:9',
  slides: [
    {
      id: 'slide-1',
      title: 'Introdução à DRE Gastronômica',
      background: {
        type: 'color',
        value: '#12171c',
      },
      elements: [
        {
          id: 'elem-1-1',
          type: 'text',
          x: 8,
          y: 12,
          width: 84,
          height: 18,
          zIndex: 10,
          content: {
            text: 'DRE na Gastronomia: A Chave da Lucratividade',
            style: {
              fontSize: '2rem',
              fontWeight: '900',
              color: '#0a6ed1',
              textAlign: 'left',
            },
          },
          animation: {
            effect: 'fadeIn',
            duration: 0.8,
            delay: 0.2,
            order: 1,
          },
        },
        {
          id: 'elem-1-2',
          type: 'text',
          x: 8,
          y: 34,
          width: 84,
          height: 25,
          zIndex: 10,
          content: {
            text: 'A Demonstração do Resultado do Exercício revela exatamente onde seu restaurante está perdendo margem ou gerando lucro real. Nesta aula interativa, entenderemos a estrutura de custos, CMV e EBITDA.',
            style: {
              fontSize: '1rem',
              lineHeight: '1.6',
              color: '#e2e8f0',
              textAlign: 'left',
            },
          },
          animation: {
            effect: 'slideRight',
            duration: 1,
            delay: 0.8,
            order: 2,
          },
        },
        {
          id: 'elem-1-3',
          type: 'image',
          x: 8,
          y: 62,
          width: 84,
          height: 30,
          zIndex: 5,
          content: {
            src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200',
            style: {
              borderRadius: '12px',
              objectFit: 'cover',
              border: '1px solid rgba(255,255,255,0.15)',
            },
          },
          animation: {
            effect: 'zoomIn',
            duration: 1.2,
            delay: 1.5,
            order: 3,
          },
        },
      ],
    },
    {
      id: 'slide-2',
      title: 'Estrutura Básica do DRE',
      background: {
        type: 'color',
        value: '#1c222b',
      },
      elements: [
        {
          id: 'elem-2-1',
          type: 'text',
          x: 6,
          y: 10,
          width: 88,
          height: 15,
          zIndex: 10,
          content: {
            text: 'Anatomia da DRE Operacional',
            style: {
              fontSize: '1.75rem',
              fontWeight: '800',
              color: '#0a6ed1',
            },
          },
          animation: {
            effect: 'fadeIn',
            duration: 0.6,
            delay: 0.1,
            order: 1,
          },
        },
        {
          id: 'elem-2-2',
          type: 'text',
          x: 6,
          y: 28,
          width: 42,
          height: 60,
          zIndex: 10,
          content: {
            text: '1. Receita Bruta de Vendas\n2. (-) Impostos & Deduções\n3. (=) Receita Líquida\n4. (-) Custo de Mercadoria Vendida (CMV)\n5. (=) Lucro Bruto\n6. (-) Despesas Operacionais\n7. (=) Resultado Operacional (EBITDA)',
            style: {
              fontSize: '0.9rem',
              lineHeight: '2.1',
              color: '#5899da',
              fontFamily: 'monospace',
              backgroundColor: 'rgba(29, 45, 62, 0.85)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(10, 110, 209, 0.4)',
            },
          },
          animation: {
            effect: 'slideLeft',
            duration: 0.8,
            delay: 0.6,
            order: 2,
          },
        },
        {
          id: 'elem-2-3',
          type: 'text',
          x: 52,
          y: 28,
          width: 42,
          height: 60,
          zIndex: 10,
          content: {
            text: '📌 Dica Estratégica do Gestor:\n\n• O CMV ideal em gastronomia varia entre 28% e 32%.\n• Custos com Mão de Obra devem estar entre 22% e 28%.\n• Se o CMV ultrapassar 35%, revise urgentemente as Fichas Técnicas e Desperdício no preparo!',
            style: {
              fontSize: '0.9rem',
              lineHeight: '1.8',
              color: '#f8fafc',
              backgroundColor: 'rgba(16, 126, 62, 0.15)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(16, 126, 62, 0.4)',
            },
          },
          animation: {
            effect: 'zoomIn',
            duration: 0.9,
            delay: 1.2,
            order: 3,
          },
        },
      ],
    },
    {
      id: 'slide-3',
      title: 'Teste de Conhecimento Interativo',
      background: {
        type: 'color',
        value: '#12171c',
      },
      elements: [
        {
          id: 'elem-3-1',
          type: 'question',
          x: 10,
          y: 12,
          width: 80,
          height: 76,
          zIndex: 10,
          content: {
            quizData: {
              question: 'Qual é o percentual máximo recomendado de CMV (Custo de Mercadoria Vendida) em um restaurante padrão?',
              options: [
                '15% a 20%',
                '28% a 32%',
                '45% a 50%',
                'Não existe limite pré-definido',
              ],
              correctIndex: 1,
              explanation: 'Excelente! O CMV ideal em estabelecimentos gastronômicos fica entre 28% e 32%. Valores acima de 35% comprometem severamente a margem de lucro líquida.',
            },
          },
          animation: {
            effect: 'fadeIn',
            duration: 0.8,
            delay: 0.3,
            order: 1,
          },
        },
      ],
    },
  ],
};

interface PresentationState {
  presentation: Presentation;
  currentSlideIndex: number;
  selectedElementId: string | null;
  mode: 'editor' | 'player';
  theme: 'light' | 'dark';
  isPlaying: boolean;
  history: Presentation[];
  historyIndex: number;

  // Actions
  setPresentation: (presentation: Presentation) => void;
  setMode: (mode: 'editor' | 'player') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentSlideIndex: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setSelectedElementId: (id: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;

  // Editor Actions
  updateElement: (slideId: string, elementId: string, patch: Partial<SlideElement>) => void;
  updateElementContent: (slideId: string, elementId: string, contentPatch: Partial<SlideElement['content']>) => void;
  updateElementAnimation: (slideId: string, elementId: string, animationPatch: Partial<ElementAnimation>) => void;
  addElement: (slideId: string, element: SlideElement) => void;
  removeElement: (slideId: string, elementId: string) => void;
  addSlide: (slide: Slide) => void;
  removeSlide: (slideId: string) => void;
  updateSlideBackground: (slideId: string, background: { type: 'color' | 'image'; value: string; pattern?: string }) => void;
  reorderSlides: (startIndex: number, endIndex: number) => void;
  replicateBackgroundToAll: boolean;
  setReplicateBackgroundToAll: (val: boolean) => void;
  defaultSlideBackground?: { type: 'color' | 'image'; value: string; pattern?: string };
  setDefaultSlideBackground: (bg: { type: 'color' | 'image'; value: string; pattern?: string } | undefined) => void;
  replicateSlideBackgroundToAll: (slideId: string, options?: { background?: boolean; layout?: boolean; style?: boolean; animation?: boolean }) => void;
  defaultTitleColor?: string;
  defaultBodyColor?: string;
  setDefaultTitleColor: (color: string | undefined) => void;
  setDefaultBodyColor: (color: string | undefined) => void;
  defaultSlideElementsTemplate?: SlideElement[];

  layoutPresets: LayoutPreset[];
  applyLayoutToSlide: (slideId: string, layoutName: string) => void;
  updateLayoutPreset: (layoutName: string, elements: SlideElement[]) => void;
  createLayoutPreset: (layoutName: string, elements: SlideElement[]) => void;

  colorPalettes: ColorPalette[];
  applyColorPaletteToPresentation: (palette: ColorPalette) => void;

  copiedElementStyle: {
    width?: number;
    height?: number;
    zIndex?: number;
    animation?: ElementAnimation;
    content?: Partial<SlideElement['content']>;
  } | null;
  copyElementStyle: (slideId: string, elementId: string) => void;
  pasteElementStyle: (slideId: string, targetElementId: string) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
}

export const INITIAL_LAYOUTS: LayoutPreset[] = [
  {
    name: "Slide de Título",
    elements: [
      {
        id: "placeholder-title",
        type: "text",
        x: 10,
        y: 35,
        width: 80,
        height: 20,
        zIndex: 10,
        role: "title",
        content: {
          text: "Título da Apresentação",
          style: {
            fontSize: "2.5rem",
            fontWeight: "800",
            fontFamily: "Outfit, sans-serif",
            textAlign: "center"
          }
        }
      },
      {
        id: "placeholder-subtitle",
        type: "text",
        x: 15,
        y: 58,
        width: 70,
        height: 15,
        zIndex: 10,
        role: "bodyText",
        content: {
          text: "Subtítulo do módulo ou curso...",
          style: {
            fontSize: "1.2rem",
            fontWeight: "400",
            fontFamily: "Outfit, sans-serif",
            textAlign: "center"
          }
        }
      }
    ]
  },
  {
    name: "Título + Texto",
    elements: [
      {
        id: "placeholder-title",
        type: "text",
        x: 10,
        y: 12,
        width: 80,
        height: 15,
        zIndex: 10,
        role: "title",
        content: {
          text: "Título do Slide",
          style: {
            fontSize: "2rem",
            fontWeight: "800",
            fontFamily: "Outfit, sans-serif"
          }
        }
      },
      {
        id: "placeholder-body",
        type: "text",
        x: 10,
        y: 32,
        width: 80,
        height: 55,
        zIndex: 10,
        role: "bodyText",
        content: {
          text: "Adicione o texto principal aqui...",
          style: {
            fontSize: "1.2rem",
            fontWeight: "400",
            fontFamily: "Outfit, sans-serif"
          }
        }
      }
    ]
  },
  {
    name: "Título + Imagem Esquerda",
    elements: [
      {
        id: "placeholder-title",
        type: "text",
        x: 10,
        y: 10,
        width: 80,
        height: 15,
        zIndex: 10,
        role: "title",
        content: {
          text: "Título com Imagem Lateral",
          style: {
            fontSize: "2rem",
            fontWeight: "800",
            fontFamily: "Outfit, sans-serif"
          }
        }
      },
      {
        id: "placeholder-img",
        type: "image",
        x: 10,
        y: 30,
        width: 38,
        height: 55,
        zIndex: 5,
        role: "image",
        content: {
          src: "",
          alt: "Selecione esta imagem e clique em Inserir Recurso"
        }
      },
      {
        id: "placeholder-body",
        type: "text",
        x: 52,
        y: 30,
        width: 38,
        height: 55,
        zIndex: 10,
        role: "bodyText",
        content: {
          text: "Selecione este container de texto e clique em Inserir Recurso...",
          style: {
            fontSize: "1.2rem",
            fontWeight: "400",
            fontFamily: "Outfit, sans-serif"
          }
        }
      }
    ]
  },
  {
    name: "Título + Vídeo Centro",
    elements: [
      {
        id: "placeholder-title",
        type: "text",
        x: 10,
        y: 10,
        width: 80,
        height: 12,
        zIndex: 10,
        role: "title",
        content: {
          text: "Título do Slide com Vídeo",
          style: {
            fontSize: "2rem",
            fontWeight: "800",
            fontFamily: "Outfit, sans-serif"
          }
        }
      },
      {
        id: "placeholder-video",
        type: "video",
        x: 15,
        y: 25,
        width: 70,
        height: 48,
        zIndex: 5,
        role: "video",
        content: {
          src: ""
        }
      },
      {
        id: "placeholder-body",
        type: "text",
        x: 15,
        y: 77,
        width: 70,
        height: 15,
        zIndex: 10,
        role: "bodyText",
        content: {
          text: "Selecione para preencher com notas ou leituras da UC...",
          style: {
            fontSize: "1rem",
            fontWeight: "400",
            fontFamily: "Outfit, sans-serif",
            textAlign: "center"
          }
        }
      }
    ]
  },
  {
    name: "Duas Colunas de Texto",
    elements: [
      {
        id: "placeholder-title",
        type: "text",
        x: 10,
        y: 10,
        width: 80,
        height: 15,
        zIndex: 10,
        role: "title",
        content: {
          text: "Título em Duas Colunas",
          style: {
            fontSize: "2rem",
            fontWeight: "800",
            fontFamily: "Outfit, sans-serif"
          }
        }
      },
      {
        id: "placeholder-col1",
        type: "text",
        x: 10,
        y: 30,
        width: 38,
        height: 55,
        zIndex: 10,
        role: "bodyText",
        content: {
          text: "Texto da coluna 1...",
          style: {
            fontSize: "1.1rem",
            fontWeight: "400",
            fontFamily: "Outfit, sans-serif"
          }
        }
      },
      {
        id: "placeholder-col2",
        type: "text",
        x: 52,
        y: 30,
        width: 38,
        height: 55,
        zIndex: 10,
        role: "bodyText",
        content: {
          text: "Texto da coluna 2...",
          style: {
            fontSize: "1.1rem",
            fontWeight: "400",
            fontFamily: "Outfit, sans-serif"
          }
        }
      }
    ]
  },
  {
    name: "Três Colunas de Texto",
    elements: [
      {
        id: "placeholder-title",
        type: "text",
        x: 5,
        y: 10,
        width: 90,
        height: 15,
        zIndex: 10,
        role: "title",
        content: {
          text: "Título em Três Colunas",
          style: {
            fontSize: "2rem",
            fontWeight: "800",
            fontFamily: "Outfit, sans-serif"
          }
        }
      },
      {
        id: "placeholder-col1",
        type: "text",
        x: 5,
        y: 30,
        width: 27,
        height: 55,
        zIndex: 10,
        role: "bodyText",
        content: {
          text: "Coluna 1...",
          style: { fontSize: "1rem", fontFamily: "Outfit, sans-serif" }
        }
      },
      {
        id: "placeholder-col2",
        type: "text",
        x: 36,
        y: 30,
        width: 27,
        height: 55,
        zIndex: 10,
        role: "bodyText",
        content: {
          text: "Coluna 2...",
          style: { fontSize: "1rem", fontFamily: "Outfit, sans-serif" }
        }
      },
      {
        id: "placeholder-col3",
        type: "text",
        x: 67,
        y: 30,
        width: 27,
        height: 55,
        zIndex: 10,
        role: "bodyText",
        content: {
          text: "Coluna 3...",
          style: { fontSize: "1rem", fontFamily: "Outfit, sans-serif" }
        }
      }
    ]
  },
  {
    name: "Duas Colunas de Mídia",
    elements: [
      {
        id: "placeholder-title",
        type: "text",
        x: 10,
        y: 10,
        width: 80,
        height: 15,
        zIndex: 10,
        role: "title",
        content: {
          text: "Galeria de Imagens",
          style: {
            fontSize: "2rem",
            fontWeight: "800",
            fontFamily: "Outfit, sans-serif"
          }
        }
      },
      {
        id: "placeholder-img1",
        type: "image",
        x: 10,
        y: 30,
        width: 38,
        height: 55,
        zIndex: 5,
        role: "image",
        content: { src: "", alt: "Imagem 1" }
      },
      {
        id: "placeholder-img2",
        type: "image",
        x: 52,
        y: 30,
        width: 38,
        height: 55,
        zIndex: 5,
        role: "image",
        content: { src: "", alt: "Imagem 2" }
      }
    ]
  },
  {
    name: "Grade de Imagens 2x2",
    elements: [
      {
        id: "placeholder-title",
        type: "text",
        x: 5,
        y: 5,
        width: 90,
        height: 12,
        zIndex: 10,
        role: "title",
        content: {
          text: "Grade de Mídias 2x2",
          style: {
            fontSize: "1.8rem",
            fontWeight: "800",
            fontFamily: "Outfit, sans-serif"
          }
        }
      },
      {
        id: "placeholder-img1",
        type: "image",
        x: 5,
        y: 20,
        width: 43,
        height: 35,
        zIndex: 5,
        role: "image",
        content: { src: "", alt: "Mídia 1" }
      },
      {
        id: "placeholder-img2",
        type: "image",
        x: 52,
        y: 20,
        width: 43,
        height: 35,
        zIndex: 5,
        role: "image",
        content: { src: "", alt: "Mídia 2" }
      },
      {
        id: "placeholder-img3",
        type: "image",
        x: 5,
        y: 58,
        width: 43,
        height: 35,
        zIndex: 5,
        role: "image",
        content: { src: "", alt: "Mídia 3" }
      },
      {
        id: "placeholder-img4",
        type: "image",
        x: 52,
        y: 58,
        width: 43,
        height: 35,
        zIndex: 5,
        role: "image",
        content: { src: "", alt: "Mídia 4" }
      }
    ]
  },
  {
    name: "Múltipla Escolha (Quiz)",
    elements: [
      {
        id: "placeholder-title",
        type: "text",
        x: 10,
        y: 10,
        width: 80,
        height: 12,
        zIndex: 10,
        role: "title",
        content: {
          text: "Avaliação Curta",
          style: {
            fontSize: "2rem",
            fontWeight: "800",
            fontFamily: "Outfit, sans-serif"
          }
        }
      },
      {
        id: "placeholder-quiz",
        type: "question",
        x: 10,
        y: 26,
        width: 80,
        height: 65,
        zIndex: 10,
        role: "question",
        content: {
          quizData: {
            question: "Selecione esta caixa e clique em Inserir Questão da UC...",
            options: ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
            correctIndex: 0
          }
        }
      }
    ]
  },
  {
    name: "Imagem em Tela Cheia",
    elements: [
      {
        id: "placeholder-full-img",
        type: "image",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        zIndex: 1,
        role: "image",
        content: { src: "", alt: "Imagem Fullscreen" }
      }
    ]
  },
  {
    name: "Vídeo em Tela Cheia",
    elements: [
      {
        id: "placeholder-full-video",
        type: "video",
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        zIndex: 1,
        role: "video",
        content: { src: "" }
      }
    ]
  },
  {
    name: "Slide em Branco",
    elements: []
  }
];

export const DEFAULT_COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'palette-corporate',
    name: 'Corporate Sagacitas',
    background: '#0f172a',
    titleColor: '#0a6ed1',
    bodyColor: '#e2e8f0',
    accentColor: '#1e293b',
  },
  {
    id: 'palette-dark-gold',
    name: 'Elegance Dark & Dourado',
    background: '#121212',
    titleColor: '#d97706',
    bodyColor: '#f3f4f6',
    accentColor: '#1f2937',
  },
  {
    id: 'palette-emerald',
    name: 'Emerald Eco (Verde)',
    background: '#064e3b',
    titleColor: '#34d399',
    bodyColor: '#ecfdf5',
    accentColor: '#047857',
  },
  {
    id: 'palette-neon-cyber',
    name: 'Neon Cyber Violeta',
    background: '#0f051d',
    titleColor: '#c084fc',
    bodyColor: '#f472b6',
    accentColor: '#2e1065',
  },
  {
    id: 'palette-clean-light',
    name: 'Minimalist Clean (Claro)',
    background: '#ffffff',
    titleColor: '#0f172a',
    bodyColor: '#334155',
    accentColor: '#f1f5f9',
  },
  {
    id: 'palette-warm-sunset',
    name: 'Warm Terracota',
    background: '#1c1917',
    titleColor: '#f97316',
    bodyColor: '#f5f5f4',
    accentColor: '#292524',
  },
  {
    id: 'palette-ocean',
    name: 'Ocean Breeze Ciano',
    background: '#032b43',
    titleColor: '#06b6d4',
    bodyColor: '#e0f2fe',
    accentColor: '#075985',
  },
  {
    id: 'palette-rose-premium',
    name: 'Rose Gold Premium',
    background: '#181114',
    titleColor: '#fb7185',
    bodyColor: '#ffe4e6',
    accentColor: '#2e1c23',
  },
];

export const usePresentationStore = create<PresentationState>((set, get) => ({
  presentation: SAMPLE_PRESENTATION,
  currentSlideIndex: 0,
  selectedElementId: null,
  mode: 'player',
  theme: 'light',
  isPlaying: false,
  replicateBackgroundToAll: false,
  defaultSlideBackground: undefined,
  defaultTitleColor: undefined,
  defaultBodyColor: undefined,
  defaultSlideElementsTemplate: undefined,
  layoutPresets: INITIAL_LAYOUTS,
  colorPalettes: DEFAULT_COLOR_PALETTES,
  copiedElementStyle: null,
  history: [SAMPLE_PRESENTATION],
  historyIndex: 0,

  setPresentation: (presentation) =>
    set({
      presentation,
      currentSlideIndex: 0,
      selectedElementId: null,
      history: [presentation],
      historyIndex: 0,
    }),

  setMode: (mode) => set({ mode, isPlaying: mode === 'player' }),
  setTheme: (theme) => set({ theme }),

  setCurrentSlideIndex: (index) => {
    const { presentation } = get();
    if (index >= 0 && index < presentation.slides.length) {
      set({ currentSlideIndex: index, selectedElementId: null });
    }
  },

  nextSlide: () => {
    const { currentSlideIndex, presentation } = get();
    if (currentSlideIndex < presentation.slides.length - 1) {
      set({ currentSlideIndex: currentSlideIndex + 1, selectedElementId: null });
    }
  },

  prevSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) {
      set({ currentSlideIndex: currentSlideIndex - 1, selectedElementId: null });
    }
  },

  setSelectedElementId: (id) => set({ selectedElementId: id }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  updateElement: (slideId, elementId, patch) => {
    const { presentation, history, historyIndex, replicateBackgroundToAll } = get();
    const slide = presentation.slides.find((s) => s.id === slideId);
    const elementIdx = slide?.elements.findIndex((e) => e.id === elementId) ?? -1;

    const updatedSlides = presentation.slides.map((s) => {
      if (s.id === slideId) {
        return {
          ...s,
          elements: s.elements.map((el) => (el.id === elementId ? { ...el, ...patch } : el)),
        };
      }

      if (replicateBackgroundToAll && elementIdx !== -1 && s.elements[elementIdx]) {
        const cleanPatch = { ...patch };
        if (cleanPatch.content) {
          const { text, sourceId, ...otherContent } = cleanPatch.content;
          cleanPatch.content = otherContent;
        }
        
        return {
          ...s,
          elements: s.elements.map((el, idx) => {
            if (idx === elementIdx && el.type === s.elements[elementIdx].type) {
              const mergedContent = {
                ...el.content,
                ...cleanPatch.content,
                text: el.content.text,
                sourceId: el.content.sourceId,
                style: {
                  ...el.content.style,
                  ...(cleanPatch.content?.style || {})
                }
              };
              return {
                ...el,
                ...cleanPatch,
                id: el.id,
                content: mergedContent
              };
            }
            return el;
          })
        };
      }

      return s;
    });

    const newPresentation: Presentation = { ...presentation, slides: updatedSlides };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPresentation);

    set({
      presentation: newPresentation,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  updateElementContent: (slideId, elementId, contentPatch) => {
    const { presentation, replicateBackgroundToAll } = get();
    const slide = presentation.slides.find((s) => s.id === slideId);
    if (!slide) return;
    const element = slide.elements.find((e) => e.id === elementId);
    if (!element) return;

    if (element.type === 'text' && replicateBackgroundToAll && contentPatch.style?.color) {
      const textColor = contentPatch.style.color;
      const isTitleElem = (el: any) => {
        return el.content.style?.fontWeight === '800' || 
               el.content.style?.fontWeight === '700' || 
               parseFloat(el.content.style?.fontSize || '0') >= 1.5;
      };
      const targetIsTitle = isTitleElem(element);
      set({
        defaultTitleColor: targetIsTitle ? textColor : get().defaultTitleColor,
        defaultBodyColor: !targetIsTitle ? textColor : get().defaultBodyColor,
      });
    }

    get().updateElement(slideId, elementId, {
      content: { ...element.content, ...contentPatch },
    });
  },

  updateElementAnimation: (slideId, elementId, animationPatch) => {
    const { presentation } = get();
    const slide = presentation.slides.find((s) => s.id === slideId);
    if (!slide) return;
    const element = slide.elements.find((e) => e.id === elementId);
    if (!element) return;

    const currentAnimation: ElementAnimation = element.animation || {
      effect: 'fadeIn',
      duration: 0.8,
      delay: 0,
      order: 1,
    };

    get().updateElement(slideId, elementId, {
      animation: { ...currentAnimation, ...animationPatch },
    });
  },

  addElement: (slideId, element) => {
    const { presentation, history, historyIndex } = get();
    const updatedSlides = presentation.slides.map((s) => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        elements: [...s.elements, element],
      };
    });

    const newPresentation = { ...presentation, slides: updatedSlides };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPresentation);

    set({
      presentation: newPresentation,
      selectedElementId: element.id,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  removeElement: (slideId, elementId) => {
    const { presentation, history, historyIndex } = get();
    const updatedSlides = presentation.slides.map((s) => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        elements: s.elements.filter((el) => el.id !== elementId),
      };
    });

    const newPresentation = { ...presentation, slides: updatedSlides };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPresentation);

    set({
      presentation: newPresentation,
      selectedElementId: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  addSlide: (slide) => {
    const { presentation, history, historyIndex } = get();
    const newSlides = [...presentation.slides, slide];
    const newPresentation = { ...presentation, slides: newSlides };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPresentation);

    set({
      presentation: newPresentation,
      currentSlideIndex: newSlides.length - 1,
      selectedElementId: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  removeSlide: (slideId) => {
    const { presentation, currentSlideIndex, history, historyIndex } = get();
    if (presentation.slides.length <= 1) return; // Keep at least one slide

    const newSlides = presentation.slides.filter((s) => s.id !== slideId);
    const newPresentation = { ...presentation, slides: newSlides };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPresentation);

    set({
      presentation: newPresentation,
      currentSlideIndex: Math.min(currentSlideIndex, newSlides.length - 1),
      selectedElementId: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  updateSlideBackground: (slideId, background) => {
    const { presentation, history, historyIndex, replicateBackgroundToAll } = get();
    const updatedSlides = presentation.slides.map((s) => {
      if (replicateBackgroundToAll) {
        return { ...s, background };
      }
      return s.id === slideId ? { ...s, background } : s;
    });
    const newPresentation = { ...presentation, slides: updatedSlides };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPresentation);

    set({
      presentation: newPresentation,
      defaultSlideBackground: replicateBackgroundToAll ? background : get().defaultSlideBackground,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  setReplicateBackgroundToAll: (val) => set({ replicateBackgroundToAll: val }),

  setDefaultSlideBackground: (bg) => set({ defaultSlideBackground: bg }),

  setDefaultTitleColor: (color) => set({ defaultTitleColor: color }),

  setDefaultBodyColor: (color) => set({ defaultBodyColor: color }),

  replicateSlideBackgroundToAll: (slideId, options) => {
    const { presentation, history, historyIndex } = get();
    const activeSlide = presentation.slides.find((s) => s.id === slideId);
    if (!activeSlide) return;

    const opts = {
      background: true,
      layout: true,
      style: true,
      animation: true,
      ...options
    };

    const background = activeSlide.background;
    const isTitleElem = (el: any) => {
      return el.content.style?.fontWeight === '800' || 
             el.content.style?.fontWeight === '700' || 
             parseFloat(el.content.style?.fontSize || '0') >= 1.5;
    };

    const activeTitle = activeSlide.elements.find((el) => el.type === 'text' && isTitleElem(el));
    const activeBody = activeSlide.elements.find((el) => el.type === 'text' && !isTitleElem(el));
    
    const titleColor = activeTitle?.content?.style?.color;
    const bodyColor = activeBody?.content?.style?.color;

    const updatedSlides = presentation.slides.map((s) => {
      if (s.id === slideId) return s;

      const typeCounts: Record<string, number> = {};

      const newElements = s.elements.map((el) => {
        const typeKey = el.role || (el.type === 'text' ? (isTitleElem(el) ? 'title' : 'bodyText') : el.type);
        typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;
        const currentCount = typeCounts[typeKey];

        let activeMatch: SlideElement | undefined;
        let activeCount = 0;
        for (const aEl of activeSlide.elements) {
          const aTypeKey = aEl.role || (aEl.type === 'text' ? (isTitleElem(aEl) ? 'title' : 'bodyText') : aEl.type);
          if (aTypeKey === typeKey) {
            activeCount++;
            if (activeCount === currentCount) {
              activeMatch = aEl;
              break;
            }
          }
        }

        if (activeMatch) {
          const mergedContent = {
            ...el.content,
            style: opts.style ? {
              ...el.content.style,
              ...(activeMatch.content.style || {})
            } : el.content.style
          };

          return {
            ...el,
            ...(opts.layout ? {
              x: activeMatch.x,
              y: activeMatch.y,
              width: activeMatch.width,
              height: activeMatch.height,
              zIndex: activeMatch.zIndex,
            } : {}),
            ...(opts.animation ? {
              animation: activeMatch.animation,
            } : {}),
            content: mergedContent,
          };
        }
        return el;
      });

      return {
        ...s,
        background: opts.background ? background : s.background,
        elements: newElements,
      };
    });

    // Update the pattern (defaultSlideElementsTemplate) selectively
    let updatedTemplate = get().defaultSlideElementsTemplate ? [...get().defaultSlideElementsTemplate!] : [];
    if (updatedTemplate.length === 0) {
      updatedTemplate = JSON.parse(JSON.stringify(activeSlide.elements));
    } else {
      updatedTemplate = updatedTemplate.map(tEl => {
        const tTypeKey = tEl.role || (tEl.type === 'text' ? (isTitleElem(tEl) ? 'title' : 'bodyText') : tEl.type);
        const aEl = activeSlide.elements.find(el => {
          const aTypeKey = el.role || (el.type === 'text' ? (isTitleElem(el) ? 'title' : 'bodyText') : el.type);
          return aTypeKey === tTypeKey;
        });
        if (aEl) {
          return {
            ...tEl,
            ...(opts.layout ? {
              x: aEl.x,
              y: aEl.y,
              width: aEl.width,
              height: aEl.height,
              zIndex: aEl.zIndex,
            } : {}),
            ...(opts.animation ? {
              animation: aEl.animation,
            } : {}),
            content: {
              ...tEl.content,
              style: opts.style ? aEl.content.style : tEl.content.style,
            }
          };
        }
        return tEl;
      });

      // Register new types to template that don't exist yet
      for (const aEl of activeSlide.elements) {
        const aTypeKey = aEl.role || (aEl.type === 'text' ? (isTitleElem(aEl) ? 'title' : 'bodyText') : aEl.type);
        const hasInTemplate = updatedTemplate.some(tEl => {
          const tTypeKey = tEl.role || (tEl.type === 'text' ? (isTitleElem(tEl) ? 'title' : 'bodyText') : tEl.type);
          return tTypeKey === aTypeKey;
        });
        if (!hasInTemplate) {
          updatedTemplate.push(JSON.parse(JSON.stringify(aEl)));
        }
      }
    }

    const newPresentation = { ...presentation, slides: updatedSlides };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPresentation);

    set({
      presentation: newPresentation,
      defaultSlideBackground: opts.background ? background : get().defaultSlideBackground,
      defaultTitleColor: opts.style && titleColor ? titleColor : get().defaultTitleColor,
      defaultBodyColor: opts.style && bodyColor ? bodyColor : get().defaultBodyColor,
      defaultSlideElementsTemplate: updatedTemplate,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  reorderSlides: (startIndex, endIndex) => {
    const { presentation, history, historyIndex } = get();
    const result = Array.from(presentation.slides);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    const newPresentation = { ...presentation, slides: result };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPresentation);

    set({
      presentation: newPresentation,
      currentSlideIndex: endIndex,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      set({
        presentation: history[prevIndex],
        historyIndex: prevIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({
        presentation: history[nextIndex],
        historyIndex: nextIndex,
      });
    }
  },

  applyLayoutToSlide: (slideId, layoutName) => {
    const { 
      presentation, 
      history, 
      historyIndex, 
      layoutPresets,
      defaultSlideBackground,
      defaultTitleColor,
      defaultBodyColor,
      defaultSlideElementsTemplate
    } = get();

    const activeSlide = presentation.slides.find((s) => s.id === slideId);
    const layout = layoutPresets.find((l) => l.name === layoutName);
    if (!activeSlide || !layout) return;

    const isTitleElem = (el: any) => {
      return el.role === 'title' || 
             el.content?.style?.fontWeight === '800' || 
             el.content?.style?.fontWeight === '700' || 
             parseFloat(el.content?.style?.fontSize || '0') >= 1.5;
    };

    // Find sample title and body styles from defaultSlideElementsTemplate or activeSlide
    const activeTitle = activeSlide.elements.find(el => el.type === 'text' && isTitleElem(el));
    const activeBody = activeSlide.elements.find(el => el.type === 'text' && !isTitleElem(el));

    const templateTitle = defaultSlideElementsTemplate?.find(el => el.type === 'text' && isTitleElem(el));
    const templateBody = defaultSlideElementsTemplate?.find(el => el.type === 'text' && !isTitleElem(el));

    const effectiveTitleStyle = templateTitle?.content?.style || activeTitle?.content?.style || {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: '800',
      color: defaultTitleColor || '#0a6ed1',
    };

    const effectiveBodyStyle = templateBody?.content?.style || activeBody?.content?.style || {
      fontFamily: 'Outfit, sans-serif',
      fontWeight: '400',
      color: defaultBodyColor || '#e2e8f0',
    };

    // Keep active slide's background if valid color/image, or fallback to defaultSlideBackground
    const effectiveBackground = activeSlide.background || defaultSlideBackground || { type: 'color', value: '#0f172a' };

    // Generate elements with new IDs from layout, adopting positions/disposition from layout preset,
    // BUT inheriting saved position/dimensions (x, y, width, height, zIndex) from defaultSlideElementsTemplate
    // as well as fonts, colors, and styling from current active pattern
    const newElements = layout.elements.map((el, idx) => {
      const isTitle = isTitleElem(el);
      const roleKey = el.role || (el.type === 'text' ? (isTitle ? 'title' : 'bodyText') : el.type);

      // Find matching saved element in defaultSlideElementsTemplate
      const savedTemplateElem = defaultSlideElementsTemplate?.find(tEl => {
        const tRoleKey = tEl.role || (tEl.type === 'text' ? (isTitleElem(tEl) ? 'title' : 'bodyText') : tEl.type);
        return tRoleKey === roleKey;
      });

      let posX = el.x;
      let posY = el.y;
      let posWidth = el.width;
      let posHeight = el.height;
      let posZIndex = el.zIndex;

      if (savedTemplateElem) {
        const sameTypeCountInLayout = layout.elements.filter(e => (e.role || (e.type === 'text' ? (isTitleElem(e) ? 'title' : 'bodyText') : e.type)) === roleKey).length;
        if (sameTypeCountInLayout === 1) {
          posX = savedTemplateElem.x;
          posY = savedTemplateElem.y;
          posWidth = savedTemplateElem.width;
          posHeight = savedTemplateElem.height;
          posZIndex = savedTemplateElem.zIndex;
        } else {
          // For multi-column layouts of same type: inherit Y, Height, zIndex from saved template
          posY = savedTemplateElem.y;
          posHeight = savedTemplateElem.height;
          posZIndex = savedTemplateElem.zIndex;
        }
      }

      const patternStyle = el.type === 'text' 
        ? { ...(isTitle ? effectiveTitleStyle : effectiveBodyStyle) }
        : {};

      // Blend layout preset styles with patternStyle taking priority for fontSize, color, fontFamily, etc.
      const finalStyle = {
        ...(el.content?.style || {}),
        ...patternStyle,
      };

      return {
        ...el,
        id: `elem-layout-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        x: posX,
        y: posY,
        width: posWidth,
        height: posHeight,
        zIndex: posZIndex,
        content: {
          ...el.content,
          style: finalStyle,
        }
      };
    });

    const updatedSlides = presentation.slides.map((s) => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        layoutName,
        background: effectiveBackground,
        elements: newElements
      };
    });

    const newPresentation = { ...presentation, slides: updatedSlides };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPresentation);

    set({
      presentation: newPresentation,
      selectedElementId: null,
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },

  updateLayoutPreset: (layoutName, elements) => {
    const { layoutPresets } = get();
    const isTitleElem = (el: any) => {
      return el.content.style?.fontWeight === '800' || 
             el.content.style?.fontWeight === '700' || 
             parseFloat(el.content.style?.fontSize || '0') >= 1.5;
    };
    const cleanElements = elements.map((el, idx) => ({
      ...el,
      id: `placeholder-${el.type}-${idx}`, // normalize ids for preset
      content: {
        ...el.content,
        // clear dynamic values for layout template
        src: el.type === 'image' || el.type === 'video' || el.type === 'audio' ? '' : el.content.src,
        text: el.type === 'text' ? (el.role === 'title' ? 'Título do Slide' : 'Adicione o texto principal aqui...') : el.content.text,
        sourceId: undefined
      }
    }));
    
    const updatedPresets = layoutPresets.map(l => {
      if (l.name === layoutName) {
        return { ...l, elements: cleanElements };
      }
      return l;
    });
    set({ layoutPresets: updatedPresets });
  },

  createLayoutPreset: (layoutName, elements) => {
    const { layoutPresets } = get();
    const cleanElements = elements.map((el, idx) => ({
      ...el,
      id: `placeholder-${el.type}-${idx}`,
      content: {
        ...el.content,
        src: el.type === 'image' || el.type === 'video' || el.type === 'audio' ? '' : el.content.src,
        text: el.type === 'text' ? (el.role === 'title' ? 'Título do Slide' : 'Adicione o texto principal aqui...') : el.content.text,
        sourceId: undefined
      }
    }));

    const newPreset: LayoutPreset = {
      name: layoutName,
      elements: cleanElements
    };
    
    const exists = layoutPresets.some(l => l.name === layoutName);
    const updatedPresets = exists 
      ? layoutPresets.map(l => l.name === layoutName ? newPreset : l)
      : [...layoutPresets, newPreset];
      
    set({ layoutPresets: updatedPresets });
  },

  applyColorPaletteToPresentation: (palette) => {
    const { presentation, history, historyIndex } = get();
    const isTitleElem = (el: any) => {
      return el.role === 'title' || 
             el.content.style?.fontWeight === '800' || 
             el.content.style?.fontWeight === '700' || 
             parseFloat(el.content.style?.fontSize || '0') >= 1.5;
    };

    const updatedSlides = presentation.slides.map((slide) => {
      const updatedElements = slide.elements.map((el) => {
        if (el.type === 'text') {
          const isTitle = isTitleElem(el);
          return {
            ...el,
            content: {
              ...el.content,
              style: {
                ...el.content.style,
                color: isTitle ? palette.titleColor : palette.bodyColor,
              }
            }
          };
        }
        return el;
      });

      return {
        ...slide,
        background: {
          type: 'color' as const,
          value: palette.background,
        },
        elements: updatedElements,
      };
    });

    const newPresentation = { ...presentation, slides: updatedSlides };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPresentation);

    set({
      presentation: newPresentation,
      defaultSlideBackground: { type: 'color', value: palette.background },
      defaultTitleColor: palette.titleColor,
      defaultBodyColor: palette.bodyColor,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  copyElementStyle: (slideId, elementId) => {
    const { presentation } = get();
    const activeSlide = presentation.slides.find((s) => s.id === slideId);
    const element = activeSlide?.elements.find((el) => el.id === elementId);
    if (!element) return;

    set({
      copiedElementStyle: {
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
        animation: element.animation ? { ...element.animation } : undefined,
        content: {
          style: element.content?.style ? { ...element.content.style } : undefined,
          mediaSettings: element.content?.mediaSettings ? { ...element.content.mediaSettings } : undefined,
        },
      },
    });
  },

  pasteElementStyle: (slideId, targetElementId) => {
    const { presentation, history, historyIndex, copiedElementStyle } = get();
    if (!copiedElementStyle) return;

    const activeSlide = presentation.slides.find((s) => s.id === slideId);
    const targetElement = activeSlide?.elements.find((el) => el.id === targetElementId);
    if (!activeSlide || !targetElement) return;

    const updatedElements = activeSlide.elements.map((el) => {
      if (el.id !== targetElementId) return el;

      return {
        ...el,
        width: copiedElementStyle.width ?? el.width,
        height: copiedElementStyle.height ?? el.height,
        zIndex: copiedElementStyle.zIndex ?? el.zIndex,
        animation: copiedElementStyle.animation ? { ...copiedElementStyle.animation } : el.animation,
        content: {
          ...el.content,
          style: copiedElementStyle.content?.style
            ? { ...(el.content.style || {}), ...copiedElementStyle.content.style }
            : el.content.style,
          mediaSettings: copiedElementStyle.content?.mediaSettings
            ? { ...(el.content.mediaSettings || {}), ...copiedElementStyle.content.mediaSettings }
            : el.content.mediaSettings,
        },
      };
    });

    const updatedSlides = presentation.slides.map((s) => (s.id === slideId ? { ...s, elements: updatedElements } : s));
    const newPresentation = { ...presentation, slides: updatedSlides };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPresentation);

    set({
      presentation: newPresentation,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
}));
