import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  Lock, 
  ExternalLink, 
  Database,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface LoginPortalProps {
  onLoginSuccess: (user: any) => void;
}

import { auth, googleProvider, githubProvider } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { supabase } from '../lib/supabaseClient';

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoginSuccess }) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('sagacitas.assessoria@gmail.com');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConnectOAuth = async (provider: string) => {
    try {
      setLoadingProvider(provider);
      setErrorMsg('');
      let result;

      if (provider === 'google') {
        result = await signInWithPopup(auth, googleProvider);
      } else if (provider === 'github') {
        result = await signInWithPopup(auth, githubProvider);
      } else if (provider === 'firebase') {
        if (!email || !password) {
          throw new Error('E-mail e senha são obrigatórios.');
        }
        result = await signInWithEmailAndPassword(auth, email, password);
      }

      if (result && result.user) {
        const userEmail = result.user.email || email;
        
        // 1. Try to find the user in instructors table (Master Admin / Instrutor)
        let role = 'Student';
        let company_name = 'Sagacitas Corporativo';
        let enrollment_type = 'B2B';
        
        const { data: instructor } = await supabase
          .from('instructors')
          .select('*')
          .eq('email', userEmail)
          .single();
          
        if (instructor) {
          role = 'Master Admin';
        } else {
          // 2. Try to find in students table
          const { data: student } = await supabase
            .from('students')
            .select(`
              *,
              companies ( name )
            `)
            .eq('email', userEmail)
            .single();
            
          if (student) {
            role = 'Student';
            company_name = student.companies?.name || company_name;
            enrollment_type = student.enrollment_type || enrollment_type;
          }
        }

        // Send enriched user info to App.tsx
        onLoginSuccess({
          id: result.user.uid,
          name: result.user.displayName || email.split('@')[0],
          email: userEmail,
          avatar: result.user.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
          provider: provider === 'google' ? 'Google OAuth 2.0' : provider === 'github' ? 'GitHub OAuth' : 'Firebase Auth',
          role,
          company_name,
          enrollment_type,
          enrollment_number: 'N/A',
          authenticatedAt: new Date().toISOString(),
          token: await result.user.getIdToken()
        });
      }
    } catch (err: any) {
      console.error('OAuth connection error:', err);
      setErrorMsg(err.message || 'Falha ao autenticar.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-[#dae2fd] font-sans antialiased flex flex-col justify-between p-4 relative overflow-hidden">
      
      {/* Subtle Background Glow Decors */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#1890ff]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#8083ff]/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-[1440px] mx-auto w-full flex items-center justify-between py-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#1890ff] flex items-center justify-center font-black text-white text-base shadow-lg shadow-[#1890ff]/20">
            S
          </div>
          <span className="font-black text-white text-base tracking-tight hidden sm:inline">
            Sagacitas E-Learning
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a 
            href="https://console.firebase.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-[#dae2fd]/60 hover:text-white transition-colors flex items-center gap-1 font-semibold"
          >
            <span>Firebase Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 py-10 relative z-10">
        
        {/* Left Side: Copywriting */}
        <div className="flex-1 space-y-6 text-center lg:text-left max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1890ff]/10 border border-[#1890ff]/20 text-[#1890ff] text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal de Treinamento Autenticado</span>
          </span>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Educação Corporativa e <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2fd9f4] to-[#8083ff]">Gestão de Resultados</span>
          </h1>

          <p className="text-sm text-[#c7c4d7] leading-relaxed font-medium">
            Bem-vindo à plataforma de E-Learning da Sagacitas. Conecte-se com sua conta corporativa para acessar as trilhas de finanças, controle de CMV, DRE gerencial do Alchymist Manager e emitir seus certificados de qualificação.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-left max-w-md mx-auto lg:mx-0 pt-2 font-semibold">
            <div className="flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-[#2fd9f4]/15 flex items-center justify-center text-[#2fd9f4]">
                <Globe className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-white font-extrabold">Acesso Multi-Tenant</p>
                <p className="text-[#94a3b8] text-[11px]">Sua empresa isolada por RLS</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/3 border border-white/5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-[#8083ff]/15 flex items-center justify-center text-[#8083ff]">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-white font-extrabold">Login Seguro SSO</p>
                <p className="text-[#94a3b8] text-[11px]">Autenticação via Firebase & OAuth</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full max-w-md bg-[#131929]/50 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl relative">
          
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mx-auto shadow-sm">
              <Lock className="w-5 h-5 text-[#2fd9f4]" />
            </div>
            <h2 className="text-lg font-black text-white">Identifique-se para acessar</h2>
            <p className="text-xs text-[#94a3b8] font-medium">Escolha seu provedor seguro abaixo</p>
          </div>

          <div className="space-y-3">
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-semibold mb-4">
                {errorMsg}
              </div>
            )}
            
            <div className="space-y-2 mb-4">
              <input
                type="email"
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#ffcb2b] transition-colors"
              />
              <input
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#ffcb2b] transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleConnectOAuth('firebase')}
              />
            </div>

            {/* Firebase Auth Button */}
            <button
              onClick={() => handleConnectOAuth('firebase')}
              disabled={loadingProvider !== null}
              className="w-full py-3.5 px-4 rounded-xl bg-[#ffcb2b] hover:bg-[#f5b800] text-[#030914] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#ffcb2b]/10"
            >
              <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                <path d="M5.8 24.6l9.6-18c.3-.6 1.2-.6 1.5 0l2.3 4.3L5.8 24.6z" fill="#FFC24C" />
                <path d="M26.2 24.6l-3.2-6.1-3.7-7c-.3-.6-1.2-.6-1.5 0L5.8 24.6h20.4z" fill="#FFA712" />
                <path d="M16.3 3.4c-.2-.4-.8-.4-1 0L3.4 24.2c-.3.5.1 1.2.7 1.2h23.8c.6 0 1-.7.7-1.2L16.3 3.4z" fill="#F44336" />
              </svg>
              <span>
                {loadingProvider === 'firebase' ? 'Conectando...' : 'Entrar com E-mail'}
              </span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-[1px] bg-white/10 flex-1" />
              <span className="text-[10px] uppercase font-black tracking-widest text-[#94a3b8]">ou provedores federados</span>
              <div className="h-[1px] bg-white/10 flex-1" />
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={() => handleConnectOAuth('google')}
              disabled={loadingProvider !== null}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google OAuth 2.0</span>
            </button>

            {/* GitHub OAuth Button */}
            <button
              onClick={() => handleConnectOAuth('github')}
              disabled={loadingProvider !== null}
              className="w-full py-3 px-4 rounded-xl bg-[#1d263a] hover:bg-[#25304a] text-white border border-white/5 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub OAuth</span>
            </button>
          </div>

          <div className="mt-5 p-3.5 bg-slate-950/40 rounded-xl border border-white/5 text-[10px] text-[#cbd5e1] leading-relaxed">
            <span className="text-[#ffcb2b] font-black uppercase tracking-wider block mb-1">💡 Integração Firebase Auth:</span>
            O botão Firebase redireciona para a tela de login integrado. Utilize o e-mail cadastrado <code className="text-[#2fd9f4] font-bold">sagacitas.assessoria@gmail.com</code> para sincronizar suas permissões de administrador.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1440px] mx-auto w-full border-t border-white/5 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#dae2fd]/40 relative z-10">
        <div>
          <span>© 2026 Sagacitas. Todos os direitos reservados.</span>
        </div>
        
        <div className="flex items-center gap-6 font-semibold">
          <a 
            href="https://console.firebase.google.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-[#ffcb2b]" />
            <span>Firebase Console</span>
          </a>
          <a 
            href="http://localhost:54323" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-[#1890ff]" />
            <span>Supabase Studio</span>
          </a>
        </div>
      </footer>
    </div>
  );
};
