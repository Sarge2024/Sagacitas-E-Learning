import { SystemPermission, PermissionHash } from '../types';

export const RESOURCES = [
  { id: 'dre-simulator', name: 'Simulador de DRE', type: 'ui' as const },
  { id: 'matrix', name: 'Matriz de Rituais DRE', type: 'ui' as const },
  { id: 'courses', name: 'Central de Cursos', type: 'ui' as const },
  { id: 'expert', name: 'Núcleo Expert', type: 'ui' as const },
  { id: 'instructor-portfolio', name: 'Carteira do Instrutor', type: 'ui' as const },
  { id: 'rep-performance', name: 'Desempenho de Alunos', type: 'report' as const },
  { id: 'rep-completion', name: 'Conclusão de Treinamentos', type: 'report' as const },
  { id: 'rep-ia', name: 'Engajamento & Tutor de IA', type: 'report' as const },
  { id: 'rep-finance', name: 'Financeiro & Faturamento', type: 'report' as const },
];

export type UserRole = 'Visitante' | 'Aluno' | 'Instrutor' | 'Gestor' | 'Administrador';

export const getPermissionsForRole = (role: string): SystemPermission[] => {
  const hash = getPermissionsHashForRole(role);
  return RESOURCES.map(res => ({
    resourceId: res.id,
    resourceName: res.name,
    resourceType: res.type,
    ...hash[res.id]
  }));
};

export const getPermissionsHashForRole = (role: string): PermissionHash => {
  const hash: PermissionHash = {};
  
  RESOURCES.forEach(res => {
    let c = false, r = false, u = false, d = false;

    switch (role) {
      case 'Visitante':
        // Visitante: Apenas leitura na Central de Cursos
        if (res.id === 'courses') r = true;
        break;
      
      case 'Aluno':
        // Aluno: Apenas leitura (R) em ferramentas de aprendizado
        if (['courses', 'dre-simulator'].includes(res.id)) r = true;
        break;

      case 'Instrutor':
        // Instrutor: Acesso em leitura na matriz, cursos, desempenho
        // Acesso total (CRUD) em sua própria carteira e núcleo expert (parcial)
        if (['matrix', 'courses', 'rep-performance', 'rep-completion'].includes(res.id)) {
          r = true;
        }
        if (res.id === 'instructor-portfolio') {
          c = true; r = true; u = true; d = true;
        }
        if (res.id === 'expert') {
          c = true; r = true; u = true;
        }
        break;

      case 'Gestor':
        // Gestor: Leitura em quase tudo, CRUD em relatórios
        if (['dre-simulator', 'matrix', 'courses', 'expert', 'instructor-portfolio'].includes(res.id)) {
          r = true;
        }
        if (['rep-performance', 'rep-completion', 'rep-ia'].includes(res.id)) {
          c = true; r = true; u = true; d = true;
        }
        break;

      case 'Administrador':
        // Master Admin tem poder absoluto sobre a UI inteira
        c = true; r = true; u = true; d = true;
        break;
    }

    hash[res.id] = { c, r, u, d };
  });

  return hash;
};
