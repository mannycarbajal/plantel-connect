
-- Fix: Drop restrictive INSERT policies and recreate as PERMISSIVE (default)
DROP POLICY IF EXISTS "Anyone can insert audit_trail" ON public.audit_trail;
DROP POLICY IF EXISTS "Anyone can upload documentos" ON public.documentos;
DROP POLICY IF EXISTS "Anyone can create solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "Anyone can upload to documentos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Staff can read documentos bucket" ON storage.objects;

-- Recreate as PERMISSIVE (explicitly)
CREATE POLICY "Public insert audit_trail"
  ON public.audit_trail FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public insert documentos"
  ON public.documentos FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public insert solicitudes"
  ON public.solicitudes FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Storage: allow uploads
CREATE POLICY "Public upload documentos bucket"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'documentos');

-- Storage: staff can view
CREATE POLICY "Staff read documentos bucket"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documentos');
