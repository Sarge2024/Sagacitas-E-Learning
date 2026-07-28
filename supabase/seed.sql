-- ==========================================
-- Sagacitas E-Learning — SEED DATA
-- Popula o banco com os 4 cursos mockados
-- ==========================================

-- 0. Insert mock users into auth.users (to satisfy foreign keys)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role) VALUES
  ('10000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'sagacitas.assessoria@gmail.com', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Gabriel","last_name":"Mendes"}', 'authenticated', 'authenticated'),
  ('50000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'gabriel.mendes@sagacitas.edu.br', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Gabriel","last_name":"Mendes"}', 'authenticated', 'authenticated'),
  ('50000002-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'sergio.stulzer@sagacitas.com.br', '$2a$10$abcdefghijklmnopqrstuv', now(), '{"provider":"email","providers":["email"]}', '{"first_name":"Sergio","last_name":"Stulzer"}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;


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


