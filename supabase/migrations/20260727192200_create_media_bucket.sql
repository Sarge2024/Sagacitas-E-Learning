-- Create media bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read from media bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
TO public 
USING ( bucket_id = 'media' );

-- Allow public access to upload to media bucket (since RLS is being bypassed for this demo/local)
CREATE POLICY "Public Upload Access" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK ( bucket_id = 'media' );

CREATE POLICY "Public Delete Access" 
ON storage.objects FOR DELETE 
TO public 
USING ( bucket_id = 'media' );

CREATE POLICY "Public Update Access" 
ON storage.objects FOR UPDATE
TO public 
USING ( bucket_id = 'media' );

