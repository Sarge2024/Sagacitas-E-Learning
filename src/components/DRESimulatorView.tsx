import React, { useState } from 'react';
import { Calculator, ArrowRight, AlertTriangle, CheckCircle2, RefreshCw, HelpCircle, Lightbulb } from 'lucide-react';

export const DRESimulatorView: React.FC = () => {
  // Input states in R$
  const [receitaBruta, setReceitaBruta] = useState<number>(50000);
  const [deducoes, setDeducoes] = useState<number>(5000);
  const [cmv, setCmv] = useState<number>(18000);
  const [despesasOperacionais, setDespesasOperacionais] = useState<number>(20000);

  // Calculated values
  const receitaLiquida = Math.max(0, receitaBruta - deducoes);
  const lucroBruto = receitaLiquida - cmv;
  const margemBrutaPct = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;
  const cmvPct = receitaLiquida > 0 ? (cmv / receitaLiquida) * 100 : 0;
  const despesasPct = receitaLiquida > 0 ? (despesasOperacionais / receitaLiquida) * 100 : 0;
  const lucroLiquido = lucroBruto - despesasOperacionais;
  const margemLiquidaPct = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;

  // Ponto de equilíbrio aproximado: Despesas Fixas / (1 - (CMV% + Deduções%))
  const margemContribucionPct = receitaBruta > 0 ? ((receitaLiquida - cmv) / receitaBruta) : 0;
  const pontoEquilibrio = margemContribucionPct > 0 ? Math.round(despesasOperacionais / margemContribucionPct) : 0;
  const colchaoSegurancaPct = pontoEquilibrio > 0 ? Math.round(((receitaBruta - pontoEquilibrio) / receitaBruta) * 100) : 0;

  // Prescriptive Diagnostic based on Sagacitas E-Learning rules
  const getDiagnostic = () => {
    if (lucroLiquido < 0) {
      return {
        title: '⚠️ Prejuízo Operacional Detectado',
        color: 'text-red-700 bg-red-50 border-red-200',
        scenarios: [
          'Seu restaurante está consumindo caixa.',
          cmvPct > 40 ? '• CMV muito elevado (>40%). Verifique porcionamento e desperdício na cozinha.' : '',
          despesasPct > 45 ? '• Despesas operacionais pesadas (>45%). Avalie readequação da folha e custos fixos.' : '',
        ].filter(Boolean),
        action: 'Revisar fichas técnicas dos 10 itens mais vendidos e renegociar insumos críticos em até 7 dias.',
      };
    }

    if (colchaoSegurancaPct < 10) {
      return {
        title: '🟡 Alerta: Faturamento Próximo do Ponto de Equilíbrio',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
        scenarios: [
          `Ponto de equilíbrio estimado em R$ ${pontoEquilibrio.toLocaleString('pt-BR')}.`,
          'Sua margem de segurança é pequena (<10%). Qualquer queda de movimento pode empurrar o restaurante para o vermelho.',
        ],
        action: 'Priorizar itens mais rentáveis do cardápio, elevar o ticket médio e cortar despesas fixas não essenciais.',
      };
    }

    if (cmvPct > 38) {
      return {
        title: '🟠 Atenção ao CMV da Cozinha',
        color: 'text-orange-800 bg-orange-50 border-orange-200',
        scenarios: [
          `CMV representa ${cmvPct.toFixed(1)}% da receita líquida (acima do recomendado de 30-35%).`,
          'Alarmes da cozinha: possível compra mais cara, perda de rendimento, porção fora do padrão ou preço desatualizado.',
        ],
        action: 'Mapear os 10 insumos críticos (proteínas, laticínios), treinar a produção e ajustar precificação dos itens pressionados.',
      };
    }

    return {
      title: '🟢 Operação Saudável com Margem Positiva',
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      scenarios: [
        `Lucro líquido de R$ ${lucroLiquido.toLocaleString('pt-BR')} (${margemLiquidaPct.toFixed(1)}% de margem líquida).`,
        `Colchão de segurança confortável de ${colchaoSegurancaPct}% acima do ponto de equilíbrio.`,
      ],
      action: 'Manter a rotina do ritual mensal de leitura no Alchymist Manager para preservar esta performance.',
    };
  };

  const diag = getDiagnostic();

  return (
    <div id="dre-simulator-page" className="pt-16 md:pt-18 px-3 md:px-5 pb-8 max-w-[1440px] mx-auto space-y-4 bg-[#f9f9ff] min-h-screen">
      {/* Title */}
      <div className="border-b border-slate-200 pb-4 bg-white p-4 rounded-md shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-black tracking-wider text-[#1890ff] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 inline-block mb-1">
            Simulador Financeiro
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#1890ff]" />
            <span>Simulador de DRE do Restaurante</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Simule o desempenho econômico do seu estabelecimento e obtenha um diagnóstico gerencial instantâneo.
          </p>
        </div>

        <button
          onClick={() => {
            setReceitaBruta(50000);
            setDeducoes(5000);
            setCmv(18000);
            setDespesasOperacionais(20000);
          }}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-bold text-slate-700 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restaurar Padrão</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-md p-5 space-y-5 shadow-2xs">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            1. Insira os Parâmetros do Restaurante
          </h3>

          {/* Receita Bruta */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-extrabold text-slate-800">Receita Bruta (Vendas Totais)</label>
              <span className="text-[#1890ff] font-black">R$ {receitaBruta.toLocaleString('pt-BR')}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={200000}
              step={1000}
              value={receitaBruta}
              onChange={(e) => setReceitaBruta(Number(e.target.value))}
              className="w-full accent-[#1890ff] cursor-pointer"
            />
          </div>

          {/* Deduções */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-extrabold text-slate-800">Deduções (Impostos & Taxas Cartão)</label>
              <span className="text-purple-600 font-black">R$ {deducoes.toLocaleString('pt-BR')}</span>
            </div>
            <input
              type="range"
              min={0}
              max={receitaBruta * 0.4}
              step={500}
              value={deducoes}
              onChange={(e) => setDeducoes(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* CMV */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-extrabold text-slate-800">CMV (Insumos & Embalagens)</label>
              <span className="text-amber-600 font-black">R$ {cmv.toLocaleString('pt-BR')} ({cmvPct.toFixed(1)}%)</span>
            </div>
            <input
              type="range"
              min={1000}
              max={receitaBruta * 0.7}
              step={500}
              value={cmv}
              onChange={(e) => setCmv(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Despesas Operacionais */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-extrabold text-slate-800">Despesas Operacionais (Folha & Fixos)</label>
              <span className="text-indigo-600 font-black">R$ {despesasOperacionais.toLocaleString('pt-BR')} ({despesasPct.toFixed(1)}%)</span>
            </div>
            <input
              type="range"
              min={1000}
              max={receitaBruta * 0.7}
              step={500}
              value={despesasOperacionais}
              onChange={(e) => setDespesasOperacionais(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Diagnostic & Cascade Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Diagnostic Box */}
          <div className={`p-5 rounded-md border ${diag.color} shadow-2xs space-y-2`}>
            <div className="flex items-center gap-2 font-black text-sm">
              <span>{diag.title}</span>
            </div>
            <div className="space-y-1 text-xs leading-relaxed font-medium">
              {diag.scenarios.map((sc, i) => (
                <p key={i}>{sc}</p>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-200/60 text-xs font-bold flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-[#1890ff] shrink-0 mt-0.5" />
              <span><strong>Ação Recomendada:</strong> {diag.action}</span>
            </div>
          </div>

          {/* DRE Structure Waterfall Table */}
          <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3 shadow-2xs">
            <h3 className="text-sm font-black text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
              <span>Anatomia da DRE</span>
              <span className="text-xs text-[#1890ff] font-extrabold">Valores e Percentuais</span>
            </h3>

            <div className="space-y-1.5 text-xs font-medium">
              <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-700 font-bold">(+) Receita Bruta</span>
                <span className="font-black text-slate-900">R$ {receitaBruta.toLocaleString('pt-BR')} (100%)</span>
              </div>

              <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-100 text-purple-700">
                <span className="font-bold">(-) Deduções (Taxas & Impostos)</span>
                <span className="font-black">- R$ {deducoes.toLocaleString('pt-BR')} ({((deducoes/receitaBruta)*100).toFixed(1)}%)</span>
              </div>

              <div className="flex justify-between p-2.5 rounded bg-blue-50 border border-blue-200 font-black text-[#1890ff]">
                <span>(=) RECEITA LÍQUIDA</span>
                <span>R$ {receitaLiquida.toLocaleString('pt-BR')} ({((receitaLiquida/receitaBruta)*100).toFixed(1)}%)</span>
              </div>

              <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-100 text-amber-700">
                <span className="font-bold">(-) CMV (Custo Insumos e Bebidas)</span>
                <span className="font-black">- R$ {cmv.toLocaleString('pt-BR')} ({cmvPct.toFixed(1)}%)</span>
              </div>

              <div className="flex justify-between p-2.5 rounded bg-slate-100 border border-slate-200 font-black text-slate-900">
                <span>(=) LUCRO BRUTO (Margem Bruta)</span>
                <span>R$ {lucroBruto.toLocaleString('pt-BR')} ({margemBrutaPct.toFixed(1)}%)</span>
              </div>

              <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-100 text-indigo-700">
                <span className="font-bold">(-) Despesas Operacionais (Estrutura)</span>
                <span className="font-black">- R$ {despesasOperacionais.toLocaleString('pt-BR')} ({despesasPct.toFixed(1)}%)</span>
              </div>

              <div className={`flex justify-between p-3 rounded border font-black text-sm ${
                lucroLiquido >= 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-red-50 border-red-300 text-red-800'
              }`}>
                <span>(=) LUCRO LÍQUIDO (Sobra Final)</span>
                <span>R$ {lucroLiquido.toLocaleString('pt-BR')} ({margemLiquidaPct.toFixed(1)}%)</span>
              </div>
            </div>

            {/* Ponto de equilibrio card */}
            <div className="mt-3 p-3 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <p className="font-extrabold text-slate-900">Ponto de Equilíbrio Estimado</p>
                <p className="text-slate-500 font-medium">Faturamento mínimo para empatar despesas</p>
              </div>
              <div className="text-right font-black text-[#1890ff] text-sm">
                R$ {pontoEquilibrio.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
