import React, { useState } from 'react';
import { CheckSquare, Square, Layers, AlertCircle, FileText, ArrowRight, ShieldAlert, Sparkles, Filter, ChevronRight } from 'lucide-react';

export const DRERitualMatrixView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ritual' | 'matrix'>('matrix');

  // Interactive state for the 10-step Ritual
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2]);
  const [decisionNotes, setDecisionNotes] = useState<{ [key: number]: string }>({
    1: 'Faturamento de R$ 52.000 importado com sucesso via Alchymist Manager.',
    2: 'Deduções de taxas de cartão conferidas em 8.2%.',
  });

  const toggleStep = (stepNumber: number) => {
    if (completedSteps.includes(stepNumber)) {
      setCompletedSteps(completedSteps.filter((s) => s !== stepNumber));
    } else {
      setCompletedSteps([...completedSteps, stepNumber]);
    }
  };

  const stepsList = [
    { num: 1, title: 'Consolidação das Vendas do Mês', desc: 'Conferir o faturamento bruto total e verificar se todas as vendas balcão, mesa e delivery foram integradas no Alchymist Manager.' },
    { num: 2, title: 'Conferência de Deduções Diretas', desc: 'Verificar se as taxas de cartão de crédito/débito, comissões de marketplaces (iFood, Rappi) e impostos diretos batem com os extratos.' },
    { num: 3, title: 'Apuração da Receita Líquida', desc: 'Calcular a Receita Líquida (Receita Bruta - Deduções) e confirmar o percentual real retido pela operação.' },
    { num: 4, title: 'Fechamento do CMV do Mês', desc: 'Somar compras de proteínas, hortifrúti, laticínios, secos, embalagens e bebidas atreladas às vendas do período.' },
    { num: 5, title: 'Cálculo do Lucro Bruto e Margem Bruta', desc: 'Verificar se a Margem Bruta atingiu a meta (recomendado: superior a 60-68% da Receita Líquida).' },
    { num: 6, title: 'Auditoria de Despesas Operacionais', desc: 'Revisar folha de pagamento, encargos, aluguel, energia elétrica, água, sistemas e marketing.' },
    { num: 7, title: 'Análise do EBITDA e Resultado Operacional', desc: 'Avaliar a sobra operacional gerada antes das retiradas dos sócios ou investimentos de capital.' },
    { num: 8, title: 'Análise de Desvios (Valores Absolutos vs. %)', desc: 'Comparar o resultado do mês atual com o mês anterior e com a meta estipulada no Alchymist Manager.' },
    { num: 9, title: 'Classificação na Matriz de Decisão Gerencial', desc: 'Identificar qual dos 4 Cenários de Variação descreve o momento atual do restaurante.' },
    { num: 10, title: 'Registro do Plano de Ação de 30 Dias', desc: 'Definir 3 ações prioritárias (Imediata, 7 dias, Fechamento) e atribuir os responsáveis.' },
  ];

  // Matrix Scenarios Data
  const matrixScenarios = [
    {
      id: 1,
      name: 'Cenário 1: Faturamento sobe e lucro cai',
      type: 'ALERTA DE MARGEM',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      rootCauses: [
        'Aumento do CMV (matéria-prima mais cara ou desperdício na cozinha)',
        'Mudança desfavorável no mix de vendas (produtos com menor margem vendendo mais)',
        'Descontos e promoções agressivas que corroem a margem unitária',
        'Crescimento exagerado de canais de delivery com altas comissões',
        'Elevação de despesas operacionais variáveis (embalagens, entregadores extra)',
      ],
      managerActions: [
        'Manutenção: Monitorar itens de maior volume no Alchymist Manager',
        'Correção: Revisar fichas técnicas e limitar promoções sem margem mínima',
        'Acompanhamento: Auditar semanalmente o CMV dos 10 insumos mais pesados',
      ],
    },
    {
      id: 2,
      name: 'Cenário 2: Margem bruta cai (Cozinha & Compras)',
      type: 'ALERTA DE CMV',
      badgeColor: 'bg-red-500/10 text-red-300 border-red-500/30',
      rootCauses: [
        'Aumento não repassado nos preços dos insumos críticos (carnes, queijos, óleos)',
        'Desperdício ou perda de rendimento na preparação dos pratos',
        'Porcionamento fora do padrão (pratos saindo mais pesados que a ficha técnica)',
        'Furtos, extravios ou controle frouxo no recebimento de mercadorias',
        'Precificação desatualizada frente aos custos atuais de fornecedores',
      ],
      managerActions: [
        'Manutenção: Reajustar ficha técnica no sistema assim que o fornecedor remarcar',
        'Correção: Implantar balança de porcionamento na praça de montagem',
        'Acompanhamento: Treinar a equipe de cozinha no rendimento dos insumos',
      ],
    },
    {
      id: 3,
      name: 'Cenário 3: EBITDA pressionado (Estrutura Pesada)',
      type: 'ALERTA DE ESTRUTURA',
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      rootCauses: [
        'Folha de pagamento superdimensionada para o volume atual de vendas',
        'Aluguel, condomínio ou custos fixos ocupando percentual excessivo',
        'Desperdício de energia elétrica, gás e utilidades no salão e cozinha',
        'Gastos administrativos e assinaturas de softwares duplicadas ou ociosas',
      ],
      managerActions: [
        'Manutenção: Ajustar escala de trabalho e folgas conforme horários de pico',
        'Correção: Renegociar aluguel ou fornecedores de serviços recorrentes',
        'Acompanhamento: Estabelecer metas de consumo de energia e insumos operacionais',
      ],
    },
    {
      id: 4,
      name: 'Cenário 4: Faturamento próximo do Ponto de Equilíbrio',
      type: 'RISCO OPERACIONAL',
      badgeColor: 'bg-orange-500/10 text-orange-300 border-orange-500/30',
      rootCauses: [
        'Movimento insuficiente no salão/delivery para cobrir o custo fixo',
        'Operação sem margem de segurança (qualquer chuva ou feriado gera prejuízo)',
        'Falta de ações ativas de marketing local e atração de novos clientes',
      ],
      managerActions: [
        'Manutenção: Ativar promoções estratégicas em horários de menor movimento',
        'Correção: Revisar cardápio para destacar pratos com maior margem de contribuição',
        'Acompanhamento: Estabelecer meta diária de vendas necessária para bater o ponto de equilíbrio',
      ],
    },
  ];

  return (
    <div id="matrix-page" className="pt-20 px-8 pb-12 max-w-[1440px] mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#2fd9f4] block mb-1">
            Sagacitas E-Learning • Alchymist Manager
          </span>
          <h2 className="text-3xl font-extrabold text-[#dae2fd] tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-[#2fd9f4]" />
            <span>Matriz de Decisões & Ritual Mensal do Dono</span>
          </h2>
          <p className="text-sm text-[#c7c4d7] mt-1">
            Transforme os dados da DRE do Alchymist Manager em ações práticas de gestão com o método de 10 passos e diagnósticos por cenários.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'matrix' ? 'bg-[#2fd9f4] text-black shadow-lg shadow-[#2fd9f4]/20' : 'text-[#c7c4d7] hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Matriz de Ações Gerenciais</span>
          </button>
          <button
            onClick={() => setActiveTab('ritual')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ritual' ? 'bg-[#2fd9f4] text-black shadow-lg shadow-[#2fd9f4]/20' : 'text-[#c7c4d7] hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Ritual Mensal (10 Passos)</span>
          </button>
        </div>
      </div>

      {activeTab === 'matrix' ? (
        /* Matrix Scenarios Section */
        <div className="space-y-6">
          <div className="bg-white/[0.04] border border-white/10 rounded-[24px] p-6 text-xs text-[#c7c4d7] leading-relaxed flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-[#2fd9f4] shrink-0 mt-1" />
            <div>
              <p className="font-bold text-[#dae2fd] text-sm mb-1">Como usar a Matriz de Ações Gerenciais da Sagacitas E-Learning</p>
              <p>
                Identifique a situação atual do seu restaurante no Alchymist Manager. Cada cenário apresenta as causas raízes mais frequentes e as ações imediatas (Manutenção, Correção e Acompanhamento) recomendadas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matrixScenarios.map((sc) => (
              <div key={sc.id} className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-[24px] p-6 space-y-4 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="font-bold text-base text-[#dae2fd]">{sc.name}</h3>
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${sc.badgeColor}`}>
                    {sc.type}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#c0c1ff] uppercase tracking-wider">Causas Raízes Prováveis:</p>
                  <ul className="space-y-1 text-xs text-[#c7c4d7]">
                    {sc.rootCauses.map((rc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#2fd9f4] font-bold">•</span>
                        <span>{rc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <p className="text-xs font-bold text-[#2fd9f4] uppercase tracking-wider">Ações Gerenciais Recomendadas:</p>
                  <div className="space-y-1.5 text-xs">
                    {sc.managerActions.map((ma, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[#dae2fd] font-medium flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-[#2fd9f4] shrink-0" />
                        <span>{ma}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Ritual Checklist Section */
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-[24px] p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#dae2fd]">Checklist do Ritual Mensal de Leitura no Alchymist Manager</h3>
              <p className="text-xs text-[#c7c4d7]">Progresso do Fechamento Atual: {completedSteps.length} de 10 passos concluídos</p>
            </div>

            <div className="w-48 bg-white/10 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-[#2fd9f4] h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps.length / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {stepsList.map((step) => {
              const isDone = completedSteps.includes(step.num);
              return (
                <div
                  key={step.num}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    isDone ? 'bg-[#2fd9f4]/10 border-[#2fd9f4]/30' : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleStep(step.num)}>
                    <button className="mt-0.5 text-[#2fd9f4]">
                      {isDone ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-[#c7c4d7]" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#2fd9f4]">PASSO {step.num}</span>
                        <h4 className={`text-sm font-bold ${isDone ? 'line-through text-[#c7c4d7]' : 'text-[#dae2fd]'}`}>
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[#c7c4d7] mt-1">{step.desc}</p>
                    </div>
                  </div>

                  {/* Decision note logger */}
                  <div className="ml-8 pt-2">
                    <input
                      type="text"
                      placeholder="Adicionar nota ou decisão tomada neste passo..."
                      value={decisionNotes[step.num] || ''}
                      onChange={(e) =>
                        setDecisionNotes({ ...decisionNotes, [step.num]: e.target.value })
                      }
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-[#dae2fd] placeholder-[#c7c4d7]/40 focus:outline-none focus:border-[#2fd9f4]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
