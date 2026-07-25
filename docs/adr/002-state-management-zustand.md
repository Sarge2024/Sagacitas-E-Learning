# ADR-002: Refatoração de Estado com Zustand e Compliance de UI

## Status
Aceito

## Contexto
A aplicação inicial utilizava um único arquivo `App.tsx` que armazenava mais de 15 instâncias de `useState` locais para gerenciar rotas, abas ativas, modal de usuário, seleção de cursos e estado de login, configurando um antipadrão de monólito de estado (God Object).
Ademais, inconsistências de estilo no Tailwind e desvio da marca corporativa exigiam auditoria visual (`UI Compliance`).

## Decisão
Foi decidida a refatoração do estado global fragmentando-o em domínios semânticos utilizando a biblioteca **Zustand**. 

1. **Separação de Domínios:** Foram criadas as stores `useAuthStore` (para usuários OAuth, simulação de admin e validações RBAC), `useNavigationStore` (para controle de views, collapse de sidebar, e abas ativas do Manager/Expert), e `useCourseStore` (cursos, certificados, módulos).
2. **Design e UI Compliance:** Instituiu-se um script de auditoria e aplicação em massa via expressão regular para forçar estritamente as regras de estilo:
   - Bordas `rounded-md` universalmente.
   - Sombras readequadas (eliminação de `shadow-xl`, `shadow-2xl`, etc. em favor de `shadow-2xs` ou equivalentes restritos).
3. **Persistência Seletiva:** Apenas dados sensíveis e críticos foram persistidos usando o `persist` middleware do Zustand, visando não sobrecarregar o `localStorage`.

## Consequências
- **Positivas:** 
  - Redução drástica da complexidade e linhas do componente raiz `App.tsx`.
  - Diminuição de renderizações desnecessárias em componentes profundos (evitando *prop-drilling*).
  - Unidade visual coesa em toda a aplicação.
- **Negativas:** 
  - Novas dependências para a equipe sênior gerenciar em termos de documentação do padrão Zustand.

## Referências Cruzadas
- *Fase 3 do Protocolo de Melhorias Sagacitas.*
