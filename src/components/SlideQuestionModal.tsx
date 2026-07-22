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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                Dúvida do Slide • Enviar ao Instrutor
              </h3>
              <p className="text-xs text-indigo-200 font-medium">
                Sua pergunta será encaminhada diretamente para a Carteira do Instrutor
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {!isSubmitted ? (
            <>
              {/* Context Slide Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-indigo-700 uppercase tracking-wider font-mono">
                    Aula {lessonNumber} • Slide {slide.slideNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900 font-bold text-[10px] uppercase">
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Descreva sua dúvida com relação a este slide
                  </label>
                  <textarea
                    rows={4}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                    placeholder="Ex: Não entendi como aplicar a fórmula de Margem Bruta no Alchymist quando o CMV varia..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs md:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-start gap-2.5">
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
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
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
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-sm animate-bounce">
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

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-left space-y-2 max-w-md mx-auto">
                <div className="text-[10px] uppercase font-mono font-bold text-indigo-700">
                  Resumo da Mensagem
                </div>
                <p className="text-xs text-indigo-950 font-semibold italic">
                  "{questionText}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleGoToPortfolio}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all active:scale-95"
                >
                  <span>Ir para a Carteira do Instrutor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs cursor-pointer transition-all"
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
