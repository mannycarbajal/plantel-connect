
CREATE POLICY "allow_anon_insert_storage"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'documentos');
