# Skills Detalhadas — Sagacitas E-Learning Pipeline de Qualidade

Este documento detalha as Skills operacionais referenciadas pelo [AGENTS.md](file:///mnt/46F84CA3F84C935B/SAGACITAS_SaaS/Projeto%20E-Learning/Sagacitas-E-Learning/docs/AGENTS.md), incluindo pré-condições, etapas numeradas, gates de validação e artefatos gerados.

> **Versão:** 1.0

---

## Skill 1: Handoff Estrutural (Início de Funcionalidade)

### Pré-condições
- Requisito de negócio documentado pelo usuário ou Master Manager.
- Acesso ao Supabase local configurado (`supabaseClient.ts`).

### Etapas

#### Etapa 1.1 — Modelagem de Domínio (Arquiteto)
1. Identificar entidades do domínio afetadas pelo requisito.
2. Criar ou atualizar interfaces `DB*` em `src/types.ts` que espelhem as colunas do schema.
3. Para campos JSONB, criar sub-interfaces tipadas (nunca `any`):
   ```typescript
   // ✅ CORRETO
   interface DBCourse {
     modules?: ModuleSchema[];
     presentation?: PresentationSchema;
   }
   // ❌ PROIBIDO
   interface DBCourse {
     modules?: any[];
     presentation?: any;
   }
   ```
4. Gerar diagrama ER Mermaid se novas tabelas forem criadas.

#### Etapa 1.2 — Script SQL (Banco de Dados)
1. Criar arquivo de migração em `supabase/migrations/` com formato `YYYYMMDDHHMMSS_descricao.sql`.
2. Toda tabela transacional DEVE conter:
   ```sql
   tenant_id UUID NOT NULL REFERENCES tenants(id),
   created_at TIMESTAMPTZ DEFAULT NOW(),
   updated_at TIMESTAMPTZ DEFAULT NOW()
   ```
3. Criar política RLS:
   ```sql
   ALTER TABLE nova_tabela ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "tenant_isolation" ON nova_tabela
     USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
   ```
4. Executar migração: `npx supabase db push` ou aplicação manual.

#### Etapa 1.3 — Serviço Backend (Backend)
1. Adicionar métodos CRUD em `src/services/dbService.ts`.
2. Cada método DEVE seguir esta assinatura:
   ```typescript
   async nomeMetodo(params: InterfaceEspecifica): Promise<InterfaceRetorno>
   ```
3. Cada método DEVE tratar erro com contexto:
   ```typescript
   if (error) {
     console.error(`[dbService.nomeMetodo] ${error.message}`);
     throw new Error(`Falha em nomeMetodo: ${error.message}`);
   }
   ```
4. Toda mutação (INSERT/UPDATE) DEVE injetar `tenant_id`:
   ```typescript
   const tenantId = getCurrentTenantId();
   const payload = { ...data, tenant_id: tenantId };
   ```

### Gate de Saída (Skill 1)

| # | Verificação | Método | Critério PASS |
|---|-------------|--------|---------------|
| 1 | Interfaces sem `any` | `grep ': any' src/types.ts` | 0 ocorrências |
| 2 | Migração com `tenant_id` | Revisão manual do `.sql` | Presente em toda tabela |
| 3 | Métodos tipados | `grep ': any' src/services/dbService.ts` | 0 ocorrências |
| 4 | Compilação | `npm run lint` | 0 erros |

---

## Skill 2: Handoff de Interface e Estado

### Pré-condições
- Métodos do `dbService` finalizados e tipados.
- Stores Zustand existentes ou planejadas para o domínio.

### Etapas

#### Etapa 2.1 — Componentes React (Frontend)
1. Criar componente em `src/components/` usando o padrão:
   ```typescript
   interface NomeComponenteProps {
     propA: TipoA;
     propB: TipoB;
     onAction: (param: TipoParam) => void;  // NUNCA (param: any) => void
   }
   
   export default function NomeComponente({ propA, propB, onAction }: NomeComponenteProps) {
     // Corpo do componente
   }
   ```
2. Estado local DEVE ser tipado explicitamente:
   ```typescript
   const [items, setItems] = useState<DBCourse[]>([]);      // ✅
   const [items, setItems] = useState([]);                   // ❌ tipo inferido como never[]
   const [items, setItems] = useState<any[]>([]);            // ❌ PROIBIDO
   ```
3. Dados DEVEM vir exclusivamente de hooks/stores/dbService:
   ```typescript
   // ✅ CORRETO — dados do banco
   const courses = useCoursesFromDB();
   
   // ❌ PROIBIDO — dados mock inline
   const courses = [{ id: '1', title: 'Curso Mock', ... }];
   ```
4. Estilos DEVEM seguir `padrao_formatacao_ui.md`:
   - Bordas: `rounded-md` (nunca `rounded-2xl`, `rounded-3xl`)
   - Sombras: `shadow-2xs` para cards, `shadow-lg` para modais
   - Cores: paleta semântica (#1890ff, emerald-500, amber-500, red-500)

#### Etapa 2.2 — Validação Visual (L1)
1. Master Manager verifica conformidade com `padrao_formatacao_ui.md`.
2. Verifica ausência de dados mock hardcoded.

### Gate de Saída (Skill 2)

| # | Verificação | Método | Critério PASS |
|---|-------------|--------|---------------|
| 1 | Props tipadas | Revisão: toda prop tem tipo explícito | 0 `any` em props |
| 2 | Sem mock residual | `grep -rn 'mockData\|MOCK_' src/components/` | 0 ocorrências |
| 3 | UI conforme | Revisão visual contra `padrao_formatacao_ui.md` | Conforme |
| 4 | Compilação | `npm run lint` | 0 erros |

---

## Skill 3: Loop de Qualidade TDD

### Pré-condições
- Código de produção entregue e compilando.
- Vitest configurado (`vitest.config.ts`).

### Etapas

#### Etapa 3.1 — Geração de Testes (TDD)
1. Criar arquivo `*.test.ts` na pasta `__tests__/` adjacente ao módulo.
2. Estrutura obrigatória:
   ```typescript
   import { describe, it, expect, vi } from 'vitest';
   
   describe('nomeModulo', () => {
     // Cenários felizes
     it('deve retornar resultado esperado quando input válido', () => {
       // Arrange → Act → Assert
     });
     
     // Cenários de borda
     it('deve lançar erro quando input inválido', () => {
       // Arrange → Act → Assert
     });
     
     // Cenários de null/undefined (strict mode)
     it('deve tratar null gracefully', () => {
       // Arrange → Act → Assert
     });
   });
   ```
3. Mocks DEVEM ser tipados:
   ```typescript
   // ✅ CORRETO
   const mockFn = vi.fn<[string], Promise<DBCourse | null>>();
   
   // ❌ PROIBIDO
   const mockFn = vi.fn() as any;
   ```

#### Etapa 3.2 — Execução e Avaliação
1. Executar: `npx vitest run`
2. Se falhas detectadas, devolver ao desenvolvedor responsável com log de erro.
3. Verificar cobertura: `npx vitest run --coverage`

### Gate de Saída (Skill 3)

| # | Verificação | Método | Critério PASS |
|---|-------------|--------|---------------|
| 1 | Testes passando | `npx vitest run` | 0 falhas |
| 2 | Sem `as any` | `grep 'as any' src/**/*.test.ts` | 0 ocorrências |
| 3 | Cobertura | `npx vitest run --coverage` | ≥ 80% em services/utils |

---

## Skill 4: GateKeeper de Compliance

### Pré-condições
- Código e testes finalizados.

### Checklist de Auditoria

Execute sequencialmente. Se qualquer item for FAIL, o código retorna ao desenvolvedor:

```bash
# 1. Compilação estrita
npm run lint
# Critério: exit code 0

# 2. Testes unitários
npx vitest run
# Critério: 0 falhas

# 3. Auditoria de any
grep -rn ': any' src/ --include='*.ts' --include='*.tsx' | grep -v node_modules | grep -v 'LEGACY-ANY'
# Critério: 0 resultados

# 4. Auditoria de console.log de debug
grep -rn 'console.log' src/ --include='*.ts' --include='*.tsx' | grep -v node_modules | grep -v '__tests__'
# Critério: 0 resultados (usar console.error para erros reais)

# 5. Auditoria de dados mock em componentes
grep -rn 'mockData\|MOCK_\|hardcoded\|faker\.' src/components/ --include='*.tsx'
# Critério: 0 resultados

# 6. Auditoria de RLS em migrações novas
grep -l 'CREATE TABLE' supabase/migrations/*.sql | xargs grep -L 'tenant_id'
# Critério: 0 resultados (toda tabela nova tem tenant_id)
```

### Veredito

| Resultado | Ação |
|-----------|------|
| Todos PASS | Emitir `/status: APROVADO` |
| Qualquer FAIL | Emitir `/status: REPROVADO` com lista de itens falhos, devolver ao agente responsável |

---

## Skill 5: Code Quality Gate (Mandatório e Bloqueante)

### Pré-condições
- Todas as skills anteriores executadas.

### Verificações Obrigatórias

| # | O quê | Comando | PASS se |
|---|-------|---------|---------|
| 1 | TypeScript strict compile | `npm run lint` | Exit 0, 0 erros |
| 2 | Testes verdes | `npx vitest run` | 0 falhas |
| 3 | Zero `any` novo | `grep -c ': any' src/types.ts src/services/dbService.ts` | 0 |
| 4 | Erros contextualizados | Revisão: todo `throw` tem mensagem descritiva | Conforme |
| 5 | Sem prop-drilling | Revisão: dados globais via Zustand, não via 5+ níveis de props | Conforme |

**NOTA:** Este gate é executado **ANTES** de qualquer entrega ao usuário. Se falhar, o código **NÃO É ENTREGUE** até correção.

---

## Skill 6: Fechamento de Ciclo (Documentação)

### Pré-condições
- Skill 5 (Quality Gate) passou com APROVADO.

### Etapas

1. **ADR** (se decisão arquitetural foi tomada):
   - Criar arquivo `docs/adr/NNN-descricao.md` com seções: Status, Contexto, Decisão, Consequências.
2. **Diagrama** (se schema mudou):
   - Atualizar diagramas Mermaid em `docs/archify/`.
3. **Walkthrough**:
   - Produzir resumo das alterações realizadas com links para arquivos modificados.

---

## Skill 7: Error Handling Pattern

### Pré-condições
- Qualquer criação ou modificação de método assíncrono em `src/services/`.

### Padrão Mandatório

```typescript
/**
 * Busca todos os cursos do tenant atual.
 * 
 * O RLS filtra automaticamente por tenant_id na sessão,
 * mas mantemos o filtro explícito como camada de segurança adicional.
 */
async getCourses(): Promise<DBCourse[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // Contextualiza o erro com o nome do método para facilitar debugging em produção
    console.error(`[dbService.getCourses] Falha ao buscar cursos: ${error.message}`);
    throw new Error(`Falha ao buscar cursos: ${error.message}`);
  }

  // Garante retorno de array vazio ao invés de null para evitar NPE no consumidor
  return data ?? [];
}
```

### Regras

1. **Nunca** `throw error` diretamente — sempre `throw new Error('contexto: ' + error.message)`.
2. **Sempre** `console.error` antes do throw com tag `[nomeServico.nomeMetodo]`.
3. **Sempre** usar `??` (nullish coalescing) ao invés de `||` para valores que podem ser `0` ou `''`.
4. **Nunca** silenciar erros com `catch () {}` vazio.
5. Métodos que podem retornar `null` DEVEM declarar `Promise<T | null>` explicitamente.

---

## Referências Cruzadas

| Documento | Propósito |
|-----------|-----------|
| [AGENTS.md](file:///mnt/46F84CA3F84C935B/SAGACITAS_SaaS/Projeto%20E-Learning/Sagacitas-E-Learning/docs/AGENTS.md) | Papéis e responsabilidades dos agentes |
| [especificacao_sistema.md](file:///mnt/46F84CA3F84C935B/SAGACITAS_SaaS/Projeto%20E-Learning/Sagacitas-E-Learning/specs/especificacao_sistema.md) | Especificação funcional e técnica |
| [padrao_formatacao_ui.md](file:///mnt/46F84CA3F84C935B/SAGACITAS_SaaS/Projeto%20E-Learning/Sagacitas-E-Learning/specs/padrao_formatacao_ui.md) | Design tokens e regras visuais |
| [implementation_plan.md](file:///mnt/46F84CA3F84C935B/SAGACITAS_SaaS/Projeto%20E-Learning/Sagacitas-E-Learning/specs/implementation_plan.md) | Arquitetura multi-tenant e roadmap |
