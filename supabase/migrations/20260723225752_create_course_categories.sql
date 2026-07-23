-- 1. Create Course Categories Table
CREATE TABLE public.course_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Constraint to ensure 'code' is exactly 3 numerical digits
ALTER TABLE public.course_categories 
ADD CONSTRAINT check_code_format CHECK (code ~ '^[0-9]{3}$');

-- 2. Modify Courses Table to use the new relation
ALTER TABLE public.courses 
DROP COLUMN IF EXISTS category;

ALTER TABLE public.courses
ADD COLUMN category_id UUID REFERENCES public.course_categories(id) ON DELETE SET NULL;

-- 3. Enable RLS and setup policies
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view course categories" 
ON public.course_categories FOR SELECT TO authenticated USING (true);

-- 4. Triggers for 'updated_at'
CREATE TRIGGER on_course_category_updated 
BEFORE UPDATE ON public.course_categories 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
