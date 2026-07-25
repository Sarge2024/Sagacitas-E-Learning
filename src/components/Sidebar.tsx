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
  Inbox,
  ShieldCheck,
  Users,
  BookOpen,
  Award,
  Video,
  FileCheck,
  Calendar,
  Settings,
  BrainCircuit,
  Wand2,
  Target,
  Key,
  Sliders,
  Lock,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  managerActiveTab?: string;
  expertActiveTab?: string;
  onSelectView: (view: ViewMode, subTab?: string) => void;
  onOpenProModal: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  pendingQuestionsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  managerActiveTab = 'students',
  expertActiveTab = 'ucs',
  onSelectView,
  onOpenProModal,
  isCollapsed = false,
  onToggleCollapse,
  pendingQuestionsCount = 1,
}) => {
  const [isAlunosMenuOpen, setIsAlunosMenuOpen] = useState(true);
  const [isExpertMenuOpen, setIsExpertMenuOpen] = useState(true);

  return (
    <aside
      id="main-sidebar"
      className={`fixed left-0 top-0 h-full flex flex-col border-r border-slate-200 bg-[#f0f4f9] z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header with Title and Toggle Button */}
      <div className={`p-4 flex items-center justify-between border-b border-slate-200/80 ${isCollapsed ? 'flex-col gap-2' : ''}`}>
        {!isCollapsed ? (
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight truncate">
              Sagacitas E-Learning
            </h1>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-md bg-[#1890ff] flex items-center justify-center font-black text-white text-base shadow-sm" title="Sagacitas E-Learning">
            S
          </div>
        )}

        {onToggleCollapse && (
          <button
            id="toggle-sidebar-btn"
            onClick={onToggleCollapse}
            className="p-1.5 text-slate-600 hover:text-[#1890ff] hover:bg-slate-200/60 rounded-md transition-all cursor-pointer"
            title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 space-y-1 mt-2 overflow-y-auto" id="sidebar-nav">
        {/* Dashboard */}
        <button
          id="nav-dashboard-btn"
          onClick={() => onSelectView('dashboard')}
          title={isCollapsed ? 'Dashboard' : undefined}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'dashboard'
              ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 font-medium'
          }`}
        >
          <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && <span className="text-sm truncate">Dashboard</span>}
        </button>

        {/* Reports */}
        <button
          id="nav-reports-btn"
          onClick={() => onSelectView('reports')}
          title={isCollapsed ? 'Relatórios' : undefined}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'reports'
              ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 font-medium'
          }`}
        >
          <FileText className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
          {!isCollapsed && <span className="text-sm truncate">Relatórios</span>}
        </button>

        {/* Courses */}
        <button
          id="nav-courses-btn"
          onClick={() => onSelectView('courses')}
          title={isCollapsed ? 'Courses' : undefined}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'courses'
              ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 font-medium'
          }`}
        >
          <GraduationCap className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && <span className="text-sm truncate">Courses</span>}
        </button>

        {/* My Classes (Sala de Aula Virtual) */}
        <button
          id="nav-my-classes-btn"
          onClick={() => onSelectView('lesson')}
          title={isCollapsed ? 'My Classes' : undefined}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'lesson'
              ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 font-medium'
          }`}
        >
          <Video className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && <span className="text-sm truncate">My Classes</span>}
        </button>

        {/* Assignments (Exercícios & Trabalhos DRE) */}
        <button
          id="nav-assignments-btn"
          onClick={() => onSelectView('dre-simulator')}
          title={isCollapsed ? 'Assignments' : undefined}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'dre-simulator'
              ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 font-medium'
          }`}
        >
          <FileCheck className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && <span className="text-sm truncate">Assignments</span>}
        </button>

        {/* Calendar */}
        <button
          id="nav-calendar-btn"
          onClick={() => onSelectView('matrix')}
          title={isCollapsed ? 'Calendar' : undefined}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'matrix'
              ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 font-medium'
          }`}
        >
          <Calendar className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && <span className="text-sm truncate">Calendar</span>}
        </button>

        {/* Núcleo Expert (Bloom & DNT Multi-Tenant) */}
        <div className="space-y-1">
          <button
            id="nav-expert-btn"
            onClick={() => {
              if (currentView !== 'expert') {
                onSelectView('expert', 'ucs');
              }
              setIsExpertMenuOpen(!isExpertMenuOpen);
            }}
            title={isCollapsed ? 'Núcleo Expert' : undefined}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all duration-200 cursor-pointer ${
              isCollapsed ? 'justify-center' : 'text-left'
            } ${
              currentView === 'expert'
                ? 'text-[#0a6ed1] bg-blue-50 border border-[#0a6ed1]/30 font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 font-medium'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <BrainCircuit className="w-4.5 h-4.5 shrink-0 text-[#0a6ed1]" />
              {!isCollapsed && <span className="text-sm truncate font-bold text-[#0a6ed1]">Núcleo Expert</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                  isExpertMenuOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {!isCollapsed && isExpertMenuOpen && (
            <div className="pl-3 space-y-1 py-1 border-l-2 border-[#0a6ed1]/30 ml-4 animate-fadeIn">
              <button
                id="nav-expert-sub-ucs"
                onClick={() => onSelectView('expert', 'ucs')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentView === 'expert' && expertActiveTab === 'ucs'
                    ? 'text-[#0a6ed1] bg-white border border-[#0a6ed1]/30 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Unidades Atômicas</span>
              </button>

              <button
                id="nav-expert-sub-bloom"
                onClick={() => onSelectView('expert', 'bloom')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentView === 'expert' && expertActiveTab === 'bloom'
                    ? 'text-[#0a6ed1] bg-white border border-[#0a6ed1]/30 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Taxonomia de Bloom</span>
              </button>

              <button
                id="nav-expert-sub-reverse"
                onClick={() => onSelectView('expert', 'reverse')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentView === 'expert' && expertActiveTab === 'reverse'
                    ? 'text-[#0a6ed1] bg-white border border-[#0a6ed1]/30 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Engenharia Reversa</span>
              </button>

              <button
                id="nav-expert-sub-dnt"
                onClick={() => onSelectView('expert', 'dnt')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentView === 'expert' && expertActiveTab === 'dnt'
                    ? 'text-[#0a6ed1] bg-white border border-[#0a6ed1]/30 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Diagnóstico DNT</span>
              </button>

              <button
                id="nav-expert-sub-synthesis"
                onClick={() => onSelectView('expert', 'synthesis')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentView === 'expert' && expertActiveTab === 'synthesis'
                    ? 'text-[#0a6ed1] bg-white border border-[#0a6ed1]/30 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-rose-500" />
                <span>Projetos de Síntese</span>
              </button>

              <button
                id="nav-expert-sub-multitenant"
                onClick={() => onSelectView('expert', 'multitenant')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentView === 'expert' && expertActiveTab === 'multitenant'
                    ? 'text-[#0a6ed1] bg-white border border-[#0a6ed1]/30 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>API Headless</span>
              </button>

              <button
                id="nav-expert-sub-settings"
                onClick={() => onSelectView('expert', 'settings')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentView === 'expert' && expertActiveTab === 'settings'
                    ? 'text-[#0a6ed1] bg-white border border-[#0a6ed1]/30 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                <span>Configurações Globais</span>
              </button>

              <button
                id="nav-expert-sub-users"
                onClick={() => onSelectView('expert', 'users')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentView === 'expert' && expertActiveTab === 'users'
                    ? 'text-[#0a6ed1] bg-white border border-[#0a6ed1]/30 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-purple-500" />
                <span>Controle de Acessos</span>
              </button>
            </div>
          )}
        </div>

        {/* Instructor Portfolio / Questions */}
        <button
          id="nav-instructor-portfolio-btn"
          onClick={() => onSelectView('instructor-portfolio')}
          title={isCollapsed ? 'Carteira do Instrutor' : undefined}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'instructor-portfolio'
              ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 font-medium'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Inbox className="w-4.5 h-4.5 shrink-0 text-[#1890ff]" />
            {!isCollapsed && <span className="text-sm truncate">Carteira do Instrutor</span>}
          </div>
          {!isCollapsed && pendingQuestionsCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-black rounded bg-orange-500 text-white font-mono shadow-xs">
              {pendingQuestionsCount}
            </span>
          )}
        </button>

        {/* Gestão de Cursos */}
        <button
          id="nav-manager-trainings-btn"
          onClick={() => onSelectView('manager', 'trainings')}
          title={isCollapsed ? 'Gestão de Cursos' : undefined}
          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'manager' && managerActiveTab === 'trainings'
              ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 font-medium'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-4.5 h-4.5 shrink-0 text-slate-600" />
            {!isCollapsed && <span className="text-sm truncate">Gestão de Cursos</span>}
          </div>
        </button>

        {/* Menu Alunos (Dropdown) */}
        <div className="space-y-1">
          <button
            id="nav-alunos-dropdown-btn"
            onClick={() => {
              if (currentView !== 'manager' || (managerActiveTab !== 'students' && managerActiveTab !== 'certificates')) {
                onSelectView('manager', 'students');
              }
              setIsAlunosMenuOpen(!isAlunosMenuOpen);
            }}
            title={isCollapsed ? 'Alunos' : undefined}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all duration-200 cursor-pointer ${
              isCollapsed ? 'justify-center' : 'text-left'
            } ${
              currentView === 'manager' && (managerActiveTab === 'students' || managerActiveTab === 'certificates')
                ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 font-medium'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Users className="w-4.5 h-4.5 shrink-0 text-[#1890ff]" />
              {!isCollapsed && <span className="text-sm truncate">Alunos</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                  isAlunosMenuOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {/* Submenus under Alunos */}
          {!isCollapsed && isAlunosMenuOpen && (
            <div className="pl-3 space-y-1 py-1 border-l-2 border-[#1890ff]/30 ml-4 animate-fadeIn">
              <button
                id="nav-alunos-sub-alunos"
                onClick={() => onSelectView('manager', 'students')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentView === 'manager' && managerActiveTab === 'students'
                    ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0 text-[#1890ff]" />
                <span className="truncate">Alunos</span>
              </button>

              <button
                id="nav-alunos-sub-certs"
                onClick={() => onSelectView('manager', 'certificates')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentView === 'manager' && managerActiveTab === 'certificates'
                    ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Award className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span className="truncate">Certificados</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <button
          id="nav-profile-btn"
          onClick={() => onSelectView('profile')}
          title={isCollapsed ? 'Meu Perfil' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer ${
            isCollapsed ? 'justify-center' : 'text-left'
          } ${
            currentView === 'profile'
              ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 font-medium'
          }`}
        >
          <User className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && <span className="text-sm truncate">Meu Perfil</span>}
        </button>
      </nav>

      {/* Footer Pro Upgrade */}
      <div className="p-3 border-t border-slate-200/80">
        <button
          id="upgrade-pro-btn"
          onClick={onOpenProModal}
          title={isCollapsed ? 'Sagacitas Pro' : undefined}
          className={`w-full py-2.5 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded-md font-bold active:scale-98 transition-all shadow-xs flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer ${
            isCollapsed ? 'px-0' : 'px-3'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Sagacitas Pro</span>}
        </button>
      </div>
    </aside>
  );
};
