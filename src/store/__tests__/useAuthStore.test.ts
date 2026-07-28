import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../useAuthStore';
import { OAuthUser } from '../../types';

describe('useAuthStore', () => {
  const mockUser: OAuthUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'Visitante',
    provider: 'local',
    avatar: 'https://ui-avatars.com/api/?name=Test+User',
    authenticatedAt: new Date().toISOString()
  };

  const adminUser: OAuthUser = {
    id: '999',
    email: 'admin.master@sagacitas.com.br',
    name: 'Admin',
    role: 'Visitante', // The store should upgrade this to Administrador based on email
    provider: 'google',
    avatar: 'https://example.com/avatar.png',
    authenticatedAt: new Date().toISOString()
  };

  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({ oauthUser: null, simulatedUser: null, isAuthenticated: false });
  });

  it('should initialize with no user', () => {
    const state = useAuthStore.getState();
    expect(state.oauthUser).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set OAuth user and apply default RBAC permissions if missing', () => {
    useAuthStore.getState().setOauthUser(mockUser);
    const state = useAuthStore.getState();
    
    expect(state.isAuthenticated).toBe(true);
    expect(state.oauthUser?.email).toBe('test@example.com');
    // Ensure permissions were attached
    expect(state.oauthUser?.permissions).toBeDefined();
    expect(state.oauthUser?.permissionsHash).toBeDefined();
    expect(state.oauthUser?.permissions?.length).toBeGreaterThan(0);
  });

  it('should automatically upgrade seed admin emails to Administrador role', () => {
    useAuthStore.getState().setOauthUser(adminUser);
    const state = useAuthStore.getState();
    
    expect(state.oauthUser?.role).toBe('Admin Master');
    expect(state.oauthUser?.permissionsHash?.['expert']?.u).toBe(true);
  });

  it('should logout correctly', () => {
    useAuthStore.getState().setOauthUser(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.oauthUser).toBeNull();
  });

  it('checkViewPermission should allow public views even for Visitante', () => {
    useAuthStore.getState().setOauthUser(mockUser);
    const hasAccess = useAuthStore.getState().checkViewPermission('courses');
    expect(hasAccess).toBe(true);
  });

  it('checkViewPermission should deny restricted views for Visitante', () => {
    useAuthStore.getState().setOauthUser(mockUser);
    const hasAccess = useAuthStore.getState().checkViewPermission('expert');
    expect(hasAccess).toBe(false);
  });
});
