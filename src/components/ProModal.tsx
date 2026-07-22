import React, { useState } from 'react';
import { X, Sparkles, Check, Zap } from 'lucide-react';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({ isOpen, onClose }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      onClose();
    }, 2000);
  };

  return (
    <div
      id="pro-modal-backdrop"
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="pro-modal-content"
        className="w-full max-w-xl bg-[#171f33] border border-white/20 rounded-[32px] p-8 shadow-2xl relative text-[#dae2fd] overflow-hidden"
      >
        <button
          id="close-pro-modal-btn"
          onClick={onClose}
          className="absolute top-6 right-6 text-[#c7c4d7] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {subscribed ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-[#2fd9f4]/20 rounded-full flex items-center justify-center text-[#2fd9f4] mx-auto animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[#dae2fd]">Assinatura Pro Ativada! 🎉</h3>
            <p className="text-sm text-[#c7c4d7]">
              Bem-vindo ao plano Sagacitas Pro! Seu acesso ilimitado a todos os módulos do Alchymist Manager e ao Tutor IA já está liberado.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#8083ff]/20 text-[#8083ff] rounded-2xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#2fd9f4]">
                  Plano Elite Alchymist
                </span>
                <h3 className="text-2xl font-bold text-[#dae2fd]">Sagacitas E-Learning Pro</h3>
              </div>
            </div>

            <p className="text-sm text-[#c7c4d7] leading-relaxed">
              Desbloqueie acesso irrestrito ao treinamento DRE, módulos de fluxo de caixa do Alchymist Manager, simuladores interativos e mentoria 24/7 com o Tutor IA.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit mx-auto text-xs font-bold">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#2fd9f4] text-[#001f25] shadow-lg'
                    : 'text-[#c7c4d7] hover:text-white'
                }`}
              >
                Mensal R$ 89/mês
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-[#2fd9f4] text-[#001f25] shadow-lg'
                    : 'text-[#c7c4d7] hover:text-white'
                }`}
              >
                <span>Anual R$ 59/mês</span>
                <span className="bg-[#8083ff] text-[#0d0096] text-[9px] px-2 py-0.5 rounded-full uppercase">
                  Economize 33%
                </span>
              </button>
            </div>

            {/* Features List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-[#dae2fd]">
                <Check className="w-4 h-4 text-[#2fd9f4] shrink-0" />
                <span>Acesso ilimitado a todos os módulos e treinamentos do Alchymist Manager</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#dae2fd]">
                <Check className="w-4 h-4 text-[#2fd9f4] shrink-0" />
                <span>Simulador de DRE e Matriz de Ações Gerenciais em tempo real</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#dae2fd]">
                <Check className="w-4 h-4 text-[#2fd9f4] shrink-0" />
                <span>Tutor de IA especializado na DRE de restaurantes disponível 24h</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#dae2fd]">
                <Check className="w-4 h-4 text-[#2fd9f4] shrink-0" />
                <span>Certificados de conclusão oficiais reconhecidos e autenticados</span>
              </div>
            </div>

            <button
              id="confirm-pro-subscription-btn"
              onClick={handleSubscribe}
              className="w-full py-4 bg-[#8083ff] hover:bg-[#6c70ff] text-[#0d0096] rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(128,131,255,0.4)] active:scale-95 flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>Assinar Sagacitas Pro Agora</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
