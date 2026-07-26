import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OAuthUser } from '../types';
import { getPermissionsForRole, getPermissionsHashForRole } from '../utils/rbac';

interface AuthState {
  oauthUser: OAuthUser | null;
  simulatedUser: OAuthUser | null;
  isAuthenticated: boolean;
  
  // Actions
  setOauthUser: (user: OAuthUser | null) => void;
  setSimulatedUser: (user: OAuthUser | null) => void;
  logout: () => void;
  getActiveUser: () => OAuthUser | null;
  checkViewPermission: (viewId: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      oauthUser: null,
      simulatedUser: null,
      isAuthenticated: false,

      setOauthUser: (user) => {
        if (!user) {
          set({ oauthUser: null, isAuthenticated: false, simulatedUser: null });
          return;
        }

        // Apply RBAC defaults if missing
        const processedUser = { ...user };
        const lowerEmail = (user.email || '').toLowerCase();
        
        const isMasterAdmin = 
          lowerEmail === 'admin.master@sagacitas.com.br' || 
          lowerEmail === 'sagacitas.assessoria@gmail.com' || 
          lowerEmail === 'gabriel.mendes@sagacitas.edu.br' || 
          lowerEmail === 'sergio.stulzer@sagacitas.com.br';
          
        if (isMasterAdmin || processedUser.role === 'Administrador') {
          processedUser.role = 'Administrador';
          processedUser.permissionsHash = getPermissionsHashForRole('Administrador');
          processedUser.permissions = getPermissionsForRole('Administrador'); // keep legacy
        } else if (processedUser.role && (!processedUser.permissionsHash || Object.keys(processedUser.permissionsHash).length === 0)) {
          processedUser.permissionsHash = getPermissionsHashForRole(processedUser.role);
          processedUser.permissions = getPermissionsForRole(processedUser.role); // keep legacy
        }

        set({ oauthUser: processedUser, isAuthenticated: true });
      },

      setSimulatedUser: (user) => set({ simulatedUser: user }),
      
      logout: () => set({ oauthUser: null, simulatedUser: null, isAuthenticated: false }),
      
      getActiveUser: () => get().simulatedUser || get().oauthUser,

      checkViewPermission: (viewId) => {
        const activeUser = get().getActiveUser();
        if (!activeUser) return true;
        if (activeUser.role === 'Administrador') return true;
        
        const publicViews = ['profile'];
        if (publicViews.includes(viewId)) return true;

        if (!activeUser.permissionsHash) {
          // Fallback if user only has legacy array
          if (activeUser.permissions) {
             const legacyPerm = activeUser.permissions.find(p => p.resourceId === viewId);
             return legacyPerm ? legacyPerm.r : false;
          }
          return true;
        }
        const perm = activeUser.permissionsHash[viewId];
        return perm ? perm.r : false;
      }
    }),
    {
      name: 'sagacitas-auth-store', // name of item in the storage (must be unique)
      partialize: (state) => ({ oauthUser: state.oauthUser, isAuthenticated: state.isAuthenticated }), // Only persist these
    }
  )
);
