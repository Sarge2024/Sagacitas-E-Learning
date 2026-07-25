import React, { useState } from 'react';
import { 
  DNTEngineService, 
  MOCK_COLABORADORES, 
  TurmaVariavelDinamica, 
  MetricDNTROI 
} from '../../services/dntEngineService';
import { MOCK_UNIDADES_CONHECIMENTO } from '../../services/expertService';
import { UnidadeConhecimento, MatrizProficienciaColaborador } from '../../types/edtechExpert';
import { 
  Target, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Layers,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const DNTEngineView: React.FC = () => {
  const [selectedUc, setSelectedUc] = useState<UnidadeConhecimento>(MOCK_UNIDADES_CONHECIMENTO[0]);
  const [reguaCorte, setReguaCorte] = useState<number>(80);
  const [diagnosticoResult, setDiagnosticoResult] = useState<{
    proficiencias: MatrizProficienciaColaborador[];
    turmaDinamica?: TurmaVariavelDinamica;
    roi: MetricDNTROI;
  }>(() => DNTEngineService.avaliarTurmaDNT(MOCK_UNIDADES_CONHECIMENTO[0], MOCK_COLABORADORES, 80));

  const handleRecalcularDNT = (uc: UnidadeConhecimento, corte: number) => {
    const res = DNTEngineService.avaliarTurmaDNT(uc, MOCK_COLABORADORES, corte);
    setDiagnosticoResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Top ROI Header */}
      <div className="bg-white rounded-md p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-2xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  DNT Engine • Isenção Inteligente Ativa
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                Diagnóstico de Necessidades de Treinamento (DNT) & ROI Corporativo
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500">Régua de Corte:</span>
            <span className="text-xs font-mono font-extrabold text-[#1890ff] bg-blue-50 px-3 py-1 rounded-md border border-blue-200/60">
              {reguaCorte}% de Acertos
            </span>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-md border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] font-mono font-bold uppercase">Colaboradores Avaliados</span>
              <Users className="w-4 h-4 text-[#1890ff]" />
            </div>
            <span className="text-2xl font-black text-slate-900 block font-mono">
              {diagnosticoResult.roi.totalColaboradoresAvaliados}
            </span>
            <span className="text-[11px] text-slate-500">Força de trabalho no teste</span>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-md border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[10px] font-mono font-bold uppercase">Taxa de Isenção</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-black text-emerald-900 block font-mono">
              {diagnosticoResult.roi.percentualIsencao}%
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              {diagnosticoResult.roi.totalIsencoesConcedidas} colaboradores dispensados
            </span>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-md border border-blue-200 space-y-1">
            <div className="flex items-center justify-between text-blue-700">
              <span className="text-[10px] font-mono font-bold uppercase">Horas Salvas na Operação</span>
              <Clock className="w-4 h-4 text-[#1890ff]" />
            </div>
            <span className="text-2xl font-black text-blue-900 block font-mono">
              {diagnosticoResult.roi.horasTreinamentoSalvas}h
            </span>
            <span className="text-[11px] text-blue-700 font-medium">Tempo produtivo mantido</span>
          </div>

          <div className="p-4 bg-purple-50/60 rounded-md border border-purple-200 space-y-1">
            <div className="flex items-center justify-between text-purple-700">
              <span className="text-[10px] font-mono font-bold uppercase">Economia Financeira (ROI)</span>
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-2xl font-black text-purple-900 block font-mono">
              R$ {diagnosticoResult.roi.economiaFinanceiraEstimada.toLocaleString('pt-BR')}
            </span>
            <span className="text-[11px] text-purple-700 font-medium">Economizados em HH operacionais</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Calibration & Controls */}
        <div className="bg-white rounded-md p-6 border border-slate-200 space-y-4 shadow-2xs">
          <span className="text-[10px] font-mono font-bold text-[#1890ff] uppercase tracking-wider block">
            1. Calibração da Régua de Isenção DNT
          </span>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Unidade de Conhecimento em Teste:</label>
              <select
                value={selectedUc.id}
                onChange={(e) => {
                  const uc = MOCK_UNIDADES_CONHECIMENTO.find((u) => u.id === e.target.value) || MOCK_UNIDADES_CONHECIMENTO[0];
                  setSelectedUc(uc);
                  handleRecalcularDNT(uc, reguaCorte);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#1890ff]/30 outline-none"
              >
                {MOCK_UNIDADES_CONHECIMENTO.map((u) => (
                  <option key={u.id} value={u.id}>
                    [{u.codigo}] {u.titulo} ({u.meta_bloom})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Régua de Corte para Isenção Automática:</span>
                <span className="font-mono text-[#1890ff] text-sm">{reguaCorte}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={reguaCorte}
                onChange={(e) => {
                  const corte = Number(e.target.value);
                  setReguaCorte(corte);
                  handleRecalcularDNT(selectedUc, corte);
                }}
                className="w-full accent-[#1890ff] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>50% (Permissiva)</span>
                <span className="font-bold text-emerald-600">80% (Padrão Corporativo)</span>
                <span>95% (Rigorosa)</span>
              </div>
            </div>

            {/* Individual Proficiency Table */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Resultados Diagnósticos Individuais:</span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {diagnosticoResult.proficiencias.map((p) => {
                  const colab = MOCK_COLABORADORES.find((c) => c.id === p.colaborador_id);
                  return (
                    <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 block">{colab?.nome}</span>
                        <span className="text-[10px] text-slate-500">{colab?.cargo} • {colab?.departamento}</span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800 block mb-0.5">{p.score_percentual}%</span>
                        {p.isentado ? (
                          <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ISENTADO
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 justify-end">
                            <XCircle className="w-3 h-3 text-rose-600" /> REFORÇO
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Generated Dynamic Variable Cohort */}
        <div className="bg-white rounded-md p-6 border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">
              2. Turmas Variáveis e Dinâmicas Geradas
            </span>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/60">
              Segmentação Exclusiva por Déficit Real
            </span>
          </div>

          {diagnosticoResult.turmaDinamica ? (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-md space-y-2">
                <span className="text-[10px] font-mono font-bold text-indigo-700">CÓDIGO: {diagnosticoResult.turmaDinamica.id}</span>
                <h4 className="font-extrabold text-sm text-slate-900">{diagnosticoResult.turmaDinamica.titulo}</h4>
                <p className="text-xs text-indigo-900">{diagnosticoResult.turmaDinamica.descricao_deficit}</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">
                  Alunos Alocados nesta Turma ({diagnosticoResult.turmaDinamica.colaboradores_alocados.length}):
                </span>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {diagnosticoResult.turmaDinamica.colaboradores_alocados.map((c) => (
                    <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900 block">{c.nome}</span>
                        <span className="text-[10px] text-slate-500">{c.cargo} • {c.email}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                        Necessita Cursar
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#1890ff] shrink-0 mt-0.5" />
                <span>
                  <strong>Ganho Operacional:</strong> {diagnosticoResult.roi.totalIsencoesConcedidas} colaborador(es) com domínio comprovado continuam em produção normal na empresa sem interromper suas atividades.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-emerald-50/50 rounded-md border border-emerald-200 text-emerald-800 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <span className="font-extrabold text-sm block">100% da Força de Trabalho Isentada!</span>
              <p>Todos os colaboradores avaliados comprovaram domínio com nota igual ou superior a {reguaCorte}%. Nenhuma turma de reforço necessária.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
