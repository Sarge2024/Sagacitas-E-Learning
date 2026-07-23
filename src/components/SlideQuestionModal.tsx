import React, { useState } from 'react';
import { Slide, InstructorQuestion } from '../types';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Presentation,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  User,
} from 'lucide-react';

interface SlideQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: Slide;
  lessonTitle: string;
  lessonNumber: string;
  courseTitle?: string;
  onSubmitQuestion: (question: Omit<InstructorQuestion, 'id' | 'timestamp' | 'status'>) => void;
  onNavigateToPortfolio: () => void;
}

export const SlideQuestionModal: React.FC<SlideQuestionModalProps> = ({
  isOpen,
  onClose,
  slide,
  lessonTitle,
  lessonNumber,
  courseTitle = 'Treinamento DRE Alchymist',
  onSubmitQuestion,
  onNavigateToPortfolio,
}) => {
  const [studentName, setStudentName] = useState('Gabriel Mendes');
  const [questionText, setQuestionText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    onSubmitQuestion({
      studentName: studentName.trim() || 'Aluno Sagacitas',
      studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      courseTitle,
      lessonTitle,
      lessonNumber,
      slideNumber: slide.slideNumber,
      slideTitle: slide.title,
      slideCategory: slide.slideCategory,
      questionText: questionText.trim(),
    });

    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setQuestionText('');
    onClose();
  };

  const handleGoToPortfolio = () => {
    setIsSubmitted(false);
    setQuestionText('');
    onClose();
    onNavigateToPortfolio();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-md max-w-xl w-full overflow-hidden shadow-xl transition-all">
        {/* Header */}
        <div className="bg-white p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-[#1890ff]">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900">
                Dúvida do Slide • Enviar ao Instrutor
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Sua pergunta será encaminhada diretamente para a Carteira do Instrutor
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {!isSubmitted ? (
            <>
              {/* Context Slide Banner */}
              <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-[#1890ff] uppercase tracking-wider font-mono">
                    Aula {lessonNumber} • Slide {slide.slideNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#1890ff] border border-blue-200 font-bold text-[10px] uppercase">
                    {slide.slideCategory || 'Geral'}
                  </span>
                </div>
                <h4 className="text-sm md:text-base font-black text-slate-900 leading-snug">
                  {slide.title}
                </h4>
                {slide.subtitle && (
                  <p className="text-xs text-slate-600 font-medium">{slide.subtitle}</p>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Seu Nome Completo
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Ex: Gabriel Mendes"
                      className="w-full bg-slate-50 border border-slate-200 rounded py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-900 outline-none focus:border-[#1890ff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                    Descreva sua dúvida com relação a este slide
                  </label>
                  <textarea
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                    placeholder="Ex: Não entendi como aplicar a fórmula de Margem Bruta no Alchymist quando o CMV varia..."
                    className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-xs md:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#1890ff] transition-all resize-none"
                  />
                </div>

                <div className="p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Ao enviar, esta dúvida ficará registrada na <strong>Carteira do Instrutor</strong> com todo o contexto do slide para resposta personalizada.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-4 py-2 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded bg-[#1890ff] hover:bg-[#096dd9] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                  >
                    <span>Enviar Dúvida</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Success Feedback view with redirect to Instructor Portfolio */
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-xs animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  Dúvida Enviada com Sucesso! 🎉
                </h4>
                <p className="text-xs md:text-sm text-slate-600 font-medium max-w-md mx-auto">
                  Sua dúvida sobre o <strong>Slide {slide.slideNumber} ({slide.title})</strong> já foi encaminhada para a <strong>Carteira do Instrutor Sagacitas</strong>.
                </p>
              </div>

              <div className="p-4 rounded bg-blue-50 border border-blue-200 text-left space-y-2 max-w-md mx-auto">
                <div className="text-[10px] uppercase font-mono font-bold text-[#1890ff]">
                  Resumo da Mensagem
                </div>
                <p className="text-xs text-slate-800 font-semibold italic">
                  "{questionText}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleGoToPortfolio}
                  className="w-full sm:w-auto px-6 py-2.5 rounded bg-[#1890ff] hover:bg-[#096dd9] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-98"
                >
                  <span>Ir para a Carteira do Instrutor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs cursor-pointer transition-all"
                >
                  Continuar na Aula
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
