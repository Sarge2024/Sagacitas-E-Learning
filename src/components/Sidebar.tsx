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
            <p className="text-[10px] text-[#1890ff] font-extrabold tracking-wider uppercase mt-0.5">
              Alchymist Manager
            </p>
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

        {/* Menu Gestor / Settings */}
        <div className="space-y-1">
          <button
            id="nav-manager-btn"
            onClick={() => {
              if (currentView !== 'manager') {
                onSelectView('manager', 'students');
              }
              setIsManagerMenuOpen(!isManagerMenuOpen);
            }}
            title={isCollapsed ? 'Gestor' : undefined}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md transition-all duration-200 cursor-pointer ${
              isCollapsed ? 'justify-center' : 'text-left'
            } ${
              currentView === 'manager'
                ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/80 font-medium'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Settings className="w-4.5 h-4.5 shrink-0" />
              {!isCollapsed && <span className="text-sm truncate">Gestor</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                  isManagerMenuOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {/* Submenus under Settings */}
          {!isCollapsed && isManagerMenuOpen && (
            <div className="pl-3 space-y-1 py-1 border-l-2 border-[#1890ff]/30 ml-4 animate-fadeIn">
              <button
                id="nav-manager-sub-alunos"
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
                id="nav-manager-sub-trainings"
                onClick={() => onSelectView('manager', 'trainings')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  currentView === 'manager' && managerActiveTab === 'trainings'
                    ? 'text-[#1890ff] bg-white border border-[#1890ff]/30 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                <span className="truncate">Gestão de Cursos</span>
              </button>

              <button
                id="nav-manager-sub-certs"
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
