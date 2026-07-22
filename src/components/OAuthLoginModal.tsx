import React, { useState } from 'react';
import { OAuthUser } from '../types';
import {
  ShieldCheck,
  X,
  Lock,
  User,
  CheckCircle2,
  ExternalLink,
  Info,
  LogOut,
  Key,
  Globe,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

interface OAuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: OAuthUser | null;
  onLoginSuccess: (user: OAuthUser) => void;
  onLogout: () => void;
  devUrl?: string;
  sharedUrl?: string;
}

export const OAuthLoginModal: React.FC<OAuthLoginModalProps> = ({
  isOpen,
  onClose,
  user,
  onLoginSuccess,
  onLogout,
  devUrl = 'https://ais-dev-zt4fccupsnovqep4zv4t26-452244100598.us-east1.run.app',
  sharedUrl = 'https://ais-pre-zt4fccupsnovqep4zv4t26-452244100598.us-east1.run.app',
}) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleConnectOAuth = async (provider: string) => {
    try {
      setLoadingProvider(provider);
      // Fetch OAuth URL from server endpoint
      const response = await fetch(`/api/auth/url?provider=${encodeURIComponent(provider)}`);
      if (!response.ok) {
        throw new Error('Falha ao obter URL de autorização OAuth');
      }
      const { url } = await response.json();

      // Open OAuth provider authorization URL directly in popup
      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!authWindow) {
        alert('O popup de autenticação foi bloqueado pelo seu navegador. Por favor, permita popups para fazer login com OAuth.');
      }
    } catch (err) {
      console.error('OAuth connection error:', err);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#171f33] border border-white/15 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-[#dae2fd]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#2fd9f4]/15 border border-[#2fd9f4]/30 text-[#2fd9f4]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Autenticação OAuth 2.0</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8083ff]/20 text-[#8083ff] font-mono border border-[#8083ff]/30 uppercase font-extrabold">
                  Ambiente Logado
                </span>
              </h3>
              <p className="text-xs text-[#c7c4d7] font-medium">
                Conexão segura SSO com provedores de identidade
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#c7c4d7] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {user ? (
            /* User Authenticated View */
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sessão OAuth Ativa</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md">
                    {user.provider}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/50 shadow-md"
                  />
                  <div>
                    <h4 className="font-extrabold text-white text-base">{user.name}</h4>
                    <p className="text-xs text-[#c7c4d7] font-mono">{user.email}</p>
                    <span className="text-[10px] text-emerald-300 font-medium">
                      Conectado via {user.provider}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs text-[#c7c4d7]">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Papel no LMS:</span>
                  <span className="text-[#2fd9f4] font-semibold">{user.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">ID de Sessão:</span>
                  <span className="font-mono text-[11px] text-[#c7c4d7]/70 truncate max-w-[200px]">
                    {user.id}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Autenticado em:</span>
                  <span className="font-mono text-[11px]">
                    {new Date(user.authenticatedAt).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={onLogout}
                  className="w-full py-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Encerrar Sessão OAuth</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login Options View */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-[#c7c4d7] space-y-2">
                <p className="font-semibold text-white">
                  🔒 Escolha o provedor OAuth para acessar o seu ambiente autenticado de aluno Sagacitas E-Learning.
                </p>
                <p className="text-[11px] text-[#c7c4d7]/80">
                  O login via popup abrirá a tela de consentimento para conceder acesso às suas turmas, relatórios DRE e certificados.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Google OAuth */}
                <button
                  onClick={() => handleConnectOAuth('google')}
                  disabled={loadingProvider === 'google'}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-lg cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {loadingProvider === 'google' ? 'Abrindo OAuth...' : 'Entrar com Google OAuth 2.0'}
                  </span>
                </button>

                {/* GitHub OAuth */}
                <button
                  onClick={() => handleConnectOAuth('github')}
                  disabled={loadingProvider === 'github'}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-slate-700 transition-all border border-white/10 shadow-md cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>
                    {loadingProvider === 'github' ? 'Abrindo OAuth...' : 'Entrar com GitHub OAuth'}
                  </span>
                </button>

                {/* Sagacitas Single Sign-On */}
                <button
                  onClick={() => handleConnectOAuth('sagacitas-sso')}
                  disabled={loadingProvider === 'sagacitas-sso'}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#2fd9f4] to-[#8083ff] text-[#001f25] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-3 hover:opacity-95 transition-all shadow-lg cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 text-[#001f25]" />
                  <span>
                    {loadingProvider === 'sagacitas-sso' ? 'Abrindo OAuth...' : 'Entrar com OAuth Sagacitas SSO'}
                  </span>
                </button>
              </div>

              {/* Toggle OAuth Config Guide for Admin/Developer */}
              <div className="pt-2">
                <button
                  onClick={() => setShowConfigGuide(!showConfigGuide)}
                  className="w-full text-center text-xs text-[#2fd9f4] hover:underline font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>
                    {showConfigGuide ? 'Ocultar Parâmetros OAuth' : 'Ver URLs de Redirect & Variáveis de Ambiente OAuth'}
                  </span>
                </button>

                {showConfigGuide && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-900 border border-white/10 text-xs space-y-3 font-mono">
                    <div className="font-extrabold text-[#2fd9f4] uppercase tracking-wider text-[11px]">
                      📋 URLs de Callback OAuth (Redirect URI)
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Ambiente de Desenvolvimento (Dev URL):
                        </span>
                        <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/10 mt-1">
                          <span className="text-emerald-300 font-mono text-[10px] truncate max-w-[240px]">
                            {devUrl}/auth/callback
                          </span>
                          <button
                            onClick={() => handleCopy(`${devUrl}/auth/callback`, 'dev')}
                            className="text-[#2fd9f4] hover:text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedText === 'dev' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedText === 'dev' ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">
                          Ambiente Compartilhado (Shared URL):
                        </span>
                        <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg border border-white/10 mt-1">
                          <span className="text-emerald-300 font-mono text-[10px] truncate max-w-[240px]">
                            {sharedUrl}/auth/callback
                          </span>
                          <button
                            onClick={() => handleCopy(`${sharedUrl}/auth/callback`, 'shared')}
                            className="text-[#2fd9f4] hover:text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedText === 'shared' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedText === 'shared' ? 'Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Variáveis de Ambiente Recomendadas:
                      </span>
                      <p className="text-[10px] text-slate-300 font-mono mt-1">
                        OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, GOOGLE_CLIENT_ID
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
