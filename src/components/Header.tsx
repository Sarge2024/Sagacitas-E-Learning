import React, { useState } from 'react';
import { Search, Bell, Award, LineChart, Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck, Lock, UserCheck } from 'lucide-react';
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
}

export const Header: React.FC<HeaderProps> = ({
  onSelectView,
  searchQuery,
  onSearchChange,
  isSidebarCollapsed = false,
  onToggleCollapse,
  oauthUser,
  onOpenOAuthModal,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header
      id="main-header"
      className={`fixed top-0 right-0 z-40 flex items-center justify-between px-8 h-16 bg-[#0b1326]/70 backdrop-blur-lg border-b border-white/10 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        {onToggleCollapse && (
          <button
            id="header-toggle-sidebar-btn"
            onClick={onToggleCollapse}
            className="p-2 text-[#c7c4d7] hover:text-[#2fd9f4] hover:bg-white/10 rounded-xl transition-all"
            title={isSidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        )}

        <div className="relative w-full">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-[#c7c4d7]">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar aulas, DRE, conceitos de gestão..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-[#dae2fd] placeholder-[#c7c4d7]/60 focus:ring-2 focus:ring-[#2fd9f4] focus:border-transparent transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6">
          <button
            id="header-my-progress-btn"
            onClick={() => onSelectView('profile')}
            className="flex items-center gap-1.5 text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors text-xs font-semibold uppercase tracking-wider"
          >
            <LineChart className="w-3.5 h-3.5 text-[#2fd9f4]" />
            <span>Meu Progresso</span>
          </button>
          <button
            id="header-certificates-btn"
            onClick={() => onSelectView('profile')}
            className="flex items-center gap-1.5 text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors text-xs font-semibold uppercase tracking-wider"
          >
            <Award className="w-3.5 h-3.5 text-[#ddb7ff]" />
            <span>Certificados</span>
          </button>
        </div>

        {/* OAuth Authentication Status Pill */}
        {onOpenOAuthModal && (
          <button
            id="oauth-status-header-btn"
            onClick={onOpenOAuthModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-extrabold transition-all cursor-pointer shadow-xs ${
              oauthUser
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-[#8083ff]/15 border-[#8083ff]/40 text-[#c0c1ff] hover:bg-[#8083ff]/25'
            }`}
            title="Gerenciar Autenticação OAuth"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${oauthUser ? 'text-emerald-400' : 'text-[#2fd9f4]'}`} />
            <span className="hidden sm:inline">
              {oauthUser ? 'OAuth Conectado' : 'Login OAuth'}
            </span>
          </button>
        )}

        <div className="flex items-center gap-4 border-l border-white/10 pl-6 relative">
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors p-1.5 rounded-full hover:bg-white/5 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#2fd9f4] rounded-full animate-pulse"></span>
            </button>

            {showNotifications && (
              <div
                id="notifications-dropdown"
                className="absolute right-0 mt-3 w-80 bg-[#171f33] border border-white/15 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl z-50 text-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-[#c0c1ff]">Notificações Sagacitas</span>
                  <span className="text-xs text-[#2fd9f4] cursor-pointer hover:underline">Limpar</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  <div className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                    <p className="font-semibold text-xs text-[#dae2fd]">
                      🎉 Resposta do Tutor Sagacitas
                    </p>
                    <p className="text-xs text-[#c7c4d7]/80 mt-0.5">
                      Sua pergunta sobre CMV do Alchymist Manager foi respondida.
                    </p>
                    <span className="text-[10px] text-[#c7c4d7]/50 mt-1 block">Há 5 minutos</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                    <p className="font-semibold text-xs text-[#dae2fd]">
                      🏆 Certificado Liberado
                    </p>
                    <p className="text-xs text-[#c7c4d7]/80 mt-0.5">
                      Você completou 88% do treinamento de DRE. Continue assim!
                    </p>
                    <span className="text-[10px] text-[#c7c4d7]/50 mt-1 block">Há 2 horas</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            id="user-avatar-btn"
            onClick={onOpenOAuthModal || (() => onSelectView('profile'))}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-full overflow-hidden border transition-all ${
              oauthUser ? 'border-emerald-400 group-hover:border-emerald-300' : 'border-white/20 group-hover:border-[#2fd9f4]'
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

