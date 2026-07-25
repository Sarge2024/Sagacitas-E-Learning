import { create } from 'zustand';
import { ViewMode } from '../types';

interface NavigationState {
  currentView: ViewMode;
  isSidebarCollapsed: boolean;
  managerActiveTab: 'students' | 'trainings' | 'certificates' | 'settings' | 'logs';
  expertActiveTab: 'ucs' | 'bloom' | 'reverse' | 'dnt' | 'synthesis' | 'multitenant' | 'settings' | 'users';
  searchQuery: string;

  // Actions
  setView: (view: ViewMode, subTab?: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setManagerTab: (tab: NavigationState['managerActiveTab']) => void;
  setExpertTab: (tab: NavigationState['expertActiveTab']) => void;
  setSearchQuery: (query: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentView: 'dashboard',
  isSidebarCollapsed: false,
  managerActiveTab: 'students',
  expertActiveTab: 'ucs',
  searchQuery: '',

  setView: (view, subTab) => set((state) => {
    const updates: Partial<NavigationState> = { currentView: view };
    
    if (view === 'manager' && subTab) {
      updates.managerActiveTab = subTab as NavigationState['managerActiveTab'];
    }
    if (view === 'expert' && subTab) {
      updates.expertActiveTab = subTab as NavigationState['expertActiveTab'];
    }
    if (view === 'lesson') {
      updates.isSidebarCollapsed = true;
    }
    
    // Auto scroll to top
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    return updates;
  }),

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  setManagerTab: (tab) => set({ managerActiveTab: tab }),

  setExpertTab: (tab) => set({ expertActiveTab: tab }),

  setSearchQuery: (query) => set((state) => {
    const updates: Partial<NavigationState> = { searchQuery: query };
    if (state.currentView !== 'courses' && query.trim().length > 0) {
      updates.currentView = 'courses';
    }
    return updates;
  })
}));
