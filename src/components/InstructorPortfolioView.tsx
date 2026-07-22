import React, { useState } from 'react';
import { InstructorQuestion, Certificate } from '../types';
import { RegisterCertificateModal } from './RegisterCertificateModal';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Send,
  MessageSquare,
  BookOpen,
  Presentation,
  User,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw,
  Award,
  Upload,
  FileText,
  ShieldCheck,
  ExternalLink,
  Download,
} from 'lucide-react';

interface InstructorPortfolioViewProps {
  questions: InstructorQuestion[];
  certificates: Certificate[];
  onReplyQuestion: (questionId: string, replyText: string) => void;
  onAddQuestion: (question: Omit<InstructorQuestion, 'id' | 'timestamp' | 'status'>) => void;
  onRegisterCertificate: (certificate: Omit<Certificate, 'id'>) => void;
  onSelectLessonView?: () => void;
  onOpenCertificateModal?: (cert: Certificate) => void;
}

export const InstructorPortfolioView: React.FC<InstructorPortfolioViewProps> = ({
  questions,
  certificates,
  onReplyQuestion,
  onAddQuestion,
  onRegisterCertificate,
  onSelectLessonView,
  onOpenCertificateModal,
}) => {
  const [activeTab, setActiveTab] = useState<'duvidas' | 'certificados'>('duvidas');
  const [filterStatus, setFilterStatus] = useState<'todas' | 'pendente' | 'respondida'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRegisterCertModalOpen, setIsRegisterCertModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const pendingCount = questions.filter((q) => q.status === 'pendente').length;
  const answeredCount = questions.filter((q) => q.status === 'respondida').length;

  const filteredQuestions = questions.filter((q) => {
    const matchesStatus = filterStatus === 'todas' || q.status === filterStatus;
    const qLower = searchQuery.toLowerCase();
    const matchesSearch =
      q.studentName.toLowerCase().includes(qLower) ||
      q.slideTitle.toLowerCase().includes(qLower) ||
      q.lessonTitle.toLowerCase().includes(qLower) ||
      q.questionText.toLowerCase().includes(qLower);

    return matchesStatus && matchesSearch;
  });

  const filteredCertificates = certificates.filter((c) => {
    const cLower = searchQuery.toLowerCase();
    return (
      c.courseTitle.toLowerCase().includes(cLower) ||
      (c.studentName || '').toLowerCase().includes(cLower) ||
      (c.registrationNumber || '').toLowerCase().includes(cLower) ||
      c.credentialId.toLowerCase().includes(cLower)
    );
  });

  const handleInputChange = (id: string, text: string) => {
    setReplyInputs((prev) => ({ ...prev, [id]: text }));
  };

  const handleSendReply = (id: string) => {
    const text = replyInputs[id];
    if (!text || !text.trim()) return;

    onReplyQuestion(id, text.trim());
    setReplyInputs((prev) => ({ ...prev, [id]: '' }));
    showToast('Resposta enviada ao aluno com sucesso! ✅');
  };

  const handleSimulateNewQuestion = () => {
    const pool = [
      {
        studentName: 'Juliana Costa',
        studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        courseTitle: 'Treinamento DRE Alchymist Restaurantes',
        lessonTitle: 'Aula 04: Fundamentos do CMV',
        lessonNumber: '04',
        slideNumber: 2,
        slideTitle: 'Cenário Prático de Quebra de Insumos',
        slideCategory: 'operacao',
        questionText: 'Professor, como calcular o desvio padrão do CMV em restaurantes com alta rotatividade de insumos perecíveis no Alchymist?',
      },
      {
        studentName: 'Beatriz Santos',
        studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
        courseTitle: 'Engenharia de Cardápio & Matriz BCG',
        lessonTitle: 'Aula 03: Fator de Correção e Rendimento',
        lessonNumber: '03',
        slideNumber: 4,
        slideTitle: 'Cálculo de Fator de Cocção em Carnes Nobres',
        slideCategory: 'operacao',
        questionText: 'Qual a tolerância ideal do Fator de Correção ao cadastrar o filé mignon no módulo de fichas técnicas do Alchymist?',
      },
      {
        studentName: 'Rodrigo Silva',
        studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        courseTitle: 'Treinamento DRE Alchymist Restaurantes',
        lessonTitle: 'Aula 05: Gestão de Despesas Variáveis',
        lessonNumber: '05',
        slideNumber: 1,
        slideTitle: 'Apropriação de Comissões de Delivery',
        slideCategory: 'alchymist',
        questionText: 'As antecipações de taxa de cartão de crédito devem entrar na linha de despesas financeiras ou abatimento do faturamento bruto na DRE?',
      },
    ];

    const randomQuestion = pool[Math.floor(Math.random() * pool.length)];
    onAddQuestion(randomQuestion);
    showToast(`Nova dúvida de ${randomQuestion.studentName} adicionada à carteira!`);
  };

  return (
    <div id="instructor-portfolio-page" className="min-h-screen bg-slate-100 text-slate-900 p-4 md:p-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-2xl animate-bounce border border-indigo-400">
          {toastMessage}
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-10 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold font-mono uppercase tracking-widest">
              <Inbox className="w-4 h-4 text-indigo-400" />
              <span>Portal Sagacitas • Gestão Pedagógica & Certificação</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
              Carteira do Instrutor
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              Responda às dúvidas dos alunos em tempo real e cadastre os certificados de conclusão com upload e autenticação oficial para o perfil dos estudantes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsRegisterCertModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2fd9f4] to-[#8083ff] text-[#001f25] font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>+ Cadastrar Certificado</span>
            </button>

            <button
              onClick={handleSimulateNewQuestion}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>+ Simular Dúvida</span>
            </button>

            {onSelectLessonView && (
              <button
                onClick={onSelectLessonView}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Presentation className="w-4 h-4" />
                <span>Sala de Aula</span>
              </button>
            )}
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Dúvidas Recebidas
            </span>
            <div className="text-2xl md:text-3xl font-black text-white">{questions.length}</div>
            <span className="text-[10px] text-indigo-300 font-semibold">Geral registradas</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
              Dúvidas Pendentes
            </span>
            <div className="text-2xl md:text-3xl font-black text-amber-400">{pendingCount}</div>
            <span className="text-[10px] text-amber-200 font-bold">⚠️ Aguardando resposta</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
              Certificados Emitidos
            </span>
            <div className="text-2xl md:text-3xl font-black text-emerald-400">{certificates.length}</div>
            <span className="text-[10px] text-emerald-300 font-bold">✓ Disponíveis no perfil do aluno</span>
          </div>

          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300">
              Autenticação Sagacitas
            </span>
            <div className="text-2xl md:text-3xl font-black text-sky-300">100%</div>
            <span className="text-[10px] text-sky-200 font-semibold">Credenciais Verificadas</span>
          </div>
        </div>
      </div>

      {/* Primary Section Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('duvidas')}
          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'duvidas'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#2fd9f4]" />
          <span>Atendimento de Dúvidas ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificados')}
          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'certificados'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-[#8083ff]" />
          <span>Gestão & Cadastro de Certificados ({certificates.length})</span>
        </button>
      </div>

      {/* TAB 1: DÚVIDAS DOS ALUNOS */}
      {activeTab === 'duvidas' && (
        <div className="space-y-6">
          {/* Filter Toolbar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterStatus('todas')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                  filterStatus === 'todas'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Todas ({questions.length})
              </button>

              <button
                onClick={() => setFilterStatus('pendente')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 ${
                  filterStatus === 'pendente'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Pendentes ({pendingCount})</span>
              </button>

              <button
                onClick={() => setFilterStatus('respondida')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 ${
                  filterStatus === 'respondida'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Respondidas ({answeredCount})</span>
              </button>
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por aluno, slide ou conteúdo..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Questions Feed Cards */}
          <div className="space-y-6">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 shadow-xs">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-800">Nenhuma dúvida encontrada</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Tente ajustar os filtros de busca ou simular uma nova dúvida.
                  </p>
                </div>
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isPending = q.status === 'pendente';

                return (
                  <div
                    key={q.id}
                    className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-sm ${
                      isPending ? 'border-amber-300/80 ring-2 ring-amber-400/20' : 'border-slate-200'
                    }`}
                  >
                    {/* Card Header Info */}
                    <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={q.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={q.studentName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">{q.studentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-medium">• {q.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{q.courseTitle}</p>
                        </div>
                      </div>

                      {/* Status Badge & Slide context */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center gap-1.5">
                          <Presentation className="w-3.5 h-3.5 text-indigo-600" />
                          <span>
                            Aula {q.lessonNumber} • Slide {q.slideNumber}
                          </span>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-xl font-extrabold text-xs flex items-center gap-1.5 uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {isPending ? (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              <span>Pendente</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Respondida</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 md:p-6 space-y-4">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          <span className="font-bold text-slate-800">Slide Contexto:</span>
                          <span className="text-indigo-900 font-extrabold">{q.slideTitle}</span>
                        </div>
                        {q.slideCategory && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            {q.slideCategory}
                          </span>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
                          Pergunta do Aluno:
                        </span>
                        <p className="text-sm md:text-base font-semibold text-slate-900 leading-relaxed">
                          "{q.questionText}"
                        </p>
                      </div>

                      {isPending ? (
                        <div className="pt-2 space-y-3">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Escrever Resposta do Instrutor ao Aluno:
                          </label>
                          <textarea
                            rows={3}
                            value={replyInputs[q.id] || ''}
                            onChange={(e) => handleInputChange(q.id, e.target.value)}
                            placeholder="Digite sua explicação detalhada para este aluno..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs md:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleSendReply(q.id)}
                              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                            >
                              <span>Enviar Resposta ao Aluno</span>
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between text-xs text-emerald-900 font-bold">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Resposta Enviada pelo Instrutor Sagacitas</span>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-mono font-medium">
                              {q.responseTimestamp || 'Recentemente'}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-slate-800 font-medium leading-relaxed italic pl-6 border-l-2 border-emerald-400">
                            "{q.instructorResponse}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GESTÃO E CADASTRO DE CERTIFICADOS */}
      {activeTab === 'certificados' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>Certificados Cadastrados no Sistema</span>
              </h3>
              <p className="text-xs text-slate-500">
                Todos os certificados cadastrados pelo instrutor ficam instantaneamente disponíveis para download no Perfil do Aluno.
              </p>
            </div>

            <button
              onClick={() => setIsRegisterCertModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#2fd9f4]" />
              <span>+ Cadastrar Certificado com Upload</span>
            </button>
          </div>

          {/* List of Certificates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCertificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{cert.institutionName || 'SAGACITAS E-LEARNING'}</span>
                    </span>
                    <h4 className="text-base font-black text-slate-900">{cert.courseTitle}</h4>
                    <p className="text-xs text-slate-600 font-semibold">
                      Aluno: <strong className="text-indigo-900">{cert.studentName || 'Gabriel Mendes'}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {cert.registrationNumber || 'Registração 0120022'} • {cert.issueDate}
                    </p>
                  </div>

                  {cert.imageUrl ? (
                    <img
                      src={cert.imageUrl}
                      alt={cert.courseTitle}
                      className="w-16 h-16 object-cover rounded-2xl border-2 border-indigo-200 shrink-0 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                      <Award className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>Credencial ID:</span>
                    <strong className="text-slate-900">{cert.credentialId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Carga Horária:</span>
                    <strong className="text-indigo-700">{cert.hours} Horas</strong>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  {onOpenCertificateModal && (
                    <button
                      onClick={() => onOpenCertificateModal(cert)}
                      className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Visualizar & Baixar PDF</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal para Cadastrar Certificado */}
      <RegisterCertificateModal
        isOpen={isRegisterCertModalOpen}
        onClose={() => setIsRegisterCertModalOpen(false)}
        onRegisterCertificate={(newCert) => {
          onRegisterCertificate(newCert);
          showToast(`Certificado de "${newCert.courseTitle}" cadastrado com sucesso para ${newCert.studentName}! 🎉`);
        }}
      />
    </div>
  );
};
