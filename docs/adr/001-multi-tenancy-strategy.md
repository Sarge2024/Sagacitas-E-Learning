# ADR-001: Arquitetura Multi-Tenancy e Row Level Security (RLS)

## Status
Aceito

## Contexto
O Sagacitas LMS está sendo refatorado para operar como um SaaS B2B, permitindo que múltiplas empresas acessem a plataforma utilizando o mesmo banco de dados PostgreSQL (via Supabase), porém mantendo rigoroso isolamento de dados entre clientes (Tenants). 
O banco estava inicialmente modelado sem distinção de clientes, o que trazia riscos críticos de vazamento de informações.

## Decisão
Implementamos um modelo de "Single Database, Shared Schema" suportado estritamente por políticas de **Row Level Security (RLS)**.

1. **Estrutura de Dados:** Todas as tabelas pertinentes ao domínio do LMS base (`course_categories`, `courses`, `classes`, `students`, `class_enrollments`, `instructors`, `class_schedules`, etc.) ganharam uma coluna obrigatória `tenant_id` (tipo `uuid`).
2. **Isolamento de Políticas (RLS):** Revogamos todas as políticas abertas (`anon`) e instituímos que qualquer operação (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) exige que o usuário esteja autenticado (`auth.role() = 'authenticated'`) e que o `tenant_id` da linha corresponda à configuração da sessão injetada.
3. **Injeção via Client:** O backend Node.js e o client Supabase no frontend foram adaptados para injetar o parâmetro `x-tenant-id` nos headers de conexão, que define a variável temporária `app.current_tenant_id` no escopo da transação PostgreSQL.

## Consequências
- **Positivas:** 
  - Segurança nativa a nível de banco de dados, prevenindo falhas de código na camada de aplicação (Express/React).
  - Escalabilidade simplificada (sem necessidade de gerenciar múltiplos bancos/schemas).
- **Negativas:** 
  - Necessidade de gerenciar e injetar o `tenant_id` globalmente em todos os requests.
  - A complexidade das migrações de banco de dados aumenta.

## Validação e Auditoria (Compliance)
Qualquer nova tabela criada deverá passar pela esteira de validação do *Auditor de Compliance e Segurança (L2)* para confirmar a presença do `tenant_id` e a ativação correta do RLS.
