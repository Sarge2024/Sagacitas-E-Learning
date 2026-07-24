import { UnidadeConhecimento, BloomLevel, MatrizCompetencia } from '../types/edtechExpert';
import { Course, Module, Lesson } from '../types';

// Ordem dos níveis de Bloom para progressão pedagógica lógica
const BLOOM_ORDER: Record<BloomLevel, number> = {
  'CONHECIMENTO': 1,
  'COMPREENSAO': 2,
  'APLICACAO_SIMPLES': 3,
  'APLICACAO_MEDIO': 4,
  'APLICACAO_COMPLEXO': 5,
  'ANALISE': 6,
  'AVALIACAO': 7,
  'SINTESE': 8,
};

export class CourseGeneratorService {
  /**
   * Ordena as Unidades de Conhecimento com base na progressão pedagógica da Taxonomia de Bloom
   */
  static ordenarUnidadesPorBloom(unidades: UnidadeConhecimento[]): UnidadeConhecimento[] {
    return [...unidades].sort((a, b) => {
      const orderA = BLOOM_ORDER[a.meta_bloom] || 0;
      const orderB = BLOOM_ORDER[b.meta_bloom] || 0;
      return orderA - orderB;
    });
  }

  /**
   * Gera um Curso completo (Engenharia Reversa: Habilidades -> UCs -> Curso Automatizado)
   */
  static gerarCursoEngenhariaReversa(
    competencia: MatrizCompetencia,
    unidadesSelecionadas: UnidadeConhecimento[]
  ): Course {
    const unidadesOrdenadas = this.ordenarUnidadesPorBloom(unidadesSelecionadas);
    
    // Agrupa UCs por fase cognitiva em módulos
    const moduloBasicoLessons: Lesson[] = [];
    const moduloAplicacaoLessons: Lesson[] = [];
    const moduloAvancadoLessons: Lesson[] = [];

    unidadesOrdenadas.forEach((uc, index) => {
      const lesson: Lesson = {
        id: `gen-les-${uc.id}`,
        number: String(index + 1).padStart(2, '0'),
        title: uc.titulo,
        duration: `${uc.duracao_estimada_minutos} min`,
        completed: false,
        active: index === 0,
        description: uc.descricao_curta,
      };

      const order = BLOOM_ORDER[uc.meta_bloom];
      if (order <= 2) {
        moduloBasicoLessons.push(lesson);
      } else if (order <= 5) {
        moduloAplicacaoLessons.push(lesson);
      } else {
        moduloAvancadoLessons.push(lesson);
      }
    });

    const modules: Module[] = [];
    
    if (moduloBasicoLessons.length > 0) {
      modules.push({
        id: 'mod-basico',
        title: 'Módulo 1: Fundamentos & Níveis Básicos de Bloom',
        focus: 'Conhecimento & Compreensão',
        lessons: moduloBasicoLessons,
      });
    }

    if (moduloAplicacaoLessons.length > 0) {
      modules.push({
        id: 'mod-aplicacao',
        title: 'Módulo 2: Aplicação Operacional Prática',
        focus: 'Aplicação Simples, Média e Complexa',
        lessons: moduloAplicacaoLessons,
      });
    }

    if (moduloAvancadoLessons.length > 0) {
      modules.push({
        id: 'mod-avancado',
        title: 'Módulo 3: Análise, Avaliação & Síntese Prática',
        focus: 'Análise, Avaliação e Projeto de Inovação',
        lessons: moduloAvancadoLessons,
      });
    }

    const duracaoTotal = unidadesSelecionadas.reduce((acc, u) => acc + u.duracao_estimada_minutos, 0);

    return {
      id: `course-gen-${Date.now()}`,
      title: `Curso Automatizado: ${competencia.nome}`,
      category: competencia.cargo_alvo || 'Gestão Corporativa',
      course_code: `ENG-REV-${competencia.codigo}`,
      description: `Curso estruturado automaticamente via Engenharia Reversa para a matriz de competência ${competencia.codigo}.`,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
      level: 'Intermediário',
      progress: 0,
      totalHours: `${Math.round(duracaoTotal / 60 * 10) / 10}h`,
      totalLessons: unidadesSelecionadas.length,
      completedLessons: 0,
      status: 'active',
      modules: modules,
    };
  }
}
