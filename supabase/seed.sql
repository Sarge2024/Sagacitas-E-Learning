-- ==========================================
-- Sagacitas E-Learning — SEED DATA
-- Popula o banco com os 4 cursos mockados
-- ==========================================

-- 1. Course Categories
INSERT INTO public.course_categories (id, code, name, description) VALUES
  ('c0000001-0000-0000-0000-000000000001', '100', 'Alchymist Manager & Gestão', 'Cursos oficiais complementares do sistema Alchymist Manager.'),
  ('c0000001-0000-0000-0000-000000000002', '200', 'Gastronomia & Vendas', 'Engenharia de cardápio, precificação e estratégias de venda.'),
  ('c0000001-0000-0000-0000-000000000003', '300', 'Operações & Cozinha', 'Gestão de compras, estoque, fichas técnicas e processos operacionais.');

-- 2. Courses (4 cursos mockados)
INSERT INTO public.courses (id, title, course_code, category_id, level, description, duration_minutes, status) VALUES
  (
    'a0000001-0000-0000-0000-000000000001',
    'Alchymist Manager | Dominando a DRE do Restaurante',
    'DRE-001',
    'c0000001-0000-0000-0000-000000000001',
    'Iniciante',
    'Treinamento oficial complementar do sistema Alchymist Manager pela Sagacitas E-Learning. Aprenda a ler a DRE sem complicação contábil, identificar vazamentos de margem e tomar decisões de gestão para o seu restaurante.',
    330,
    'active'
  ),
  (
    'a0000001-0000-0000-0000-000000000002',
    'Fluxo de Caixa & Fôlego Financeiro no Alchymist Manager',
    'FLX-001',
    'c0000001-0000-0000-0000-000000000001',
    'Intermediário',
    'Módulo de continuidade oficial da Sagacitas E-Learning. Entenda o fôlego financeiro, recebimentos, taxas de antecipação e projeção de entradas e saídas no restaurante.',
    225,
    'active'
  ),
  (
    'a0000001-0000-0000-0000-000000000003',
    'Engenharia de Cardápio e Precificação para Restaurantes',
    'ENG-001',
    'c0000001-0000-0000-0000-000000000002',
    'Intermediário',
    'Como calcular ficha técnica, porcionamento, rendimento real de insumos e calibrar preços para maximizar a margem de contribuição.',
    260,
    'active'
  ),
  (
    'a0000001-0000-0000-0000-000000000004',
    'Gestão de Compras, Fichas Técnicas e Controle de Estoque',
    'GCE-001',
    'c0000001-0000-0000-0000-000000000003',
    'Avançado',
    'Evite desperdício e furto, negocie com fornecedores e controle o giro de estoque para manter o CMV dentro da meta estipulada.',
    300,
    'active'
  );

-- 3. Disciplines (Módulos do curso DRE principal)
INSERT INTO public.disciplines (id, course_id, title, sequence_order) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'MÓDULO 0: BOAS-VINDAS E QUEBRA DE RESISTÊNCIA', 0),
  ('d0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'MÓDULO 1: O QUE É A DRE E QUAL O PAPEL DELA NO RESTAURANTE', 1),
  ('d0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'MÓDULO 2: COMO LER A DRE NO ALCHYMIST MANAGER', 2),
  ('d0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'MÓDULO 3: CENÁRIOS GERENCIAIS E DIAGNÓSTICO RÁPIDO', 3),
  ('d0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'MÓDULO 4: OFICINA PRÁTICA E PLANO DE AÇÃO DE 30 DIAS', 4),
  ('d0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000001', 'MÓDULO DE ENCERRAMENTO: RITUAL MENSAL DO DONO & COMPROMISSO GESTOR', 5),
  -- Disciplines para os demais cursos (simulados)
  ('d0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000002', 'MÓDULO 1: ENTENDENDO O FLUXO DE CAIXA', 0),
  ('d0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000002', 'MÓDULO 2: ANTECIPAÇÃO E TAXAS', 1),
  ('d0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000003', 'MÓDULO 1: FICHA TÉCNICA E PORCIONAMENTO', 0),
  ('d0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000003', 'MÓDULO 2: PRECIFICAÇÃO E MARGEM DE CONTRIBUIÇÃO', 1),
  ('d0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000004', 'MÓDULO 1: COMPRAS E FORNECEDORES', 0),
  ('d0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000004', 'MÓDULO 2: CONTROLE DE ESTOQUE E CMV', 1);

-- 4. Lessons (Aulas soberanas do curso DRE principal — 23 aulas)
INSERT INTO public.lessons (id, title, content, video_url) VALUES
  ('l0000001-0000-0000-0000-000000000001', 'Aula 01: Apresentação Institucional Sagacitas E-Learning', 'Conheça os objetivos do treinamento complementar ao Alchymist Manager e como transformar dados do restaurante em decisões práticas.', NULL),
  ('l0000001-0000-0000-0000-000000000002', 'Aula 02: Quebrando o Medo da DRE & Metáfora do Painel do Carro', 'A DRE não é relatório para contador; é o painel de direção do dono do restaurante.', NULL),
  ('l0000001-0000-0000-0000-000000000003', 'Aula 03: Exercício de Entrada - O que mais me confunde hoje?', 'Responda às 3 perguntas de alinhamento sobre suas maiores dúvidas financeiras no restaurante.', NULL),
  ('l0000001-0000-0000-0000-000000000004', 'Aula 04: A História do Resultado do Mês', 'A DRE organiza em sequência lógica o que foi vendido, os custos de produção, a estrutura e a sobra final.', NULL),
  ('l0000001-0000-0000-0000-000000000005', 'Aula 05: DRE vs. Fluxo de Caixa: Os Dois Espelhos do Restaurante', 'Fluxo de caixa mostra fôlego; DRE mostra desempenho econômico real da operação.', NULL),
  ('l0000001-0000-0000-0000-000000000006', 'Aula 06: Exercício Prático - Caixa ou DRE?', 'Análise de 4 situações do cotidiano gastronômico para identificar a leitura adequada.', NULL),
  ('l0000001-0000-0000-0000-000000000007', 'Aula 07: Receita Bruta, Deduções e Receita Líquida', 'Análise detalhada das vendas, comissões de delivery, taxas de cartão e impostos diretos.', NULL),
  ('l0000001-0000-0000-0000-000000000008', 'Aula 08: CMV — Custo da Mercadoria Vendida na Prática', 'Proteínas, hortifrúti, laticínios, embalagens, insumos diretos e conferência com o estoque.', NULL),
  ('l0000001-0000-0000-0000-000000000009', 'Aula 09: Lucro Bruto e a Margem Bruta do seu Restaurante', 'Entenda o indicador que revela a eficiência da operação antes de qualquer despesa fixa.', NULL),
  ('l0000001-0000-0000-0000-000000000010', 'Aula 10: Despesas Operacionais — Folha, Aluguel, Energia e Mais', 'Mapeamento da estrutura de custos fixos e variáveis que consomem a margem.', NULL),
  ('l0000001-0000-0000-0000-000000000011', 'Aula 11: EBITDA, EBIT e Lucro Líquido — As 3 Camadas de Resultado', 'A hierarquia dos indicadores de resultado e quando cada um importa.', NULL),
  ('l0000001-0000-0000-0000-000000000012', 'Aula 12: O Ponto de Equilíbrio — Quanto Preciso Vender para Não Fechar?', 'Cálculo do Break Even Point no Alchymist Manager.', NULL),
  ('l0000001-0000-0000-0000-000000000013', 'Aula 13: Exercício Prático — Monte sua DRE com Dados Reais', 'Exercício guiado para aplicar os conceitos no seu restaurante.', NULL),
  ('l0000001-0000-0000-0000-000000000014', 'Aula 14: Cenário 1 — Faturamento Sobe e Lucro Cai', 'Investigação de aumento do CMV, mix menos rentável e taxas de canal.', NULL),
  ('l0000001-0000-0000-0000-000000000015', 'Aula 15: Cenário 2 — Margem Bruta Cai (Alarmes da Cozinha)', 'Identificação de compras caras, desperdício e porcionamento fora do padrão.', NULL),
  ('l0000001-0000-0000-0000-000000000016', 'Aula 16: Cenário 3 — EBITDA Pressionado (Estrutura Pesada)', 'Ajustes na folha, aluguel, energia e gastos fixos recorrentes.', NULL),
  ('l0000001-0000-0000-0000-000000000017', 'Aula 17: Cenário 4 — Faturamento Próximo do Ponto de Equilíbrio', 'Como agir quando o restaurante opera sem colchão de segurança.', NULL),
  ('l0000001-0000-0000-0000-000000000018', 'Aula 18: Exercício Prático — Diagnóstico Rápido & Almoço Executivo', 'Aplicações práticas da Matriz de Decisões Gerenciais em cenários reais.', NULL),
  ('l0000001-0000-0000-0000-000000000019', 'Aula 19: Localizando as 5 Linhas Principais no Alchymist Manager', 'Receita Líquida, CMV, Lucro Bruto, Despesas Operacionais e Lucro Líquido.', NULL),
  ('l0000001-0000-0000-0000-000000000020', 'Aula 20: Formulando Hipóteses e Definindo Ações de 30 Dias', 'Transformando diagnósticos da DRE em ações corretivas.', NULL),
  ('l0000001-0000-0000-0000-000000000021', 'Aula 21: Exercício Prático — Caso Pizzaria de Bairro', 'Estudo de caso com alta em insumos, taxas de aplicativos e contratação temporária.', NULL),
  ('l0000001-0000-0000-0000-000000000022', 'Aula 22: O Ritual Mensal Recomendado em 10 Passos', 'Passo a passo sustentável para a revisão mensal da DRE no Alchymist Manager.', NULL),
  ('l0000001-0000-0000-0000-000000000023', 'Aula 23: Matriz de Ações Gerenciais & Compromisso do Gestor', 'Consolidação do aprendizado e transição para o módulo de Fluxo de Caixa.', NULL);

-- 5. Discipline Lessons (junction: vincula aulas aos módulos do curso DRE)
-- Módulo 0 (3 aulas)
INSERT INTO public.discipline_lessons (discipline_id, lesson_id, sequence_order) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000001', 1),
  ('d0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000002', 2),
  ('d0000001-0000-0000-0000-000000000001', 'l0000001-0000-0000-0000-000000000003', 3);
-- Módulo 1 (3 aulas)
INSERT INTO public.discipline_lessons (discipline_id, lesson_id, sequence_order) VALUES
  ('d0000001-0000-0000-0000-000000000002', 'l0000001-0000-0000-0000-000000000004', 1),
  ('d0000001-0000-0000-0000-000000000002', 'l0000001-0000-0000-0000-000000000005', 2),
  ('d0000001-0000-0000-0000-000000000002', 'l0000001-0000-0000-0000-000000000006', 3);
-- Módulo 2 (7 aulas)
INSERT INTO public.discipline_lessons (discipline_id, lesson_id, sequence_order) VALUES
  ('d0000001-0000-0000-0000-000000000003', 'l0000001-0000-0000-0000-000000000007', 1),
  ('d0000001-0000-0000-0000-000000000003', 'l0000001-0000-0000-0000-000000000008', 2),
  ('d0000001-0000-0000-0000-000000000003', 'l0000001-0000-0000-0000-000000000009', 3),
  ('d0000001-0000-0000-0000-000000000003', 'l0000001-0000-0000-0000-000000000010', 4),
  ('d0000001-0000-0000-0000-000000000003', 'l0000001-0000-0000-0000-000000000011', 5),
  ('d0000001-0000-0000-0000-000000000003', 'l0000001-0000-0000-0000-000000000012', 6),
  ('d0000001-0000-0000-0000-000000000003', 'l0000001-0000-0000-0000-000000000013', 7);
-- Módulo 3 (5 aulas)
INSERT INTO public.discipline_lessons (discipline_id, lesson_id, sequence_order) VALUES
  ('d0000001-0000-0000-0000-000000000004', 'l0000001-0000-0000-0000-000000000014', 1),
  ('d0000001-0000-0000-0000-000000000004', 'l0000001-0000-0000-0000-000000000015', 2),
  ('d0000001-0000-0000-0000-000000000004', 'l0000001-0000-0000-0000-000000000016', 3),
  ('d0000001-0000-0000-0000-000000000004', 'l0000001-0000-0000-0000-000000000017', 4),
  ('d0000001-0000-0000-0000-000000000004', 'l0000001-0000-0000-0000-000000000018', 5);
-- Módulo 4 (3 aulas)
INSERT INTO public.discipline_lessons (discipline_id, lesson_id, sequence_order) VALUES
  ('d0000001-0000-0000-0000-000000000005', 'l0000001-0000-0000-0000-000000000019', 1),
  ('d0000001-0000-0000-0000-000000000005', 'l0000001-0000-0000-0000-000000000020', 2),
  ('d0000001-0000-0000-0000-000000000005', 'l0000001-0000-0000-0000-000000000021', 3);
-- Módulo Encerramento (2 aulas)
INSERT INTO public.discipline_lessons (discipline_id, lesson_id, sequence_order) VALUES
  ('d0000001-0000-0000-0000-000000000006', 'l0000001-0000-0000-0000-000000000022', 1),
  ('d0000001-0000-0000-0000-000000000006', 'l0000001-0000-0000-0000-000000000023', 2);

-- 6. Company (Sagacitas Assessoria)
INSERT INTO public.companies (id, name, cnpj, domain, active) VALUES
  ('e0000001-0000-0000-0000-000000000001', 'Sagacitas Assessoria Empresarial', '12.345.678/0001-99', 'sagacitas.com.br', true);

-- 7. Instructor
INSERT INTO public.instructors (id, first_name, last_name, email, avatar_url) VALUES
  ('i0000001-0000-0000-0000-000000000001', 'Gabriel', 'Mendes', 'sagacitas.assessoria@gmail.com', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2ufdo_0iti2LuWcPJ9vB0yyBkVdUYje1yk2v6bk3yMz2K7YDllz2VlHE7-DGb8TKpRSRGbUH7sLP1HN_NX_Wq3m2Ip4t7JRx_K7-ez8Z4jVdxycetQhsUWo94gyACjfMdWseD7GFOEuIHNAVVF9RXUzDA7doPKvzHCPtV0HC1wguYa86scFnGWONbQVKU4XJPmfB08t-th2G9hsfJsP28eesapMBWHa2S5TLIgXAd5DC7EKPvLq2457m6bNMqG_dgDFstNBOt59GO');

-- 8. Student (Demo)
INSERT INTO public.students (id, first_name, last_name, email, avatar_url, enrollment_status, company_id, enrollment_type) VALUES
  ('s0000001-0000-0000-0000-000000000001', 'Gabriel', 'Mendes', 'gabriel.mendes@sagacitas.edu.br', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2ufdo_0iti2LuWcPJ9vB0yyBkVdUYje1yk2v6bk3yMz2K7YDllz2VlHE7-DGb8TKpRSRGbUH7sLP1HN_NX_Wq3m2Ip4t7JRx_K7-ez8Z4jVdxycetQhsUWo94gyACjfMdWseD7GFOEuIHNAVVF9RXUzDA7doPKvzHCPtV0HC1wguYa86scFnGWONbQVKU4XJPmfB08t-th2G9hsfJsP28eesapMBWHa2S5TLIgXAd5DC7EKPvLq2457m6bNMqG_dgDFstNBOt59GO', 'active', 'e0000001-0000-0000-0000-000000000001', 'B2B');

-- 9. Classes (Turmas Virtuais — uma turma demo por disciplina do curso DRE)
INSERT INTO public.classes (id, discipline_id, instructor_id, title, start_date, end_date, max_students, status) VALUES
  ('t0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'i0000001-0000-0000-0000-000000000001', 'Turma Inaugural — Módulo 0', '2026-07-01', '2026-08-31', 100, 'active'),
  ('t0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002', 'i0000001-0000-0000-0000-000000000001', 'Turma Inaugural — Módulo 1', '2026-07-01', '2026-08-31', 100, 'active');

-- 10. Class Enrollment (Matrícula demo)
INSERT INTO public.class_enrollments (class_id, student_id) VALUES
  ('t0000001-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001');
