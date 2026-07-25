import React, { useState } from 'react';
import { 
  SynthesisService, 
  MOCK_SUBMISSOES_SINTESE, 
  MOCK_SKILL_GAPS,
  SubmissaoProjetoSintese
} from '../../services/synthesisService';
import { 
  Sparkles, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  Building2, 
  FileCheck, 
  BarChart3, 
  Star, 
  Lightbulb, 
  ShieldAlert, 
  Send,
  Zap
} from 'lucide-react';

export const SynthesisProjectsView: React.FC = () => {
  const [submissoes, setSubmissoes] = useState<SubmissaoProjetoSintese[]>(MOCK_SUBMISSOES_SINTESE);
  const [selectedSub, setSelectedSub] = useState<SubmissaoProjetoSintese>(MOCK_SUBMISSOES_SINTESE[0]);
  const [notaInput, setNotaInput] = useState<number>(selectedSub.nota_rubrica);
  const [parecerInput, setParecerInput] = useState<string>(selectedSub.parecer_avaliador || '');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const handleSalvarAvaliacao = () => {
    const updated = SynthesisService.avaliarSubmissao(selectedSub.id, notaInput, parecerInput);
    setSubmissoes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSaveSuccessMessage('✅ Parecer e nota da Rubrica de Inovação salvos com sucesso!');
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Intro Banner */}
      <div className="bg-white rounded-md p-6 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-2xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-rose-700 uppercase bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                O Ápice Prático • Nível de Síntese de Bloom
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
              Projetos de Inovação & Dashboard Executivo de Skill Gaps
            </h2>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects Evaluation + Executive Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Synthesis Projects & Innovation Rubric */}
        <div className="bg-white rounded-md p-6 border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-rose-600 uppercase tracking-wider block">
              1. Avaliação de Projetos de Inovação (Síntese)
            </span>
            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200/60">
              Rubrica de Inovação Ativa
            </span>
          </div>

          {/* Submissions List */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Propostas Submetidas pelos Alunos:</label>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {submissoes.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSub(sub);
                    setNotaInput(sub.nota_rubrica);
                    setParecerInput(sub.parecer_avaliador || '');
                  }}
                  className={`p-3 rounded-md border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    selectedSub.id === sub.id
                      ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-500/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="font-extrabold text-slate-900 block line-clamp-1">{sub.titulo_proposta}</span>
                    <span className="text-[10px] text-slate-500">{sub.colaborador_nome} • {sub.departamento}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-rose-700 block">{sub.nota_rubrica} pts</span>
                    <span className="text-[9px] font-bold bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                      {sub.status_avaliacao}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Project Detail & Rubric Evaluation */}
          {selectedSub && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1.5 text-xs">
                <span className="font-bold text-slate-900 block">💡 Melhoria / Inovação Proposta:</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">{selectedSub.descricao_inovacao}</p>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-700">Retorno Estimado:</span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                    {selectedSub.impacto_financeiro_estimado}
                  </span>
                </div>
              </div>

              {/* Rubric Rating Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Nota da Rubrica de Inovação:</span>
                  <span className="font-mono text-rose-600 font-extrabold">{notaInput} / 100</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={notaInput}
                  onChange={(e) => setNotaInput(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              {/* Evaluator Comments */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Parecer do Avaliador / Instrutor:</label>
                <textarea
                  value={parecerInput}
                  onChange={(e) => setParecerInput(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-rose-500/30"
                  placeholder="Escreva a avaliação da viabilidade técnica e grau de inovação..."
                />
              </div>

              <button
                onClick={handleSalvarAvaliacao}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-md shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Salvar Avaliação de Síntese</span>
              </button>

              {saveSuccessMessage && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-bold text-emerald-800 text-center">
                  {saveSuccessMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Executive Skill Gaps Heatmap */}
        <div className="bg-white rounded-md p-6 border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#1890ff] uppercase tracking-wider block">
              2. Dashboard Executivo de Skill Gaps
            </span>
            <span className="text-[10px] font-bold bg-blue-50 text-[#1890ff] px-2 py-0.5 rounded-md border border-blue-200/60">
              Mapa de Calor por Departamento
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Maturidade cognitiva da organização e distribuição de lacunas críticas por setor corporativo.
          </p>

          <div className="space-y-3">
            {MOCK_SKILL_GAPS.map((gap, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    {gap.departamento}
                  </span>
                  <span className="font-mono text-[#1890ff]">{gap.scoreGeralPercentual}% de Proficiência</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-md overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${(gap.dominioAltoCount / gap.totalColaboradores) * 100}%` }} title="Domínio Alto" />
                  <div className="bg-amber-400 h-full" style={{ width: `${(gap.gapMedioCount / gap.totalColaboradores) * 100}%` }} title="Gap Médio" />
                  <div className="bg-rose-500 h-full" style={{ width: `${(gap.gapCriticoCount / gap.totalColaboradores) * 100}%` }} title="Gap Crítico" />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                  <span className="text-emerald-700 font-bold">🟢 {gap.dominioAltoCount} Isentados / Alto Domínio</span>
                  <span className="text-amber-700 font-bold">🟡 {gap.gapMedioCount} Em Desenvolvimento</span>
                  <span className="text-rose-700 font-bold">🔴 {gap.gapCriticoCount} Déficits Críticos</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#1890ff]" />
              <span className="font-bold">Índice Geral de Maturidade Cognitiva:</span>
            </div>
            <span className="font-mono font-black text-sm text-[#1890ff]">80.5% (Nível Avançado)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
