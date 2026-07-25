-- Create users table for Firebase Auth synchronized profiles
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    provider TEXT,
    role TEXT DEFAULT 'Visitante'::text,
    status TEXT DEFAULT 'active'::text CHECK (status IN ('active', 'blocked')),
    company_name TEXT,
    enrollment_type TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    authenticated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated roles to SELECT
CREATE POLICY "Allow public read access to users" 
    ON public.users FOR SELECT TO anon, authenticated USING (true);

-- Allow anon and authenticated roles to INSERT (for registration)
CREATE POLICY "Allow public insert access to users" 
    ON public.users FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow anon and authenticated roles to UPDATE
CREATE POLICY "Allow public update access to users" 
    ON public.users FOR UPDATE TO anon, authenticated USING (true);

-- Trigger to update 'updated_at' column
CREATE TRIGGER on_user_updated
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
