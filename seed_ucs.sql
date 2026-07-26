INSERT INTO knowledge_units (id, code, title, bloom_level, tenant_id)
VALUES 
('33333333-3333-4333-8333-333333333333', 'OPS-SAG-01-mock', 'Auditoria de Processos', 4, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('55555555-5555-4555-8555-555555555555', 'FIN-DRE-07-mock', 'CMV & DRE Avançado', 4, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT DO NOTHING;
