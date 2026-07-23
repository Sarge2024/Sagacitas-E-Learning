-- 1. Add 'course_code' to Courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS course_code VARCHAR(10) UNIQUE;

-- 2. Add 'enrollment_number' to Class Enrollments table
ALTER TABLE public.class_enrollments 
ADD COLUMN IF NOT EXISTS enrollment_number TEXT UNIQUE;

-- 3. Create a Database Sequence for the sequential part of the enrollment number
CREATE SEQUENCE IF NOT EXISTS enrollment_number_seq START 1;

-- 4. Create the Trigger Function to auto-generate the enrollment number
CREATE OR REPLACE FUNCTION public.generate_enrollment_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_val TEXT;
    date_val TEXT;
    c_code TEXT;
BEGIN
    -- Only generate if it hasn't been manually provided
    IF NEW.enrollment_number IS NULL THEN
        -- Fetch the next value from the sequence
        seq_val := nextval('enrollment_number_seq')::TEXT;
        
        -- Get current date formatted as DD/MM/YYYY
        date_val := to_char(timezone('utc', now()), 'DD/MM/YYYY');
        
        -- Fetch the course_code by navigating through classes -> disciplines -> courses
        SELECT co.course_code INTO c_code
        FROM public.classes cl
        JOIN public.disciplines d ON cl.discipline_id = d.id
        JOIN public.courses co ON d.course_id = co.id
        WHERE cl.id = NEW.class_id;

        -- Fallback if course_code is not set
        IF c_code IS NULL THEN
            c_code := '000';
        END IF;

        -- Concatenate format: sequential/day/month/year/course_code
        NEW.enrollment_number := seq_val || '/' || date_val || '/' || c_code;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach the trigger to class_enrollments
CREATE TRIGGER set_enrollment_number
    BEFORE INSERT ON public.class_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_enrollment_number();
