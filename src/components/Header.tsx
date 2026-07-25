import React, { useState } from 'react';
import { Search, Bell, Settings, Award, LineChart, PanelLeftClose, PanelLeftOpen, ShieldCheck, User } from 'lucide-react';
import { USER_PROFILE } from '../data/coursesData';
import { ViewMode, OAuthUser } from '../types';

interface HeaderProps {
  onSelectView: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
  oauthUser?: OAuthUser | null;
  onOpenOAuthModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectView,
  searchQuery,
  onSearchChange,
  isSidebarCollapsed = false,
  onToggleCollapse,
  oauthUser,
  onOpenOAuthModal,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header
      id="main-header"
      className={`fixed top-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-[#ffffff]/90 backdrop-blur-md border-b border-slate-200 shadow-2xs transition-all duration-300 ${
        isSidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Brand & Search Section (Left) */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {onToggleCollapse && (
          <button
            id="header-toggle-sidebar-btn"
            onClick={onToggleCollapse}
            className="p-1.5 text-slate-600 hover:text-[#1890ff] hover:bg-slate-100 rounded-md transition-all cursor-pointer"
            title={isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        )}


        {/* Search Bar on Left */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar cursos, aulas, DRE ou instrutores..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#1890ff] focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* Trailing Icon Actions: Notifications, Settings, Profile */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-4">
          <button
            id="header-my-progress-btn"
            onClick={() => onSelectView('profile')}
            className="flex items-center gap-1.5 text-slate-600 hover:text-[#1890ff] transition-colors text-xs font-semibold cursor-pointer"
          >
            <LineChart className="w-3.5 h-3.5 text-[#1890ff]" />
            <span>Meu Progresso</span>
          </button>
          <button
            id="header-certificates-btn"
            onClick={() => onSelectView('profile')}
            className="flex items-center gap-1.5 text-slate-600 hover:text-[#1890ff] transition-colors text-xs font-semibold cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Certificados</span>
          </button>
        </div>

        {/* OAuth Logout Button */}
        {oauthUser && onLogout && (
          <button
            id="oauth-logout-header-btn"
            onClick={onLogout}
            className="px-3 py-1.5 text-xs font-black text-slate-500 hover:text-rose-600 bg-transparent border-none cursor-pointer uppercase transition-colors"
            title="Sair do Sistema (Logout)"
          >
            Logout
          </button>
        )}

        <div className="flex items-center gap-2 border-l border-slate-200 pl-4 relative">
          {/* Notifications Button */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
              }}
              className="text-slate-600 hover:text-[#1890ff] transition-colors p-1.5 rounded-md hover:bg-slate-100 relative cursor-pointer"
              title="Notificações"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#1890ff] rounded-full animate-pulse"></span>
            </button>

            {showNotifications && (
              <div
                id="notifications-dropdown"
                className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-md p-4 shadow-xl z-50 text-xs space-y-3 animate-fadeIn"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900">Notificações Sagacitas</span>
                  <button onClick={() => setShowNotifications(false)} className="text-[10px] text-[#1890ff] cursor-pointer hover:underline">Marcar lidas</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div className="p-2 rounded bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer">
                    <p className="font-bold text-slate-900">
                      🎓 Resposta do Tutor Sagacitas
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      Dúvida referente ao Módulo 3 tirada por Dra. Elena Sterling.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Há 5 min</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings Button */}
          <div className="relative">
            <button
              id="settings-header-btn"
              onClick={() => {
                setShowSettings(!showSettings);
                setShowNotifications(false);
              }}
              className="text-slate-600 hover:text-[#1890ff] transition-colors p-1.5 rounded-md hover:bg-slate-100 cursor-pointer"
              title="Configurações do Portal"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>

            {showSettings && (
              <div
                id="settings-dropdown"
                className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-md p-3 shadow-xl z-50 text-xs space-y-2 animate-fadeIn"
              >
                <div className="border-b border-slate-100 pb-2 font-bold text-slate-900">
                  Configurações do Sistema
                </div>
                <div className="space-y-1 text-slate-700">
                  <p className="font-medium text-[11px]">Tema: <span className="font-bold text-[#1890ff]">Light Mode (#f9f9ff)</span></p>
                  <p className="font-medium text-[11px]">Fonte: <span className="font-bold text-slate-900">Hanken Grotesk</span></p>
                  <p className="font-medium text-[11px]">Arredondamento: <span className="font-bold text-slate-900">ROUND_FOUR (4px)</span></p>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            id="user-avatar-btn"
            onClick={onOpenOAuthModal || (() => onSelectView('profile'))}
            className="flex items-center gap-2 group cursor-pointer ml-1"
          >
            <div className={`w-8 h-8 rounded-full overflow-hidden border transition-all ${
              oauthUser ? 'border-emerald-500 group-hover:border-emerald-600' : 'border-slate-300 group-hover:border-[#1890ff]'
            }`}>
              <img
                src={oauthUser?.avatar || USER_PROFILE.avatar}
                alt={oauthUser?.name || USER_PROFILE.name}
                className="w-full h-full object-cover"
              />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

