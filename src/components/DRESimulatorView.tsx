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
        color: 'text-red-400 bg-red-500/10 border-red-500/30',
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
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        scenarios: [
          `Ponto de equilíbrio estimado em R$ ${pontoEquilibrio.toLocaleString('pt-BR')}.`,
          'Sua margem de segurança é pequena (<10%). Qualquer queda de movimento pode empurrar o restaurante para o vermelho.',
        ],
        action: 'Priorizar itens mais rentáveis do cardápio, elevar o ticket médio e cortar despesas fixas não essenciais.',
      };
    }

    if (cmvPct > 38) {
      return {
        title: '🟠 Atenção ao CMV da Cozinha (Cenário 2)',
        color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
        scenarios: [
          `CMV representa ${cmvPct.toFixed(1)}% da receita líquida (acima do recomendado de 30-35%).`,
          'Alarmes da cozinha: possível compra mais cara, perda de rendimento, porção fora do padrão ou preço desatualizado.',
        ],
        action: 'Mapear os 10 insumos críticos (proteínas, laticínios), treinar a produção e ajustar precificação dos itens pressionados.',
      };
    }

    return {
      title: '🟢 Operação Saudável com Margem Positiva',
      color: 'text-[#2fd9f4] bg-[#2fd9f4]/10 border-[#2fd9f4]/30',
      scenarios: [
        `Lucro líquido de R$ ${lucroLiquido.toLocaleString('pt-BR')} (${margemLiquidaPct.toFixed(1)}% de margem líquida).`,
        `Colchão de segurança confortável de ${colchaoSegurancaPct}% acima do ponto de equilíbrio.`,
      ],
      action: 'Manter a rotina do ritual mensal de leitura no Alchymist Manager para preservar esta performance.',
    };
  };

  const diag = getDiagnostic();

  return (
    <div id="dre-simulator-page" className="pt-20 px-8 pb-12 max-w-[1440px] mx-auto space-y-8">
      {/* Title */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#2fd9f4] block mb-1">
            Ferramenta Interativa • Alchymist Manager
          </span>
          <h2 className="text-3xl font-extrabold text-[#dae2fd] tracking-tight flex items-center gap-3">
            <Calculator className="w-8 h-8 text-[#2fd9f4]" />
            <span>Simulador de DRE do Restaurante</span>
          </h2>
          <p className="text-sm text-[#c7c4d7] mt-1">
            Simule o desempenho econômico do seu estabelecimento e obtenha um diagnóstico gerencial instantâneo baseado nas diretrizes da Sagacitas E-Learning.
          </p>
        </div>

        <button
          onClick={() => {
            setReceitaBruta(50000);
            setDeducoes(5000);
            setCmv(18000);
            setDespesasOperacionais(20000);
          }}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-[#c7c4d7] hover:text-white transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restaurar Valores Padrão</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-[24px] p-6 space-y-6">
          <h3 className="text-base font-bold text-[#c0c1ff] uppercase tracking-wider border-b border-white/10 pb-3">
            1. Insira os Números do Seu Restaurante
          </h3>

          {/* Receita Bruta */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-[#dae2fd]">Receita Bruta (Vendas Totais)</label>
              <span className="text-[#2fd9f4] font-bold">R$ {receitaBruta.toLocaleString('pt-BR')}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={200000}
              step={1000}
              value={receitaBruta}
              onChange={(e) => setReceitaBruta(Number(e.target.value))}
              className="w-full accent-[#2fd9f4] cursor-pointer"
            />
          </div>

          {/* Deduções */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-[#dae2fd]">Deduções (Cartões, iFood, Impostos)</label>
              <span className="text-[#ddb7ff] font-bold">R$ {deducoes.toLocaleString('pt-BR')}</span>
            </div>
            <input
              type="range"
              min={0}
              max={receitaBruta * 0.4}
              step={500}
              value={deducoes}
              onChange={(e) => setDeducoes(Number(e.target.value))}
              className="w-full accent-[#ddb7ff] cursor-pointer"
            />
          </div>

          {/* CMV */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-[#dae2fd]">CMV (Custo de Insumos & Embalagens)</label>
              <span className="text-amber-400 font-bold">R$ {cmv.toLocaleString('pt-BR')} ({cmvPct.toFixed(1)}%)</span>
            </div>
            <input
              type="range"
              min={1000}
              max={receitaBruta * 0.7}
              step={500}
              value={cmv}
              onChange={(e) => setCmv(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Despesas Operacionais */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-[#dae2fd]">Despesas Operacionais (Folha, Aluguel, Energia)</label>
              <span className="text-purple-300 font-bold">R$ {despesasOperacionais.toLocaleString('pt-BR')} ({despesasPct.toFixed(1)}%)</span>
            </div>
            <input
              type="range"
              min={1000}
              max={receitaBruta * 0.7}
              step={500}
              value={despesasOperacionais}
              onChange={(e) => setDespesasOperacionais(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Diagnostic & Cascade Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Diagnostic Box */}
          <div className={`p-6 rounded-[24px] border ${diag.color} transition-all space-y-3`}>
            <div className="flex items-center gap-2 font-bold text-base">
              <span>{diag.title}</span>
            </div>
            <div className="space-y-1 text-xs leading-relaxed opacity-90">
              {diag.scenarios.map((sc, i) => (
                <p key={i}>{sc}</p>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10 text-xs font-semibold flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-[#2fd9f4] shrink-0 mt-0.5" />
              <span><strong>Ação Recomendada:</strong> {diag.action}</span>
            </div>
          </div>

          {/* DRE Structure Waterfall Table */}
          <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-[24px] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#dae2fd] flex items-center justify-between border-b border-white/10 pb-3">
              <span>Anatomia da DRE (Alchymist Manager)</span>
              <span className="text-xs text-[#2fd9f4] font-semibold">Valores e Percentuais</span>
            </h3>

            <div className="space-y-2 text-xs font-medium">
              <div className="flex justify-between p-3 rounded-xl bg-white/5">
                <span>(+) Receita Bruta</span>
                <span className="font-bold text-white">R$ {receitaBruta.toLocaleString('pt-BR')} (100%)</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-white/5 text-[#ddb7ff]">
                <span>(-) Deduções (Taxas & Impostos)</span>
                <span className="font-bold">- R$ {deducoes.toLocaleString('pt-BR')} ({((deducoes/receitaBruta)*100).toFixed(1)}%)</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-[#2fd9f4]/10 border border-[#2fd9f4]/20 font-bold text-[#2fd9f4]">
                <span>(=) RECEITA LÍQUIDA</span>
                <span>R$ {receitaLiquida.toLocaleString('pt-BR')} ({((receitaLiquida/receitaBruta)*100).toFixed(1)}%)</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-white/5 text-amber-300">
                <span>(-) CMV (Custo Insumos e Bebidas)</span>
                <span className="font-bold">- R$ {cmv.toLocaleString('pt-BR')} ({cmvPct.toFixed(1)}%)</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-[#c0c1ff]/10 border border-[#c0c1ff]/20 font-bold text-[#c0c1ff]">
                <span>(=) LUCRO BRUTO (Margem Bruta)</span>
                <span>R$ {lucroBruto.toLocaleString('pt-BR')} ({margemBrutaPct.toFixed(1)}%)</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-white/5 text-purple-300">
                <span>(-) Despesas Operacionais (Estrutura)</span>
                <span className="font-bold">- R$ {despesasOperacionais.toLocaleString('pt-BR')} ({despesasPct.toFixed(1)}%)</span>
              </div>

              <div className={`flex justify-between p-4 rounded-xl border font-black text-sm ${
                lucroLiquido >= 0 ? 'bg-[#2fd9f4]/20 border-[#2fd9f4]/40 text-[#2fd9f4]' : 'bg-red-500/20 border-red-500/40 text-red-300'
              }`}>
                <span>(=) LUCRO LÍQUIDO (Sobra Final)</span>
                <span>R$ {lucroLiquido.toLocaleString('pt-BR')} ({margemLiquidaPct.toFixed(1)}%)</span>
              </div>
            </div>

            {/* Ponto de equilibrio card */}
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-[#dae2fd]">Ponto de Equilíbrio Estimado</p>
                <p className="text-[#c7c4d7]/70">Faturamento mínimo para empatar despesas</p>
              </div>
              <div className="text-right font-bold text-[#2fd9f4] text-sm">
                R$ {pontoEquilibrio.toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
