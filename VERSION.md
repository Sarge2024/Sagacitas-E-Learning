# Controle de Versão (Sagacitas E-Learning)

**Versão Atual:** `V 1.1b`

## Regras de Promoção de Versão

Este arquivo atua como o controlador de versão estrutural do projeto. A IA utilizará estas regras para coordenar as atualizações:

- **Primeiro Dígito (X.0):** Alterado *exclusivamente* por solicitação explícita do usuário (ex: grandes refatorações, mudança de escopo do negócio, nova versão do produto).
- **Segundo Dígito (0.Y):** Alterado em casos de mudanças estruturais importantes (ex: mudanças no banco de dados, alterações na arquitetura, criação de novos fluxos de alto nível). A IA deve **solicitar permissão ao usuário** antes de promover este dígito.
- **Caractere Alfabético (0.0c):** Alterações iterativas, correção de bugs, pequenos ajustes de UI, etc. (ex: de `a` para `b`). A IA gerencia esse incremento autonomamente para controle interno após a finalização de uma tarefa.

## Histórico de Versões

- **V 1.1b** (28/07/2026): Correção de bug no script de importação (geração das assinaturas de UCs via `uc_pmest_signatures`).
- **V 1.1a** (28/07/2026): Inicialização do controle de versão e implementação das diretrizes de mitigação de falhas (history/errors).
