import os
import psycopg2

def main():
    DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:54322/postgres")
    migration_path = "supabase/migrations/20260725_create_question_bank_tables.sql"
    
    print(f"🔄 Conectando ao PostgreSQL local em {DATABASE_URL}...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print(f"📖 Lendo o arquivo de migração: {migration_path}")
        with open(migration_path, "r", encoding="utf-8") as f:
            sql = f.read()
            
        print("⚡ Executando migração SQL...")
        cur.execute(sql)
        conn.commit()
        print("✅ Migração executada com sucesso!")
        
        # Executar o reload do schema cache do PostgREST
        print("🔄 Recarregando cache do PostgREST (NOTIFY pgrst)...")
        cur.execute("NOTIFY pgrst, 'reload schema';")
        conn.commit()
        print("✅ Cache recarregado com sucesso!")
        
    except psycopg2.Error as e:
        print(f"❌ Erro de Banco de Dados: {e}")
        if 'conn' in locals() and conn:
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
