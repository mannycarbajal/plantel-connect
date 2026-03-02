-- Drop ALL existing INSERT policies for the 3 tables
DROP POLICY IF EXISTS "anon_insert_solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "anon_insert_documentos" ON public.documentos;
DROP POLICY IF EXISTS "anon_insert_audit_trail" ON public.audit_trail;

-- Also drop any old restrictive policies that might still linger
DROP POLICY IF EXISTS "Anyone can insert solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "Anyone can insert documentos" ON public.documentos;
DROP POLICY IF EXISTS "Anyone can insert audit_trail" ON public.audit_trail;
DROP POLICY IF EXISTS "Public insert solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "Public insert documentos" ON public.documentos;
DROP POLICY IF EXISTS "Public insert audit_trail" ON public.audit_trail;

-- Recreate clean PERMISSIVE INSERT policies for anon and authenticated
CREATE POLICY "allow_insert_solicitudes"
  ON public.solicitudes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "allow_insert_documentos"
  ON public.documentos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "allow_insert_audit_trail"
  ON public.audit_trail
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Also ensure the generate_folio trigger exists
DROP TRIGGER IF EXISTS set_folio ON public.solicitudes;
CREATE TRIGGER set_folio
  BEFORE INSERT ON public.solicitudes
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_folio();