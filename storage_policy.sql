CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK ( bucket_id = 'media' );

CREATE POLICY "Allow public viewing" 
ON storage.objects FOR SELECT 
TO public 
USING ( bucket_id = 'media' );
