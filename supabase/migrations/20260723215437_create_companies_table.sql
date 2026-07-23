-- 1. Create Companies table
CREATE TABLE public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    cnpj TEXT,
    domain TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 2. Update Students table FIRST so the policy can use the new column
ALTER TABLE public.students 
ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
ADD COLUMN enrollment_type TEXT DEFAULT 'individual'::text;

-- Companies policies
-- Students can only see the company they belong to
CREATE POLICY "Students can view their own company"
    ON public.companies FOR SELECT
    USING (
        id IN (SELECT company_id FROM public.students WHERE id = auth.uid())
    );

-- Trigger to update 'updated_at' on companies
CREATE TRIGGER on_company_updated
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update 'updated_at' on companies

-- 3. Update the handle_new_user function to parse B2B fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.students (id, email, first_name, last_name, avatar_url, company_id, enrollment_type)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'avatar_url',
        (NEW.raw_user_meta_data->>'company_id')::UUID,
        COALESCE(NEW.raw_user_meta_data->>'enrollment_type', 'individual')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
