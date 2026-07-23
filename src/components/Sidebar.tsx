import React, { useState } from 'react';
import { ViewMode } from '../types';
import {
  LayoutDashboard,
  GraduationCap,
  User,
  Sparkles,
  Calculator,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  Inbox,
  HelpCircle,
  ShieldCheck,
  Users,
  BookOpen,
  Award,
  Sliders,
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  managerActiveTab?: string;
  onSelectView: (view: ViewMode, managerTab?: string) => void;
  onOpenProModal: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  pendingQuestionsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  managerActiveTab = 'students',
  onSelectView,
  onOpenProModal,
  isCollapsed = false,
  onToggleCollapse,
  pendingQuestionsCount = 1,
}) => {
  const [isManagerMenuOpen, setIsManagerMenuOpen] = useState(true);
  return (
    <aside
      id="main-sidebar"
      className={`fixed left-0 top-0 h-full flex flex-col border-r border-white/10 bg-[#0b1326]/90 backdrop-blur-xl z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header with Title and Toggle Button */}
      <div className={`p-4 flex items-center justify-between border-b border-white/10 ${isCollapsed ? 'flex-col gap-2' : ''}`}>
        {!isCollapsed ? (
          <div>
            <h1 className="text-lg font-extrabold text-[#dae2fd] tracking-tight truncate">
              Sagacitas E-Learning
            </h1>
            <p className="text-[10px] text-[#2fd9f4] font-bold tracking-widest uppercase mt-0.5">
              Alchymist Manager
            </p>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2fd9f4] to-[#8083ff] flex items-center justify-center font-black text-black text-base shadow-lg shadow-[#2fd9f4]/20" title="Sagacitas E-Learning">
            S
          </div>
        )}

        {onToggleCollapse && (
          <button
            id="toggle-sidebar-btn"
            onClick={onToggleCollapse}
            className="p-2 text-[#c7c4d7] hover:text-[#2fd9f4] hover:bg-white/10 rounded-xl transition-all"
            title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-2 mt-4" id="sidebar-nav">
        <button
          id="nav-dashboard-btn"
          onClick={() => onSelectView('dashboard')}
          title={isCollapsed ? 'Dashboard' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'dashboard'
              ? 'text-[#2fd9f4] border-l-4 border-[#2fd9f4] bg-white/5 font-semibold shadow-[0_0_15px_rgba(47,217,244,0.15)]'
              : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium truncate">Dashboard</span>}
        </button>

        <button
          id="nav-courses-btn"
          onClick={() => onSelectView('courses')}
          title={isCollapsed ? 'Cursos & Treinamentos' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'courses' || currentView === 'lesson'
              ? 'text-[#2fd9f4] border-l-4 border-[#2fd9f4] bg-white/5 font-semibold shadow-[0_0_15px_rgba(47,217,244,0.15)]'
              : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
          }`}
        >
          <GraduationCap className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium truncate">Cursos & Treinamentos</span>}
        </button>

        <button
          id="nav-dre-simulator-btn"
          onClick={() => onSelectView('dre-simulator')}
          title={isCollapsed ? 'Simulador DRE' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'dre-simulator'
              ? 'text-[#2fd9f4] border-l-4 border-[#2fd9f4] bg-white/5 font-semibold shadow-[0_0_15px_rgba(47,217,244,0.15)]'
              : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
          }`}
        >
          <Calculator className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium truncate">Simulador DRE</span>}
        </button>

        <button
          id="nav-matrix-btn"
          onClick={() => onSelectView('matrix')}
          title={isCollapsed ? 'Matriz & Ritual DRE' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'matrix'
              ? 'text-[#2fd9f4] border-l-4 border-[#2fd9f4] bg-white/5 font-semibold shadow-[0_0_15px_rgba(47,217,244,0.15)]'
              : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium truncate">Matriz & Ritual DRE</span>}
        </button>

        <button
          id="nav-instructor-portfolio-btn"
          onClick={() => onSelectView('instructor-portfolio')}
          title={isCollapsed ? 'Carteira do Instrutor' : undefined}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'instructor-portfolio'
              ? 'text-[#2fd9f4] border-l-4 border-[#2fd9f4] bg-white/5 font-semibold shadow-[0_0_15px_rgba(47,217,244,0.15)]'
              : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Inbox className="w-5 h-5 shrink-0 text-[#8083ff]" />
            {!isCollapsed && <span className="text-sm font-medium truncate">Carteira do Instrutor</span>}
          </div>
          {!isCollapsed && pendingQuestionsCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-slate-950 font-mono shadow-xs">
              {pendingQuestionsCount}
            </span>
          )}
        </button>

        {/* Menu Gestor with expandable submenus */}
        <div className="space-y-1">
          <button
            id="nav-manager-btn"
            onClick={() => {
              if (currentView !== 'manager') {
                onSelectView('manager', 'students');
              }
              setIsManagerMenuOpen(!isManagerMenuOpen);
            }}
            title={isCollapsed ? 'Menu Gestor' : undefined}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 ${
              isCollapsed ? 'justify-center' : 'text-left'
            } ${
              currentView === 'manager'
                ? 'text-[#2fd9f4] border-l-4 border-[#2fd9f4] bg-white/5 font-semibold shadow-[0_0_15px_rgba(47,217,244,0.15)]'
                : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <ShieldCheck className="w-5 h-5 shrink-0 text-[#2fd9f4]" />
              {!isCollapsed && <span className="text-sm font-medium truncate">Menu Gestor</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isManagerMenuOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {/* Submenus under Menu Gestor */}
          {!isCollapsed && isManagerMenuOpen && (
            <div className="pl-4 space-y-1 py-1 border-l-2 border-[#2fd9f4]/20 ml-5 animate-fadeIn">
              <button
                id="nav-manager-sub-alunos"
                onClick={() => onSelectView('manager', 'students')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  currentView === 'manager' && managerActiveTab === 'students'
                    ? 'text-[#2fd9f4] bg-[#2fd9f4]/15 border border-[#2fd9f4]/30 font-bold'
                    : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0 text-[#2fd9f4]" />
                <span className="truncate">Alunos</span>
              </button>

              <button
                id="nav-manager-sub-trainings"
                onClick={() => onSelectView('manager', 'trainings')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  currentView === 'manager' && managerActiveTab === 'trainings'
                    ? 'text-[#2fd9f4] bg-[#2fd9f4]/15 border border-[#2fd9f4]/30 font-bold'
                    : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#8083ff]" />
                <span className="truncate">Gestão de Treinamentos</span>
              </button>

              <button
                id="nav-manager-sub-certs"
                onClick={() => onSelectView('manager', 'certificates')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                  currentView === 'manager' && managerActiveTab === 'certificates'
                    ? 'text-[#2fd9f4] bg-[#2fd9f4]/15 border border-[#2fd9f4]/30 font-bold'
                    : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
                }`}
              >
                <Award className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span className="truncate">Certificados</span>
              </button>
            </div>
          )}
        </div>

        <button
          id="nav-profile-btn"
          onClick={() => onSelectView('profile')}
          title={isCollapsed ? 'Meu Perfil' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'profile'
              ? 'text-[#2fd9f4] border-l-4 border-[#2fd9f4] bg-white/5 font-semibold shadow-[0_0_15px_rgba(47,217,244,0.15)]'
              : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium truncate">Meu Perfil</span>}
        </button>
      </nav>

      {/* Footer Pro Upgrade */}
      <div className="p-4">
        <button
          id="upgrade-pro-btn"
          onClick={onOpenProModal}
          title={isCollapsed ? 'Sagacitas Pro' : undefined}
          className={`w-full py-3 bg-[#8083ff] hover:bg-[#6c70ff] text-[#0d0096] rounded-xl font-bold active:scale-95 transition-all shadow-[0_0_20px_rgba(128,131,255,0.3)] flex items-center justify-center gap-2 text-xs uppercase tracking-wider ${
            isCollapsed ? 'px-0' : 'px-4'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Sagacitas Pro</span>}
        </button>
      </div>
    </aside>
  );
};
