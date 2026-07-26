-- =============================================================================
-- MIGRAÇÃO: ADIÇÃO DE COMPANY_ID NA TABELA USERS E ATUALIZAÇÃO DA TRIGGER
-- =============================================================================

-- 1. Adicionar coluna company_id na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- 2. Atualizar a trigger de sincronização de papéis para lidar com company_id
CREATE OR REPLACE FUNCTION public.handle_user_role_change()
RETURNS TRIGGER AS $$
DECLARE
    f_name TEXT;
    l_name TEXT;
BEGIN
    -- Split name into first and last name safely
    f_name := split_part(NEW.name, ' ', 1);
    l_name := substring(NEW.name from position(' ' in NEW.name) + 1);
    IF l_name = NEW.name OR l_name IS NULL THEN
        l_name := '';
    END IF;

    IF NEW.role = 'Instrutor' THEN
        -- Insert/Update in instructors
        INSERT INTO public.instructors (id, first_name, last_name, email, avatar_url)
        VALUES (NEW.id, f_name, l_name, NEW.email, NEW.avatar)
        ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            avatar_url = EXCLUDED.avatar_url;
            
        -- Remove from students
        DELETE FROM public.students WHERE id = NEW.id;
        
    ELSIF NEW.role = 'Gestor' OR NEW.role = 'Administrador' THEN
        -- Insert/Update in students
        INSERT INTO public.students (id, first_name, last_name, email, avatar_url, enrollment_status, company_id)
        VALUES (NEW.id, f_name, l_name, NEW.email, NEW.avatar, 'active', NEW.company_id)
        ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            avatar_url = EXCLUDED.avatar_url,
            company_id = EXCLUDED.company_id;
            
        -- Remove from instructors
        DELETE FROM public.instructors WHERE id = NEW.id;
        
    ELSE -- Visitante or other
        -- Remove from both (they are just in public.users, awaiting classification)
        DELETE FROM public.students WHERE id = NEW.id;
        DELETE FROM public.instructors WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger manual de update do users (caso company_id seja modificado e o papel já seja estudante)
CREATE OR REPLACE FUNCTION public.sync_user_company_to_student()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.company_id IS DISTINCT FROM OLD.company_id) AND (NEW.role = 'Gestor' OR NEW.role = 'Administrador') THEN
        UPDATE public.students 
        SET company_id = NEW.company_id 
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_company_changed ON public.users;
CREATE TRIGGER on_user_company_changed
    AFTER UPDATE OF company_id ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_company_to_student();
