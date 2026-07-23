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
    { num: 1, title: 'Consolidação das Vendas do Mês', desc: 'Conferir o faturamento bruto total e verificar se todas as vendas balcão, mesa e delivery foram integradas.' },
    { num: 2, title: 'Conferência de Deduções Diretas', desc: 'Verificar se as taxas de cartão de crédito/débito, comissões de marketplaces e impostos diretos batem com os extratos.' },
    { num: 3, title: 'Apuração da Receita Líquida', desc: 'Calcular a Receita Líquida (Receita Bruta - Deduções) e confirmar o percentual real retido pela operação.' },
    { num: 4, title: 'Fechamento do CMV do Mês', desc: 'Somar compras de proteínas, hortifrúti, laticínios, secos, embalagens e bebidas atreladas às vendas do período.' },
    { num: 5, title: 'Cálculo do Lucro Bruto e Margem Bruta', desc: 'Verificar se a Margem Bruta atingiu a meta (recomendado: superior a 60-68% da Receita Líquida).' },
    { num: 6, title: 'Auditoria de Despesas Operacionais', desc: 'Revisar folha de pagamento, encargos, aluguel, energia elétrica, água, sistemas e marketing.' },
    { num: 7, title: 'Análise do Resultado Operacional', desc: 'Avaliar a sobra operacional gerada antes das retiradas dos sócios ou investimentos de capital.' },
    { num: 8, title: 'Análise de Desvios (Valores Absolutos vs. %)', desc: 'Comparar o resultado do mês atual com o mês anterior e com a meta estipulada.' },
    { num: 9, title: 'Classificação na Matriz de Decisão Gerencial', desc: 'Identificar qual dos 4 Cenários de Variação descreve o momento atual do restaurante.' },
    { num: 10, title: 'Registro do Plano de Ação de 30 Dias', desc: 'Definir 3 ações prioritárias (Imediata, 7 dias, Fechamento) e atribuir os responsáveis.' },
  ];

  // Matrix Scenarios Data
  const matrixScenarios = [
    {
      id: 1,
      name: 'Cenário 1: Faturamento sobe e lucro cai',
      type: 'ALERTA DE MARGEM',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      rootCauses: [
        'Aumento do CMV (matéria-prima mais cara ou desperdício na cozinha)',
        'Mudança desfavorável no mix de vendas (produtos com menor margem vendendo mais)',
        'Descontos e promoções agressivas que corroem a margem unitária',
        'Crescimento exagerado de canais de delivery com altas comissões',
        'Elevação de despesas operacionais variáveis (embalagens, entregadores extra)',
      ],
      managerActions: [
        'Manutenção: Monitorar itens de maior volume no sistema',
        'Correção: Revisar fichas técnicas e limitar promoções sem margem mínima',
        'Acompanhamento: Auditar semanalmente o CMV dos 10 insumos mais pesados',
      ],
    },
    {
      id: 2,
      name: 'Cenário 2: Margem bruta cai (Cozinha & Compras)',
      type: 'ALERTA DE CMV',
      badgeColor: 'bg-red-50 text-red-800 border-red-200',
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
      name: 'Cenário 3: Margem pressionada (Estrutura Pesada)',
      type: 'ALERTA DE ESTRUTURA',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
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
      badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
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
    <div id="matrix-page" className="pt-16 md:pt-18 px-3 md:px-5 pb-8 max-w-[1440px] mx-auto space-y-4 bg-[#f9f9ff] min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 bg-white p-4 rounded-md shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-black tracking-wider text-[#1890ff] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 inline-block mb-1">
            Gestão Prática
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#1890ff]" />
            <span>Matriz de Decisões & Ritual Mensal</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Transforme os dados financeiros em ações práticas de gestão com o método de 10 passos e diagnósticos por cenários.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded border border-slate-200">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'matrix' ? 'bg-[#1890ff] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Matriz de Ações</span>
          </button>
          <button
            onClick={() => setActiveTab('ritual')}
            className={`px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ritual' ? 'bg-[#1890ff] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-xs text-slate-700 leading-relaxed flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#1890ff] shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-slate-900 text-sm mb-0.5">Como usar a Matriz de Ações Gerenciais</p>
              <p className="font-medium">
                Identifique a situação atual do seu estabelecimento. Cada cenário apresenta as causas raízes mais frequentes e as ações recomendadas de manutenção, correção e acompanhamento.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matrixScenarios.map((sc) => (
              <div key={sc.id} className="bg-white border border-slate-200 rounded-md p-5 space-y-4 hover:border-[#1890ff] transition-all shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-black text-sm text-slate-900">{sc.name}</h3>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border ${sc.badgeColor}`}>
                    {sc.type}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Causas Raízes Prováveis:</p>
                  <ul className="space-y-1 text-xs text-slate-600 font-medium">
                    {sc.rootCauses.map((rc, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#1890ff] font-bold">•</span>
                        <span>{rc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] font-black text-[#1890ff] uppercase tracking-wider">Ações Gerenciais Recomendadas:</p>
                  <div className="space-y-1 text-xs">
                    {sc.managerActions.map((ma, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-100 text-slate-800 font-bold flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-[#1890ff] shrink-0" />
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
        <div className="bg-white border border-slate-200 rounded-md p-6 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Checklist do Ritual Mensal de Leitura</h3>
              <p className="text-xs text-slate-500 font-medium">Progresso do Fechamento Atual: {completedSteps.length} de 10 passos concluídos</p>
            </div>

            <div className="w-48 bg-slate-100 h-2.5 rounded overflow-hidden p-0.5 border border-slate-200">
              <div
                className="bg-[#1890ff] h-full rounded transition-all duration-300"
                style={{ width: `${(completedSteps.length / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {stepsList.map((step) => {
              const isDone = completedSteps.includes(step.num);
              return (
                <div
                  key={step.num}
                  className={`p-3.5 rounded border transition-all space-y-2 ${
                    isDone ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleStep(step.num)}>
                    <button className="mt-0.5 text-[#1890ff] cursor-pointer">
                      {isDone ? <CheckSquare className="w-5 h-5 text-[#1890ff]" /> : <Square className="w-5 h-5 text-slate-400" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#1890ff] bg-blue-100 px-1.5 py-0.5 rounded">PASSO {step.num}</span>
                        <h4 className={`text-xs font-black ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">{step.desc}</p>
                    </div>
                  </div>

                  {/* Decision note logger */}
                  <div className="ml-8 pt-1">
                    <input
                      type="text"
                      placeholder="Adicionar nota ou decisão tomada neste passo..."
                      value={decisionNotes[step.num] || ''}
                      onChange={(e) =>
                        setDecisionNotes({ ...decisionNotes, [step.num]: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1890ff] shadow-2xs font-medium"
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
