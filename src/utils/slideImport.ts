import { Presentation, Slide, SlideElement } from '../types/presentation';

/**
 * Converte um array de URLs/Base64 de imagens de slides em uma estrutura Presentation válida.
 * Define a imagem como plano de fundo limpo do slide.
 */
export function importSlidesFromImages(images: string[], title = 'Treinamento Importado de Slides'): Presentation {
  const slides: Slide[] = images.map((imgUrl, index) => ({
    id: `slide-imported-${index + 1}-${Date.now()}`,
    title: `Slide ${index + 1}`,
    background: {
      type: 'image',
      value: imgUrl,
    },
    elements: [],
  }));

  return {
    id: `pres-imported-${Date.now()}`,
    title,
    aspectRatio: '16:9',
    slides,
  };
}

/**
 * Interface Mock de IA/OCR para identificar caixas de texto na imagem do slide
 * e gerar automaticamente elementos SlideElement (type="text") sobrepostos.
 */
export async function analyzeSlideImage(imageUri: string): Promise<SlideElement[]> {
  // Simula latência de análise de IA/OCR
  await new Promise((resolve) => setTimeout(resolve, 600));

  return [
    {
      id: `elem-ocr-title-${Date.now()}`,
      type: 'text',
      x: 8,
      y: 10,
      width: 84,
      height: 18,
      zIndex: 10,
      content: {
        text: '📌 Título Detectado por IA',
        style: {
          fontSize: '1.8rem',
          fontWeight: '800',
          color: '#0a6ed1',
          backgroundColor: 'rgba(28, 34, 43, 0.9)',
          padding: '12px',
          borderRadius: '10px',
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
      id: `elem-ocr-body-${Date.now()}`,
      type: 'text',
      x: 8,
      y: 35,
      width: 84,
      height: 25,
      zIndex: 10,
      content: {
        text: 'Caixa de texto extraída da imagem para edição interativa e tradução direta no player.',
        style: {
          fontSize: '1rem',
          lineHeight: '1.6',
          color: '#f8fafc',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          padding: '12px',
          borderRadius: '10px',
        },
      },
      animation: {
        effect: 'slideRight',
        duration: 0.8,
        delay: 0.6,
        order: 2,
      },
    },
  ];
}
