import { create } from 'zustand';
import { ViewMode } from '../types';

interface NavigationState {
  currentView: ViewMode;
  isSidebarCollapsed: boolean;
  managerActiveTab: 'students' | 'trainings' | 'certificates' | 'companies' | 'settings' | 'logs';
  expertActiveTab: 'ucs' | 'bloom' | 'reverse' | 'dnt' | 'dnt-test' | 'synthesis' | 'multitenant' | 'settings' | 'users';
  reportsActiveTab: string | null;
  searchQuery: string;

  // Actions
  setView: (view: ViewMode, subTab?: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setManagerTab: (tab: NavigationState['managerActiveTab']) => void;
  setExpertTab: (tab: NavigationState['expertActiveTab']) => void;
  setReportsTab: (tab: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentView: 'dashboard',
  isSidebarCollapsed: false,
  managerActiveTab: 'students',
  expertActiveTab: 'ucs',
  reportsActiveTab: null,
  searchQuery: '',

  setView: (view, subTab) => set((state) => {
    const updates: Partial<NavigationState> = { currentView: view };
    
    if (view === 'manager' && subTab) {
      updates.managerActiveTab = subTab as NavigationState['managerActiveTab'];
    }
    if (view === 'expert' && subTab) {
      updates.expertActiveTab = subTab as NavigationState['expertActiveTab'];
    }
    if (view === 'reports') {
      if (subTab) {
        updates.reportsActiveTab = subTab;
      } else {
        updates.reportsActiveTab = null;
      }
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

  setReportsTab: (tab) => set({ reportsActiveTab: tab }),

  setSearchQuery: (query) => set((state) => {
    const updates: Partial<NavigationState> = { searchQuery: query };
    if (state.currentView !== 'courses' && query.trim().length > 0) {
      updates.currentView = 'courses';
    }
    return updates;
  })
}));
