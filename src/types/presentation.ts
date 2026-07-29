export type ElementType = 'text' | 'image' | 'video' | 'audio' | 'question' | 'simulation';

export interface ElementAnimation {
  effect: 'fadeIn' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'custom';
  duration: number; // em segundos
  delay: number;    // em segundos
  order: number;    // ordem na timeline do GSAP
}

export interface SlideElement {
  id: string;
  type: ElementType;
  x: number;      // Posição % em relação à largura do container
  y: number;      // Posição % em relação à altura do container
  width: number;  // Largura em %
  height: number; // Altura em %
  zIndex: number;
  role?: string;  // Papel semântico do widget (ex: 'title', 'bodyText', 'caption')
  content: {
    sourceId?: string;
    text?: string;
    style?: Record<string, string>; // Classes Tailwind ou estilos embutidos
    src?: string;                   // URL de imagem/vídeo
    alt?: string;                   // Texto alternativo para acessibilidade (WCAG)
    quizData?: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    };
    widgetComponent?: string;       // ex: "DRESimulatorWidget"
    mediaSettings?: {
      autoPlay?: boolean;
      loop?: boolean;
      controls?: boolean;
    };
  };
  animation?: ElementAnimation;
}

export interface Slide {
  id: string;
  title: string;
  background: {
    type: 'color' | 'image';
    value: string;
    pattern?: string;
  };
  elements: SlideElement[];
  aula_group?: number;
  layoutName?: string; // Nome do layout de container ativo no slide
}

export interface LayoutPreset {
  name: string;
  elements: SlideElement[];
}

export interface ColorPalette {
  id: string;
  name: string;
  background: string;
  titleColor: string;
  bodyColor: string;
  accentColor: string;
}

export interface Presentation {
  id: string;
  title: string;
  aspectRatio: '16:9' | '4:3';
  slides: Slide[];
}
