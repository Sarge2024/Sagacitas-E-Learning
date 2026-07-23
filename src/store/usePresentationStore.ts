import { create } from 'zustand';
import { Presentation, Slide, SlideElement, ElementAnimation } from '../types/presentation';

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
          type: 'quiz',
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
  isPlaying: boolean;
  history: Presentation[];
  historyIndex: number;

  // Actions
  setPresentation: (presentation: Presentation) => void;
  setMode: (mode: 'editor' | 'player') => void;
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
  updateSlideBackground: (slideId: string, background: { type: 'color' | 'image'; value: string }) => void;
  reorderSlides: (startIndex: number, endIndex: number) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  presentation: SAMPLE_PRESENTATION,
  currentSlideIndex: 0,
  selectedElementId: null,
  mode: 'player',
  isPlaying: false,
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

  // Editor updates helper with undo history
  updateElement: (slideId, elementId, patch) => {
    const { presentation, history, historyIndex } = get();
    const updatedSlides = presentation.slides.map((s) => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        elements: s.elements.map((el) => (el.id === elementId ? { ...el, ...patch } : el)),
      };
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
    const { presentation } = get();
    const slide = presentation.slides.find((s) => s.id === slideId);
    if (!slide) return;
    const element = slide.elements.find((e) => e.id === elementId);
    if (!element) return;

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
    const { presentation, history, historyIndex } = get();
    const updatedSlides = presentation.slides.map((s) => (s.id === slideId ? { ...s, background } : s));
    const newPresentation = { ...presentation, slides: updatedSlides };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPresentation);

    set({
      presentation: newPresentation,
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
}));
