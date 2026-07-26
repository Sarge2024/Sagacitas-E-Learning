import { BloomLevel } from '../types/edtechExpert';

/**
 * PMESTGeneratorService
 * Automatiza a geração de notações PMEST (Personalidade, Matéria, Energia, Espaço, Tempo)
 * baseadas no modelo de Ranganathan.
 */
export class PMESTGeneratorService {
  
  /**
   * Converte uma string genérica em um slug de 3 a 4 letras em caixa alta.
   */
  private static tokenize(text: string, fallback: string = 'GEN'): string {
    if (!text || text.trim() === '') return fallback;
    const clean = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (clean.length === 0) return fallback;
    if (clean.length <= 4) return clean;
    // Pega primeira letra + algumas consoantes para parecer abreviação
    const consonants = clean.substring(1).replace(/[AEIOU]/g, '');
    if (consonants.length >= 2) {
      return (clean[0] + consonants.substring(0, 2)).substring(0, 4);
    }
    return clean.substring(0, 3);
  }

  /**
   * Mapeia o nível de Bloom (Energia) para o código BLx
   */
  private static bloomToCode(bloom: BloomLevel | number): string {
    if (typeof bloom === 'number') {
      return `BL${bloom}`;
    }
    switch (bloom) {
      case 'CONHECIMENTO': return 'BL1';
      case 'COMPREENSAO': return 'BL2';
      case 'APLICACAO_SIMPLES': return 'BL3';
      case 'APLICACAO_MEDIO': return 'BL3';
      case 'APLICACAO_COMPLEXO': return 'BL3';
      case 'ANALISE': return 'BL4';
      case 'SINTESE': return 'BL5';
      case 'AVALIACAO': return 'BL6';
      default: return 'BL2';
    }
  }

  /**
   * Gera o código PMEST base da UC.
   * Formato: P-M-E-S-T
   * 
   * @param area Área/Categoria mãe (Personalidade)
   * @param topic Tópico específico da UC (Matéria)
   * @param bloom Nível de Taxonomia (Energia)
   * @param context Público/Tenant/Contexto (Espaço)
   * @param durationMin Duração Estimada em minutos (Tempo)
   */
  public static generateBaseSignature(
    area: string,
    topic: string,
    bloom: BloomLevel | number,
    context: string,
    durationMin: number
  ): string {
    if (!area && !topic && !context && !durationMin) {
      return '';
    }

    const p = this.tokenize(area, 'GEN');
    const m = this.tokenize(topic, 'TOP');
    const e = this.bloomToCode(bloom);
    const s = this.tokenize(context, 'GLB');
    const t = durationMin > 0 ? `${durationMin}M` : '0M';

    return `${p}-${m}-${e}-${s}-${t}`;
  }

  public static codeToBloom(code: string): BloomLevel {
    switch (code) {
      case 'BL1': return 'CONHECIMENTO';
      case 'BL2': return 'COMPREENSAO';
      case 'BL3': return 'APLICACAO_SIMPLES'; // Assumimos SIMPLES para simplificar reversão
      case 'BL4': return 'ANALISE';
      case 'BL5': return 'SINTESE';
      case 'BL6': return 'AVALIACAO';
      default: return 'COMPREENSAO';
    }
  }

  public static parseSignature(code: string): {
    area: string;
    topic: string;
    bloom: BloomLevel;
    context: string;
    durationMin: number;
  } | null {
    if (!code) return null;
    const parts = code.split('-');
    if (parts.length < 5) return null;
    
    const p = parts[0];
    const m = parts[1];
    const e = parts[2];
    const s = parts[3];
    const t = parts[4];

    const bloom = this.codeToBloom(e);
    const duration = parseInt(t.replace('M', ''), 10) || 0;

    return {
      area: p,
      topic: m, // Token tokenizado, será injetado no form
      bloom: bloom,
      context: s,
      durationMin: duration
    };
  }
}
