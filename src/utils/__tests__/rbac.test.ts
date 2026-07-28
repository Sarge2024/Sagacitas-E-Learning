import { describe, it, expect } from 'vitest';
import { getPermissionsForRole } from '../rbac';

describe('RBAC System - getPermissionsForRole', () => {
  it('should return read-only limited permissions for Visitante', () => {
    const permissions = getPermissionsForRole('Visitante');
    
    // Visitante shouldn't have access to expert tools
    const expertPerm = permissions.find(p => p.resourceId === 'expert');
    expect(expertPerm?.r).toBe(false);
    expect(expertPerm?.u).toBe(false);

    // Visitante SHOULD have read access to courses
    const coursesPerm = permissions.find(p => p.resourceId === 'courses');
    expect(coursesPerm?.r).toBe(true);
    expect(coursesPerm?.u).toBe(false);
  });

  it('should return read permissions for Aluno on student resources', () => {
    const permissions = getPermissionsForRole('Aluno');
    
    // Aluno SHOULD access courses, dre-simulator, matrix
    const coursesPerm = permissions.find(p => p.resourceId === 'courses');
    expect(coursesPerm?.r).toBe(true);
    expect(coursesPerm?.c).toBe(false);
    
    const expertPerm = permissions.find(p => p.resourceId === 'expert');
    expect(expertPerm?.r).toBe(false);
  });

  it('should return read/update permissions for Instrutor on instructor resources', () => {
    const permissions = getPermissionsForRole('Instrutor');
    
    const portfolioPerm = permissions.find(p => p.resourceId === 'instructor-portfolio');
    expect(portfolioPerm?.r).toBe(true);
    expect(portfolioPerm?.u).toBe(true);
    expect(portfolioPerm?.c).toBe(true);

    const expertPerm = permissions.find(p => p.resourceId === 'expert');
    expect(expertPerm?.r).toBe(true);
    expect(expertPerm?.u).toBe(true);
  });

  it('should return read/update permissions for Gestor on manager resources', () => {
    const permissions = getPermissionsForRole('Gestor');
    
    const coursesPerm = permissions.find(p => p.resourceId === 'courses');
    expect(coursesPerm?.r).toBe(true);
    expect(coursesPerm?.u).toBe(false);

    const expertPerm = permissions.find(p => p.resourceId === 'expert');
    expect(expertPerm?.r).toBe(true);
    expect(expertPerm?.u).toBe(false);
    
    const performanceRepPerm = permissions.find(p => p.resourceId === 'rep-performance');
    expect(performanceRepPerm?.u).toBe(true);
  });

  it('should return full access for Admin Master', () => {
    const permissions = getPermissionsForRole('Admin Master');

    expect(permissions.every(p => p.r && p.c && p.u && p.d)).toBe(true);
  });
});
