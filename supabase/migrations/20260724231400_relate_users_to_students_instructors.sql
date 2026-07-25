-- 1. Drop all policies on students, instructors, classes, and class_enrollments to allow altering column types
DROP POLICY IF EXISTS "Users can view their own profile" ON public.students;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.students;
DROP POLICY IF EXISTS "Anonymous users can view students" ON public.students;
DROP POLICY IF EXISTS "Allow anon/authenticated insert on students" ON public.students;
DROP POLICY IF EXISTS "Allow anon/authenticated update on students" ON public.students;

-- Also drop policies on companies that depend on students.id
DROP POLICY IF EXISTS "Students can view their own company" ON public.companies;

DROP POLICY IF EXISTS "Authenticated users can view instructors" ON public.instructors;
DROP POLICY IF EXISTS "Anonymous users can view instructors" ON public.instructors;
DROP POLICY IF EXISTS "Allow anon/authenticated insert on instructors" ON public.instructors;
DROP POLICY IF EXISTS "Allow anon/authenticated update on instructors" ON public.instructors;

DROP POLICY IF EXISTS "Authenticated users can view classes" ON public.classes;
DROP POLICY IF EXISTS "Anonymous users can view classes" ON public.classes;
DROP POLICY IF EXISTS "Allow anon/authenticated insert on classes" ON public.classes;
DROP POLICY IF EXISTS "Allow anon/authenticated update on classes" ON public.classes;

DROP POLICY IF EXISTS "Students can view their own enrollments" ON public.class_enrollments;
DROP POLICY IF EXISTS "Instructors can view enrollments for their classes" ON public.class_enrollments;
DROP POLICY IF EXISTS "Anonymous users can view class_enrollments" ON public.class_enrollments;
DROP POLICY IF EXISTS "Allow anon/authenticated insert on class_enrollments" ON public.class_enrollments;
DROP POLICY IF EXISTS "Allow anon/authenticated update on class_enrollments" ON public.class_enrollments;

-- 2. Drop existing foreign keys that depend on UUID types
ALTER TABLE IF EXISTS public.class_enrollments DROP CONSTRAINT IF EXISTS class_enrollments_student_id_fkey;
ALTER TABLE IF EXISTS public.classes DROP CONSTRAINT IF EXISTS classes_instructor_id_fkey;
ALTER TABLE IF EXISTS public.students DROP CONSTRAINT IF EXISTS students_id_fkey;
ALTER TABLE IF EXISTS public.instructors DROP CONSTRAINT IF EXISTS instructors_id_fkey;

-- 3. Drop the old auth trigger on auth.users since we use Firebase Auth now
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 4. Alter columns to TEXT type to match Firebase Auth UID
ALTER TABLE public.students ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.instructors ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.classes ALTER COLUMN instructor_id TYPE TEXT;
ALTER TABLE public.class_enrollments ALTER COLUMN student_id TYPE TEXT;

-- 5. Insert seed users to satisfy existing foreign keys for current students/instructors
INSERT INTO public.users (id, name, email, avatar, provider, role, status) VALUES
  ('10000001-0000-0000-0000-000000000001', 'Gabriel Mendes', 'sagacitas.assessoria@gmail.com', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2ufdo_0iti2LuWcPJ9vB0yyBkVdUYje1yk2v6bk3yMz2K7YDllz2VlHE7-DGb8TKpRSRGbUH7sLP1HN_NX_Wq3m2Ip4t7JRx_K7-ez8Z4jVdxycetQhsUWo94gyACjfMdWseD7GFOEuIHNAVVF9RXUzDA7doPKvzHCPtV0HC1wguYa86scFnGWONbQVKU4XJPmfB08t-th2G9hsfJsP28eesapMBWHa2S5TLIgXAd5DC7EKPvLq2457m6bNMqG_dgDFstNBOt59GO', 'Google OAuth 2.0', 'Instrutor', 'active'),
  ('50000001-0000-0000-0000-000000000001', 'Gabriel Mendes', 'gabriel.mendes@sagacitas.edu.br', 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2ufdo_0iti2LuWcPJ9vB0yyBkVdUYje1yk2v6bk3yMz2K7YDllz2VlHE7-DGb8TKpRSRGbUH7sLP1HN_NX_Wq3m2Ip4t7JRx_K7-ez8Z4jVdxycetQhsUWo94gyACjfMdWseD7GFOEuIHNAVVF9RXUzDA7doPKvzHCPtV0HC1wguYa86scFnGWONbQVKU4XJPmfB08t-th2G9hsfJsP28eesapMBWHa2S5TLIgXAd5DC7EKPvLq2457m6bNMqG_dgDFstNBOt59GO', 'Firebase Auth', 'Administrador', 'active'),
  ('50000002-0000-0000-0000-000000000002', 'Sergio Stulzer', 'sergio.stulzer@sagacitas.com.br', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', 'Firebase Auth', 'Administrador', 'active'),
  ('admin000-0000-0000-0000-000000000000', 'Admin Master', 'admin.master@sagacitas.com.br', '', 'Firebase Auth', 'Administrador', 'active')
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role;

-- 6. Re-establish foreign keys referencing public.users
ALTER TABLE public.students
    ADD CONSTRAINT students_id_fkey FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.instructors
    ADD CONSTRAINT instructors_id_fkey FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.classes
    ADD CONSTRAINT classes_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(id) ON DELETE RESTRICT;

ALTER TABLE public.class_enrollments
    ADD CONSTRAINT class_enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- 7. Trigger to automatically sync users to students or instructors table based on their role
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
        INSERT INTO public.students (id, first_name, last_name, email, avatar_url, enrollment_status)
        VALUES (NEW.id, f_name, l_name, NEW.email, NEW.avatar, 'active')
        ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            avatar_url = EXCLUDED.avatar_url;
            
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

DROP TRIGGER IF EXISTS on_user_role_changed ON public.users;
CREATE TRIGGER on_user_role_changed
    AFTER INSERT OR UPDATE OF role, name, email, avatar ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_role_change();

-- 8. Create new policies that allow anon and authenticated roles to SELECT/INSERT/UPDATE without uuid constraints
CREATE POLICY "Anonymous users can view students" ON public.students FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon/authenticated insert on students" ON public.students FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon/authenticated update on students" ON public.students FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Anonymous users can view instructors" ON public.instructors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon/authenticated insert on instructors" ON public.instructors FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon/authenticated update on instructors" ON public.instructors FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Anonymous users can view classes" ON public.classes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon/authenticated insert on classes" ON public.classes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon/authenticated update on classes" ON public.classes FOR UPDATE TO anon, authenticated USING (true);

CREATE POLICY "Anonymous users can view class_enrollments" ON public.class_enrollments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon/authenticated insert on class_enrollments" ON public.class_enrollments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon/authenticated update on class_enrollments" ON public.class_enrollments FOR UPDATE TO anon, authenticated USING (true);

-- Recreate companies policy with TEXT casting
CREATE POLICY "Students can view their own company"
    ON public.companies FOR SELECT
    USING (
        id IN (SELECT company_id FROM public.students WHERE id = auth.uid()::text)
    );
