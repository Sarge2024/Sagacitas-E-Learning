import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface AITutorChatProps {
  initialOpen?: boolean;
  lessonTitle?: string;
  moduleTitle?: string;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({
  initialOpen = false,
  lessonTitle = 'Fundamentos de IA',
  moduleTitle = 'IA Generativa',
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'tutor',
      text: `Olá! Sou o Tutor de IA da Sagacitas E-Learning. Estou acompanhando seu aprendizado no treinamento Alchymist Manager | Dominando a DRE do Restaurante. Quer que eu ajude com o cálculo do CMV, a interpretação de variações de margem ou sobre o Ritual Mensal do Dono?`,
      timestamp: 'Agora mesmo',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Agora mesmo',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          lessonTitle,
          moduleTitle,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await response.json();
      const tutorReply = data.reply || 'Estou aqui para ajudar com suas dúvidas de IA!';

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: tutorReply,
        timestamp: 'Agora mesmo',
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      console.error('Error fetching tutor answer:', err);
      const fallbackMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: `O Backpropagation (Retropropagação) é o algoritmo fundamental usado para treinar redes neurais. Ele calcula o gradiente da função de perda em relação a cada peso, ajustando as conexões de trás para frente usando a Regra da Cadeia da pedra do cálculo.`,
        timestamp: 'Agora mesmo',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-tutor-container" className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div
          id="ai-tutor-chat-window"
          className="w-80 sm:w-96 mb-4 bg-[#171f33]/90 border border-white/15 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[500px] transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div className="p-4 bg-[#2fd9f4]/20 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2fd9f4] animate-ping"></div>
              <span className="text-xs font-bold text-[#2fd9f4] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tutor IA - Suporte</span>
              </span>
            </div>
            <button
              id="close-ai-chat-btn"
              onClick={() => setIsOpen(false)}
              className="text-[#c7c4d7] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs leading-relaxed max-h-[360px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {msg.sender === 'tutor' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bot className="w-3.5 h-3.5 text-[#2fd9f4]" />
                    <span className="text-[10px] text-[#2fd9f4] uppercase tracking-wider font-bold">
                      Sagacitas AI
                    </span>
                  </div>
                )}

                <div
                  className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#c0c1ff]/15 text-[#dae2fd] border border-[#c0c1ff]/30 rounded-br-none'
                      : 'bg-white/5 text-[#dae2fd] border border-[#2fd9f4]/20 shadow-[0_0_10px_rgba(47,217,244,0.1)] rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[#2fd9f4] text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Lumina AI está pensando...</span>
              </div>
            )}

            {/* Quick prompt suggestions */}
            {messages.length <= 2 && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[10px] text-[#c7c4d7]/60 uppercase font-bold tracking-wider">
                  Sugestões de perguntas:
                </p>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handleSendMessage('Qual a diferença entre DRE e Fluxo de Caixa?')}
                    className="text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#2fd9f4] transition-all"
                  >
                    💡 Qual a diferença entre DRE e Fluxo de Caixa?
                  </button>
                  <button
                    onClick={() => handleSendMessage('Como diagnosticar o Cenário 2 (Margem bruta em queda)?')}
                    className="text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#2fd9f4] transition-all"
                  >
                    🎯 Como diagnosticar o Cenário 2 (Margem bruta em queda)?
                  </button>
                  <button
                    onClick={() => handleSendMessage('Como calcular o CMV ideal do restaurante no Alchymist Manager?')}
                    className="text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-[#2fd9f4] transition-all"
                  >
                    📊 Como calcular o CMV ideal no Alchymist Manager?
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-3 bg-[#060e20] border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Digite sua dúvida..."
                className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-10 py-2 text-xs text-[#dae2fd] placeholder-[#c7c4d7]/50 focus:ring-1 focus:ring-[#2fd9f4] outline-none"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="absolute right-2 p-1 text-[#2fd9f4] hover:scale-110 disabled:opacity-40 transition-transform"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        id="toggle-ai-tutor-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 bg-[#2fd9f4] text-[#001f25] px-5 py-3 rounded-full font-bold shadow-[0_0_25px_rgba(47,217,244,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
      >
        <Bot className="w-5 h-5 animate-pulse" />
        <span className="text-xs tracking-wide">Tutor IA - Dúvidas?</span>
      </button>
    </div>
  );
};
