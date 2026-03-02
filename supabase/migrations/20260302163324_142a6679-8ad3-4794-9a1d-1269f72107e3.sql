
-- Drop all RESTRICTIVE insert policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Public insert solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "Public insert documentos" ON public.documentos;
DROP POLICY IF EXISTS "Public insert audit_trail" ON public.audit_trail;

CREATE POLICY "anon_insert_solicitudes" ON public.solicitudes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_insert_documentos" ON public.documentos FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_insert_audit_trail" ON public.audit_trail FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Also allow anon to upload to storage bucket
DROP POLICY IF EXISTS "Anon can upload documents" ON storage.objects;
CREATE POLICY "anon_upload_documentos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'documentos');
