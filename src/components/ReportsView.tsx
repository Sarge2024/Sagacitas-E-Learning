import React, { useState } from 'react';
import { OAuthUser, SystemPermission } from '../types';
import {
  FileText,
  Lock,
  Download,
  Sliders,
  Trash2,
  AlertTriangle,
  TrendingUp,
  Award,
  Sparkles,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Users
} from 'lucide-react';

interface ReportsViewProps {
  currentUser: OAuthUser | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ currentUser }) => {
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to check user permission
  const checkPermission = (resourceId: string, action: 'c' | 'r' | 'u' | 'd'): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Administrador') return true;
    
    if (currentUser.permissionsHash) {
      const perm = currentUser.permissionsHash[resourceId];
      return perm ? perm[action] : false;
    }

    if (!currentUser.permissions) return true; // Default allow if no permissions array exists (old users)
    const legacyPerm = currentUser.permissions.find(p => p.resourceId === resourceId);
    return legacyPerm ? legacyPerm[action] : false;
  };

  const reports = [
    {
      id: 'rep-performance',
      title: 'Desempenho de Alunos',
      description: 'Métricas de engajamento individual, notas médias e progresso por disciplina.',
      icon: Users,
      color: 'text-blue-500 bg-blue-50 border-blue-200'
    },
    {
      id: 'rep-completion',
      title: 'Conclusão de Treinamentos',
      description: 'Taxa de conclusão de cursos, evasão e tempos médios de resposta de questionários.',
      icon: Award,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-200'
    },
    {
      id: 'rep-ia',
      title: 'Engajamento & Tutor de IA',
      description: 'Volume de interações com o Tutor IA e perguntas mais frequentes feitas pelos alunos.',
      icon: Sparkles,
      color: 'text-purple-500 bg-purple-50 border-purple-200'
    },
    {
      id: 'rep-finance',
      title: 'Financeiro & Faturamento',
      description: 'Receita gerada por canais corporativos e assinaturas ativas de pacotes B2B.',
      icon: DollarSign,
      color: 'text-amber-500 bg-amber-50 border-amber-200'
    }
  ];

  const handleAction = (resourceId: string, action: 'c' | 'u' | 'd', actionName: string) => {
    const isAllowed = checkPermission(resourceId, action);
    if (!isAllowed) {
      showToast(`Acesso Negado: Você não tem permissão para ${actionName}.`);
      return;
    }

    if (action === 'c') {
      showToast(`Sucesso: Relatório exportado com sucesso!`);
    } else if (action === 'u') {
      showToast(`Sucesso: Parâmetros e metas atualizados.`);
    } else if (action === 'd') {
      if (confirm('Tem certeza de que deseja limpar o histórico de logs deste relatório? Esta ação não pode ser desfeita.')) {
        showToast(`Sucesso: Histórico de registros apagado.`);
      }
    }
  };

  // Render Detailed Report Content
  const renderReportDetail = (reportId: string) => {
    const hasReadPerm = checkPermission(reportId, 'r');

    if (!hasReadPerm) {
      return (
        <div className="bg-white rounded-md p-8 border border-slate-200 shadow-2xs text-center space-y-4 max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-md bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">Acesso Restrito</h3>
          <p className="text-xs text-slate-500 leading-normal">
            Você não possui a permissão de <strong>Leitura (Read)</strong> necessária para visualizar os dados detalhados deste relatório. Entre em contato com o administrador do sistema.
          </p>
          <button
            onClick={() => setActiveReportId(null)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs uppercase transition-all cursor-pointer"
          >
            Voltar à Central
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-md p-6 border border-slate-200 shadow-2xs space-y-6 animate-fadeIn">
        
        {/* Detail Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveReportId(null)}
              className="p-1.5 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {reports.find(r => r.id === reportId)?.title}
              </h3>
              <p className="text-xs text-slate-500">
                Detalhamento analítico e operações administrativas do relatório.
              </p>
            </div>
          </div>

          {/* Action Row demonstrating CRUD */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Create Action */}
            <button
              onClick={() => handleAction(reportId, 'c', 'Exportar Relatório (Criar)')}
              className={`px-3 py-1.5 rounded font-bold text-[10px] uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                checkPermission(reportId, 'c')
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              {checkPermission(reportId, 'c') ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Exportar PDF</span>
            </button>

            {/* Update Action */}
            <button
              onClick={() => handleAction(reportId, 'u', 'Ajustar Metas (Atualizar)')}
              className={`px-3 py-1.5 rounded font-bold text-[10px] uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                checkPermission(reportId, 'u')
                  ? 'bg-blue-50 hover:bg-blue-100 text-[#1890ff] border border-blue-200'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              {checkPermission(reportId, 'u') ? <Sliders className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Editar Metas</span>
            </button>

            {/* Delete Action */}
            <button
              onClick={() => handleAction(reportId, 'd', 'Apagar Histórico (Deletar)')}
              className={`px-3 py-1.5 rounded font-bold text-[10px] uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                checkPermission(reportId, 'd')
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-slate-100 text-slate-400 border border-slate-200'
              }`}
            >
              {checkPermission(reportId, 'd') ? <Trash2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Limpar Logs</span>
            </button>
          </div>
        </div>

        {/* Dynamic Mock Data Display */}
        {reportId === 'rep-performance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nota Média Geral</span>
                <span className="text-2xl font-black text-slate-900">8.4 / 10</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Taxa de Conexão</span>
                <span className="text-2xl font-black text-slate-900">92%</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tempo de Estudo</span>
                <span className="text-2xl font-black text-slate-900">14.2h</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Aluno</th>
                    <th className="p-3">DRE Sim.</th>
                    <th className="p-3">Diagnóstico DNT</th>
                    <th className="p-3">Média Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  <tr>
                    <td className="p-3">Carlos Souza</td>
                    <td className="p-3 text-emerald-600">9.5</td>
                    <td className="p-3 text-emerald-600">8.8</td>
                    <td className="p-3">9.2</td>
                  </tr>
                  <tr>
                    <td className="p-3">Júlia Mendes</td>
                    <td className="p-3 text-emerald-600">8.0</td>
                    <td className="p-3 text-emerald-600">8.5</td>
                    <td className="p-3">8.3</td>
                  </tr>
                  <tr>
                    <td className="p-3">Bruno Lima</td>
                    <td className="p-3 text-rose-600">5.5</td>
                    <td className="p-3 text-emerald-600">7.0</td>
                    <td className="p-3">6.3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportId === 'rep-completion' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Taxa de Conclusão</span>
                  <span className="text-xl font-black text-slate-900">87.5%</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-200 text-[#1890ff] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Certificados Emitidos</span>
                  <span className="text-xl font-black text-slate-900">42 Alunos</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Tempo médio para conclusão de disciplinas</span>
              <div className="w-full bg-slate-200 rounded-md h-3">
                <div className="bg-[#1890ff] h-3 rounded-md" style={{ width: '75%' }}></div>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">75% dos alunos concluem em menos de 10 dias úteis</span>
            </div>
          </div>
        )}

        {reportId === 'rep-ia' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total de Perguntas</span>
                <span className="text-2xl font-black text-slate-900">1,245</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tempo de Resposta IA</span>
                <span className="text-2xl font-black text-slate-900">1.8s</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Aprovação Resposta</span>
                <span className="text-2xl font-black text-slate-900">94.8%</span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-md space-y-2.5">
              <span className="text-xs font-black text-slate-800 block">Dúvidas Mais Frequentes Recorrentes</span>
              <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc pl-4 font-semibold">
                <li>O que é CMV e como calcular o custo correto?</li>
                <li>Diferença entre Lucro Bruto e Margem de Contribuição no DRE.</li>
                <li>Como analisar o Ponto de Equilíbrio operacional.</li>
              </ul>
            </div>
          </div>
        )}

        {reportId === 'rep-finance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Faturamento B2B Mês</span>
                  <span className="text-xl font-black text-slate-900">R$ 145.200,00</span>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-200 text-[#1890ff] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Crescimento MRR</span>
                  <span className="text-xl font-black text-slate-900">+12.4% / Mês</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Contratos Empresariais Premium</span>
                <span>R$ 90.000,00</span>
              </div>
              <div className="flex justify-between">
                <span>Vendas Diretas E-Learning</span>
                <span>R$ 55.200,00</span>
              </div>
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-900">
                <span>Total Consolidado</span>
                <span>R$ 145.200,00</span>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  return (
    <div id="reports-view" className="pt-16 md:pt-18 px-3 md:px-5 pb-8 max-w-[1440px] mx-auto space-y-4 bg-[#f9f9ff] min-h-screen">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white font-bold px-3.5 py-2 rounded shadow-lg flex items-center gap-2 animate-bounce border border-rose-400">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Main Header / Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-md border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#1890ff] text-[10px] font-black uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Alchymist Manager • Central de Relatórios</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Central de Inteligência & Relatórios B2B
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl font-medium">
            Monitore o andamento, engajamento e faturamento de seus treinamentos corporativos com restrições e permissões de acesso baseadas em regras (ACL).
          </p>
        </div>
      </div>

      {activeReportId ? (
        renderReportDetail(activeReportId)
      ) : (
        /* Grid of Reports Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((rep) => {
            const Icon = rep.icon;
            const hasRead = checkPermission(rep.id, 'r');

            return (
              <div
                key={rep.id}
                onClick={() => setActiveReportId(rep.id)}
                className="bg-white border border-slate-200 rounded-md p-5 flex flex-col justify-between gap-4 hover:border-[#1890ff] transition-all cursor-pointer shadow-2xs group relative overflow-hidden"
              >
                {!hasRead && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500" title="Acesso Restrito">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded border flex items-center justify-center shrink-0 ${rep.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#1890ff] transition-colors flex items-center gap-1.5">
                      <span>{rep.title}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">
                      {rep.description}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-[#1890ff] group-hover:translate-x-1 transition-transform flex items-center gap-1 self-start">
                  <span>Visualizar Relatório</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
