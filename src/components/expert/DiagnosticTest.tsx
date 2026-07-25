import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiagnosticStore } from '../../store/useDiagnosticStore';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShieldCheck, BookOpen, RotateCcw } from 'lucide-react';

// Mock Data: Metalúrgica Silva
const CASE_CONTEXT = "A Metalúrgica Silva apresentou um faturamento bruto de R$ 500.000 no último trimestre, porém a margem de contribuição caiu para 15% e o resultado operacional foi negativo. Como gestor financeiro, você foi chamado para realizar o diagnóstico.";

const QUESTIONS = [
  {
    id: 1,
    skill: "Análise de Custo de Matéria-Prima (CMV/CPV)",
    question: "Considerando que o custo do aço representou 60% da receita líquida, qual a ação imediata mais indicada para recuperar a margem de contribuição?",
    options: [
      { id: 'a', text: 'Aumentar a verba de marketing para vender mais volume', isCorrect: false },
      { id: 'b', text: 'Renegociar contratos com fornecedores e revisar o desperdício fabril', isCorrect: true },
      { id: 'c', text: 'Cortar benefícios dos funcionários administrativos', isCorrect: false },
      { id: 'd', text: 'Tomar um empréstimo de capital de giro', isCorrect: false },
    ]
  },
  {
    id: 2,
    skill: "Identificação de Despesas Fixas vs Variáveis",
    question: "O aluguel do galpão industrial sofreu reajuste de 12% pelo IGPM. Na DRE gerencial da Metalúrgica Silva, esse impacto deve ser classificado como:",
    options: [
      { id: 'a', text: 'Custo Variável, pois varia com a inflação', isCorrect: false },
      { id: 'b', text: 'Despesa Financeira, decorrente de reajustes', isCorrect: false },
      { id: 'c', text: 'Custo/Despesa Fixa, pois independe do volume produzido', isCorrect: true },
      { id: 'd', text: 'Dedução da Receita Bruta', isCorrect: false },
    ]
  },
  {
    id: 3,
    skill: "Cálculo de Ponto de Equilíbrio",
    question: "Se as despesas fixas somam R$ 150.000 mensais e a margem de contribuição atual é de apenas 15%, qual o faturamento mínimo necessário para não ter prejuízo?",
    options: [
      { id: 'a', text: 'R$ 1.000.000', isCorrect: true },
      { id: 'b', text: 'R$ 500.000', isCorrect: false },
      { id: 'c', text: 'R$ 150.000', isCorrect: false },
      { id: 'd', text: 'R$ 2.000.000', isCorrect: false },
    ]
  }
];

const THRESHOLD = 0.6; // 60% rule

export const DiagnosticTest: React.FC = () => {
  const { currentStep, score, totalQuestions, answers, isFinished, answerQuestion, nextStep, setTotalQuestions, reset } = useDiagnosticStore();

  useEffect(() => {
    setTotalQuestions(QUESTIONS.length);
  }, [setTotalQuestions]);

  const currentQ = QUESTIONS[currentStep];
  const hasAnsweredCurrent = answers[currentStep] !== undefined;
  const isCorrect = answers[currentStep];

  const handleOptionClick = (isOptCorrect: boolean) => {
    if (!hasAnsweredCurrent) {
      answerQuestion(currentStep, isOptCorrect);
    }
  };

  const currentScoreRatio = totalQuestions > 0 ? score / totalQuestions : 0;
  const passed = currentScoreRatio >= THRESHOLD;

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 min-h-full rounded-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-md shadow-lg backdrop-blur-sm p-8 max-w-2xl w-full border border-slate-200"
        >
          <div className="flex flex-col items-center mb-8">
            {passed ? (
              <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-md flex items-center justify-center mb-4">
                <ShieldCheck size={32} />
              </div>
            ) : (
              <div className="h-16 w-16 bg-red-50 text-red-500 rounded-md flex items-center justify-center mb-4">
                <AlertTriangle size={32} />
              </div>
            )}
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Diagnóstico Concluído</h2>
            <p className="text-slate-600">
              Desempenho: <span className="font-bold text-slate-900">{(currentScoreRatio * 100).toFixed(0)}%</span> (Corte: 60%)
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
              Dashboard de Competências
            </h3>
            {QUESTIONS.map((q, idx) => {
              const answeredCorrect = answers[idx];
              return (
                <div key={q.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-md">
                  <span className="text-sm font-medium text-slate-700">{q.skill}</span>
                  {answeredCorrect ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-md">
                      <CheckCircle2 size={14} /> Dispensado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-md">
                      <BookOpen size={14} /> Obrigatório
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-[#1890ff] text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors"
            >
              <RotateCcw size={16} />
              Reiniciar Diagnóstico
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-3xl mx-auto p-4 w-full h-full">
      {/* Header Context */}
      <div className="bg-slate-900 text-white p-4 rounded-md shadow-2xs mb-6 flex items-start gap-4">
        <div className="bg-slate-800 p-2 rounded-md shrink-0">
          <BookOpen size={20} className="text-[#1890ff]" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Caso Prático: Metalúrgica Silva</h3>
          <p className="text-sm leading-relaxed text-slate-200">{CASE_CONTEXT}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Passo {currentStep + 1} de {totalQuestions}
        </div>
        <div className="flex-1 h-2 bg-slate-100 rounded-md overflow-hidden">
          <motion.div 
            className="h-full bg-[#1890ff]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          {currentQ && (
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-200 rounded-md shadow-2xs p-6"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-6 leading-tight">
                {currentQ.question}
              </h2>

              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = hasAnsweredCurrent && (opt.isCorrect ? isCorrect : !isCorrect);
                  // Determine styling based on whether it's answered, correct, or wrong
                  let btnStyle = "bg-white border-slate-200 text-slate-700 hover:border-[#1890ff] hover:bg-blue-50";
                  
                  if (hasAnsweredCurrent) {
                    if (opt.isCorrect) {
                      btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold";
                    } else if (isSelected && !opt.isCorrect) {
                      btnStyle = "bg-red-50 border-red-500 text-red-700";
                    } else {
                      btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionClick(opt.isCorrect)}
                      disabled={hasAnsweredCurrent}
                      className={`w-full text-left p-4 rounded-md border transition-all duration-200 flex items-center justify-between ${btnStyle}`}
                    >
                      <span className="text-sm">{opt.text}</span>
                      {hasAnsweredCurrent && opt.isCorrect && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
                      {hasAnsweredCurrent && isSelected && !opt.isCorrect && <XCircle size={18} className="text-red-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Action Area */}
              <AnimatePresence>
                {hasAnsweredCurrent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex justify-end"
                  >
                    <button
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-[#1890ff] hover:bg-blue-600 text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors shadow-2xs"
                    >
                      {currentStep === totalQuestions - 1 ? 'Ver Resultado' : 'Próxima Questão'}
                      <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
