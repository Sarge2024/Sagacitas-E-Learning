import { SystemPermission, PermissionHash } from '../types';

export const RESOURCES = [
  { id: 'dashboard', name: 'Dashboard', type: 'ui' as const },
  { id: 'reports', name: 'Relatórios (Menu)', type: 'ui' as const },
  { id: 'rep-performance', name: '↳ Desempenho de Alunos', type: 'report' as const },
  { id: 'rep-completion', name: '↳ Conclusão de Treinamentos', type: 'report' as const },
  { id: 'rep-ia', name: '↳ Engajamento & Tutor de IA', type: 'report' as const },
  { id: 'rep-finance', name: '↳ Financeiro & Faturamento', type: 'report' as const },
  { id: 'courses', name: 'Courses', type: 'ui' as const },
  { id: 'lesson', name: 'My Classes', type: 'ui' as const },
  { id: 'assignments', name: 'Assignments', type: 'ui' as const },
  { id: 'calendar', name: 'Calendar', type: 'ui' as const },
  { id: 'expert', name: 'Núcleo Expert', type: 'ui' as const },
  { id: 'expert-ucs', name: '↳ Unidades Atômicas', type: 'ui' as const },
  { id: 'expert-bloom', name: '↳ Taxonomia de Bloom', type: 'ui' as const },
  { id: 'expert-reverse', name: '↳ Engenharia Reversa', type: 'ui' as const },
  { id: 'expert-dnt', name: '↳ Diagnóstico DNT', type: 'ui' as const },
  { id: 'expert-synthesis', name: '↳ Projetos de Síntese', type: 'ui' as const },
  { id: 'expert-multitenant', name: '↳ API Headless', type: 'ui' as const },
  { id: 'expert-settings', name: '↳ Configurações Globais', type: 'ui' as const },
  { id: 'expert-users', name: '↳ Controle de Acessos', type: 'ui' as const },
  { id: 'instructor-portfolio', name: 'Carteira do Instrutor', type: 'ui' as const },
  { id: 'manager-trainings', name: 'Gestão de Cursos', type: 'ui' as const },
  { id: 'manager-students-menu', name: 'Menu Alunos', type: 'ui' as const },
  { id: 'manager-students', name: '↳ Alunos', type: 'ui' as const },
  { id: 'manager-certificates', name: '↳ Certificados', type: 'ui' as const },
  { id: 'manager-companies', name: '↳ Empresas', type: 'ui' as const },
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
        if (['dashboard', 'courses'].includes(res.id)) r = true;
        break;
      
      case 'Aluno':
        if (['dashboard', 'courses', 'lesson', 'assignments'].includes(res.id)) r = true;
        break;

      case 'Instrutor':
        if (['dashboard', 'reports', 'courses', 'lesson', 'assignments', 'calendar'].includes(res.id)) {
          r = true;
        }
        if (['rep-performance', 'rep-completion', 'rep-ia'].includes(res.id)) {
          r = true;
        }
        if (res.id === 'instructor-portfolio' || res.id.startsWith('expert')) {
          c = true; r = true; u = true; d = true;
        }
        break;

      case 'Gestor':
        if (['dashboard', 'courses', 'lesson', 'assignments', 'calendar', 'instructor-portfolio'].includes(res.id)) {
          r = true;
        }
        if (res.id === 'reports' || res.id.startsWith('rep-') || res.id.startsWith('manager-')) {
          c = true; r = true; u = true; d = true;
        }
        if (res.id.startsWith('expert')) {
          r = true;
        }
        break;

      case 'Administrador':
        c = true; r = true; u = true; d = true;
        break;
    }

    hash[res.id] = { c, r, u, d };
  });

  return hash;
};
