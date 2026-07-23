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
          className="w-80 sm:w-96 mb-4 bg-white border border-slate-200 rounded-md overflow-hidden shadow-xl flex flex-col max-h-[500px] transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 text-slate-800"
        >
          {/* Header */}
          <div className="p-4 bg-blue-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1890ff] animate-ping"></div>
              <span className="text-xs font-black text-[#1890ff] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1890ff]" />
                <span>Tutor IA - Suporte</span>
              </span>
            </div>
            <button
              id="close-ai-chat-btn"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs leading-relaxed max-h-[360px] bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {msg.sender === 'tutor' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bot className="w-3.5 h-3.5 text-[#1890ff]" />
                    <span className="text-[10px] text-[#1890ff] uppercase tracking-wider font-extrabold">
                      Sagacitas AI
                    </span>
                  </div>
                )}

                <div
                  className={`p-3 rounded-md max-w-[88%] leading-relaxed text-xs font-medium ${
                    msg.sender === 'user'
                      ? 'bg-[#1890ff] text-white shadow-2xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[#1890ff] text-xs font-bold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sagacitas AI está pensando...</span>
              </div>
            )}

            {/* Quick prompt suggestions */}
            {messages.length <= 2 && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                  Sugestões de perguntas:
                </p>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handleSendMessage('Qual a diferença entre DRE e Fluxo de Caixa?')}
                    className="text-left p-2 rounded bg-white hover:bg-blue-50 border border-slate-200 text-[11px] font-semibold text-[#1890ff] transition-all cursor-pointer"
                  >
                    💡 Qual a diferença entre DRE e Fluxo de Caixa?
                  </button>
                  <button
                    onClick={() => handleSendMessage('Como diagnosticar o Cenário 2 (Margem bruta em queda)?')}
                    className="text-left p-2 rounded bg-white hover:bg-blue-50 border border-slate-200 text-[11px] font-semibold text-[#1890ff] transition-all cursor-pointer"
                  >
                    🎯 Como diagnosticar o Cenário 2 (Margem bruta em queda)?
                  </button>
                  <button
                    onClick={() => handleSendMessage('Como calcular o CMV ideal do restaurante no Alchymist Manager?')}
                    className="text-left p-2 rounded bg-white hover:bg-blue-50 border border-slate-200 text-[11px] font-semibold text-[#1890ff] transition-all cursor-pointer"
                  >
                    📊 Como calcular o CMV ideal no Alchymist Manager?
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-3 bg-white border-t border-slate-200">
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
                className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 pr-10 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#1890ff] outline-none font-medium"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="absolute right-2 p-1.5 text-[#1890ff] hover:scale-110 disabled:opacity-40 transition-transform cursor-pointer"
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
        className="group flex items-center gap-2.5 bg-[#1890ff] hover:bg-[#096dd9] text-white px-4 py-2.5 rounded-md font-bold text-xs shadow-md active:scale-98 transition-all cursor-pointer"
      >
        <Bot className="w-4.5 h-4.5" />
        <span className="tracking-wide">Tutor IA - Dúvidas?</span>
      </button>
    </div>
  );
};
