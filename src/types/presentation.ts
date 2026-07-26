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
  content: {
    text?: string;
    style?: Record<string, string>; // Classes Tailwind ou estilos embutidos
    src?: string;                   // URL de imagem/vídeo
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
  };
  elements: SlideElement[];
  aula_group?: number;
}

export interface Presentation {
  id: string;
  title: string;
  aspectRatio: '16:9' | '4:3';
  slides: Slide[];
}
