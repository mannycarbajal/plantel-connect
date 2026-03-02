
-- Drop all restrictive INSERT policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Anyone can insert audit_trail" ON public.audit_trail;
DROP POLICY IF EXISTS "Anyone can upload documentos" ON public.documentos;
DROP POLICY IF EXISTS "Anyone can create solicitudes" ON public.solicitudes;

CREATE POLICY "Anyone can insert audit_trail"
  ON public.audit_trail FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can upload documentos"
  ON public.documentos FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can create solicitudes"
  ON public.solicitudes FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Also add storage policies for the documentos bucket so uploads work
CREATE POLICY "Anyone can upload to documentos bucket"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Staff can read documentos bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documentos');
