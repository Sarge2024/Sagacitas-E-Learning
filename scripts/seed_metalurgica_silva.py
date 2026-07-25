import uuid
import os
import datetime

# ------------------------------------------------------------------------------
# Configurações do Banco e Variáveis Globais
# ------------------------------------------------------------------------------
# ID Fixo do Admin Master / Global Tenant para garantir a integridade Multi-Tenant
TENANT_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")

# IDs fixos para referências relacionais exatas
SCENARIO_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")

UC_CMV_ID = uuid.UUID("33333333-3333-3333-3333-333333333331")
UC_CUSTOS_ID = uuid.UUID("33333333-3333-3333-3333-333333333332")
UC_PONTO_ID = uuid.UUID("33333333-3333-3333-3333-333333333333")

def main():
    try:
        import psycopg2
        import psycopg2.extras
    except ImportError:
        print("Erro: A biblioteca 'psycopg2' não está instalada.")
        print("Por favor, instale usando: pip install psycopg2-binary")
        return

    # A string de conexão seria obtida via variável de ambiente, fallback para docker local
    DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:54322/postgres")

    print(f"🔄 Conectando ao PostgreSQL em {DATABASE_URL}...")
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        # Permite uso de UUID
        psycopg2.extras.register_uuid()
        cur = conn.cursor()

        # 1. Inserir Tenant (Opcional, apenas se a tabela tenant já existir e for obrigatório)
        # Vamos assumir que a FK foi deixada abstrata na migration ou apontaria para "tenants"
        # Para evitar FK violations no seed se "tenants" existir no BD, comentaremos aqui, 
        # mas injetaremos as variáveis com o tenant_id.

        # 2. Inserir Fio Condutor (Scenario)
        print("📦 Inserindo Fio Condutor (Scenario)...")
        scenario_insert = """
            INSERT INTO public.scenarios (id, tenant_id, title, content)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """
        scenario_data = (
            SCENARIO_ID,
            TENANT_ID,
            "Caso Prático: Crise na Metalúrgica Silva",
            "A Metalúrgica Silva apresentou um faturamento bruto de R$ 500.000 no último trimestre, porém a margem de contribuição caiu para 15% e o resultado operacional foi negativo. Como gestor financeiro, você foi chamado para realizar o diagnóstico."
        )
        cur.execute(scenario_insert, scenario_data)

        # 3. Inserir Unidades de Conhecimento (Knowledge Units)
        print("📚 Inserindo Unidades de Conhecimento (UCs)...")
        uc_insert = """
            INSERT INTO public.knowledge_units (id, tenant_id, code, title, dimension, bloom_level)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """
        ucs_data = [
            (UC_CMV_ID, TENANT_ID, "UC-FIN-01", "Análise de Custo de Matéria-Prima (CMV/CPV)", "Finanças e Controladoria", 4), # Análise
            (UC_CUSTOS_ID, TENANT_ID, "UC-FIN-02", "Identificação de Despesas Fixas vs Variáveis", "Finanças e Gestão de Custos", 3), # Aplicação
            (UC_PONTO_ID, TENANT_ID, "UC-FIN-03", "Cálculo de Ponto de Equilíbrio Operacional", "Matemática Financeira", 4) # Análise
        ]
        cur.executemany(uc_insert, ucs_data)

        # 4. Inserir Questões e Opções
        print("📝 Inserindo Banco de Questões (Questions & Answer Options)...")
        
        question_insert = """
            INSERT INTO public.questions (id, tenant_id, uc_id, scenario_id, bloom_level_applied, statement, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """
        
        option_insert = """
            INSERT INTO public.answer_options (id, tenant_id, question_id, text, is_correct, feedback)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING;
        """

        # Dados estruturados das questões
        questions_seed = [
            {
                "id": uuid.uuid4(),
                "uc_id": UC_CMV_ID,
                "bloom": 4,
                "statement": "Considerando que o custo do aço representou 60% da receita líquida, qual a ação imediata mais indicada para recuperar a margem de contribuição?",
                "options": [
                    ("Aumentar a verba de marketing para vender mais volume", False, "Isso aumentaria as despesas sem tratar a raiz do problema de CMV."),
                    ("Renegociar contratos com fornecedores e revisar o desperdício fabril", True, "Correto! Reduzir custos diretos impacta diretamente a margem."),
                    ("Cortar benefícios dos funcionários administrativos", False, "Redução de despesa fixa, não afeta a margem de contribuição (CMV)."),
                    ("Tomar um empréstimo de capital de giro", False, "Solução de fluxo de caixa, mascara o problema de margem ruim.")
                ]
            },
            {
                "id": uuid.uuid4(),
                "uc_id": UC_CUSTOS_ID,
                "bloom": 3,
                "statement": "O aluguel do galpão industrial sofreu reajuste de 12% pelo IGPM. Na DRE gerencial da Metalúrgica Silva, esse impacto deve ser classificado como:",
                "options": [
                    ("Custo Variável, pois varia com a inflação", False, "O aluguel não varia conforme a produção."),
                    ("Despesa Financeira, decorrente de reajustes", False, "Reajustes de inflação em contratos não o tornam custo financeiro."),
                    ("Custo/Despesa Fixa, pois independe do volume produzido", True, "Correto! Aluguel é um custo fixo clássico."),
                    ("Dedução da Receita Bruta", False, "Deduções são impostos (ICMS, PIS, COFINS) ou devoluções.")
                ]
            },
            {
                "id": uuid.uuid4(),
                "uc_id": UC_PONTO_ID,
                "bloom": 4,
                "statement": "Se as despesas fixas somam R$ 150.000 mensais e a margem de contribuição atual é de apenas 15%, qual o faturamento mínimo necessário para não ter prejuízo?",
                "options": [
                    ("R$ 1.000.000", True, "Exato! Ponto de Equilíbrio = Custos Fixos (150.000) / Margem de Contribuição (0.15) = R$ 1.000.000."),
                    ("R$ 500.000", False, "Incorreto. A formula correta é Custos Fixos / MC %."),
                    ("R$ 150.000", False, "Isto é apenas cobrir as despesas, esquecendo o custo do produto."),
                    ("R$ 2.000.000", False, "Este valor geraria lucro, não é o mínimo.")
                ]
            }
        ]

        for q in questions_seed:
            # Inserir Questão
            cur.execute(question_insert, (
                q["id"], TENANT_ID, q["uc_id"], SCENARIO_ID, q["bloom"], q["statement"], True
            ))
            
            # Inserir Alternativas
            for text, is_correct, feedback in q["options"]:
                cur.execute(option_insert, (
                    uuid.uuid4(), TENANT_ID, q["id"], text, is_correct, feedback
                ))

        # Efetivar as alterações no BD
        conn.commit()
        print("✅ Script de Seed do Banco de Questões executado com sucesso!")

    except psycopg2.Error as e:
        print(f"❌ Erro de Banco de Dados: {e}")
        if conn:
            conn.rollback()
    except Exception as ex:
        print(f"❌ Erro Inesperado: {ex}")
    finally:
        if 'cur' in locals() and cur:
            cur.close()
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    main()
