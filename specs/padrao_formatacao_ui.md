# Padrão de Formatação e Estilização de UIs - Sagacitas SaaS

Este documento estabelece as diretrizes de design, tokens de estilização e melhores práticas visuais que devem ser seguidas em todas as interfaces da plataforma Sagacitas E-Learning, alinhadas com o design system consolidado no **Simulador de DRE do Restaurante**.

---

## 1. Tokens de Arredondamento (Border Radius)

Para garantir uma interface profissional, corporativa e limpa, limitamos o uso de cantos excessivamente arredondados:

| Elemento | Classe Tailwind | Utilização |
| :--- | :--- | :--- |
| **Painéis & Cards Principais** | `rounded-md` | Contêineres de conteúdo, painéis de controle, formulários e cartões informativos. |
| **Campos de Input & Selects** | `rounded-md` | Caixas de texto, seletores suspensos e inputs de formulário. |
| **Botões & Ações** | `rounded-md` | Botões de ação primária, secundária e botões utilitários. |
| **Badges & Tags Pequenas** | `rounded-md` ou `rounded` | Selos indicadores de nível de Bloom, status ou propriedade. |
| **Elementos Multimídia** | `rounded-md` | Mockups de players de vídeo, áudio ou caixas de imagens. |

> [!IMPORTANT]
> **Evitar:** O uso de classes como `rounded-2xl`, `rounded-3xl` ou `rounded-xl` em contêineres principais, pois quebram o alinhamento retangular sóbrio do sistema financeiro.

---

## 2. Sombras (Box Shadow)

Sombras devem ser discretas para evitar poluição visual e cansaço cognitivo durante a leitura de relatórios extensos:

*   **Padrão para Cards e Painéis:** `shadow-2xs` (sombra extremamente sutil).
*   **Modais e Popups Suspensos (Sobreposições):** `shadow-md` ou `shadow-lg` com fundo semi-transparente fosco (`bg-slate-900/60` ou `backdrop-blur-sm`).

---

## 3. Diretrizes de Bordas (Borders)

As bordas definem os limites dos dados e devem possuir cores sólidas para garantir acessibilidade e legibilidade:

*   **Tema Claro (Padrão):** `border border-slate-200`. Evitar variações de opacidade como `border-slate-200/80` que dificultam o contraste.
*   **Tema Escuro (Modais de Mídia/Slides):** `border border-white/10` sobre fundos profundos (`bg-[#12171c]` ou `bg-slate-950`).

---

## 4. Paleta de Cores e Semântica de Feedback

As cores seguem uma lógica semântica rígida ligada aos resultados operacionais e pedagógicos:

| Significado | Cor Tailwind | Aplicação no DNT / DRE |
| :--- | :--- | :--- |
| **Primário/Destaque** | Azul Sagacitas (`#1890ff` / `bg-blue-50`) | Cabeçalhos, botões principais, links de navegação. |
| **Sucesso / Operação Saudável** | Verde (`emerald-500` / `bg-emerald-50`) | DRE positivo, proficiência atingida, respostas corretas (Gabarito). |
| **Alerta / Margem Curta** | Laranja (`amber-500` / `bg-amber-50`) | Próximo ao ponto de equilíbrio, atenção ao CMV. |
| **Erro / Prejuízo** | Vermelho (`red-500` / `bg-red-50`) | Sobra de caixa negativa (prejuízo), desvios críticos. |
| **Processamento / Tecnologia** | Roxo/Índigo (`indigo-600` / `bg-indigo-50`) | Classificações de tópicos, conexões com o Supabase/Firebase. |

---

## 5. Diretrizes de Tipografia

*   **Títulos e Destaques Premium:** Fonte `Outfit` ou `Inter` com peso extra-negrito (`font-black` ou `font-extrabold`).
*   **Textos de Suporte e Explicações:** `Inter` com peso regular/médio, tamanho de fonte confortável (`text-xs` ou `text-sm`).
*   **Dados e Métricas Monetárias (DRE/Fórmulas):** Sempre formatados com fonte monoespaçada (`font-mono`) e peso negrito para facilitar a comparação visual em colunas.

---

## 6. Responsividade

Toda a área de trabalho deve utilizar sistemas de layout flexíveis (Flexbox e CSS Grid):
*   Usar grids com divisões adaptativas: `grid grid-cols-1 md:grid-cols-12 gap-6`.
*   Painéis de controle devem colapsar verticalmente em telas menores para garantir que gestores consigam operar em tablets ou smartphones de auditoria.

---

## 7. Acessibilidade (WCAG 2.1 AA) e Segurança

A plataforma deve garantir inclusão de todos os usuários finais por meio de diretrizes rígidas de acessibilidade digital e proteção contra injeções XSS:
*   **Contraste Texto-Fundo:** Todas as UIs de textos em slides ou relatórios devem ter contraste mínimo de **4.5:1** contra fundos sólidos (para textos normais) e **3:1** (para textos grandes), conforme diretrizes WCAG AA.
*   **Texto Alternativo (`alt`):** Todo componente de imagem inserido por autoria ou no sistema deve conter o campo de texto alternativo (`alt`) editável e populado para navegabilidade por leitores de tela.
*   **Sanitização de Injeções (XSS):** Todo input de dados com formatação rica (HTML gerado via editores visuais WYSIWYG) deve ser higienizado utilizando bibliotecas de purificação (ex: `DOMPurify`) no momento de gravação e renderização, limitando as tags e atributos permitidos.
