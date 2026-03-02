
-- ============================================================
-- FIX: All INSERT policies were created as RESTRICTIVE instead of PERMISSIVE
-- ============================================================

-- 1. Drop ALL existing INSERT policies on solicitudes
DROP POLICY IF EXISTS "allow_insert_solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "anon_insert_solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "Anyone can create solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "Anyone can insert solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "Public insert solicitudes" ON public.solicitudes;

-- 2. Drop ALL existing INSERT policies on documentos
DROP POLICY IF EXISTS "allow_insert_documentos" ON public.documentos;
DROP POLICY IF EXISTS "anon_insert_documentos" ON public.documentos;
DROP POLICY IF EXISTS "Anyone can upload documentos" ON public.documentos;
DROP POLICY IF EXISTS "Anyone can insert documentos" ON public.documentos;
DROP POLICY IF EXISTS "Public insert documentos" ON public.documentos;

-- 3. Drop ALL existing INSERT policies on audit_trail
DROP POLICY IF EXISTS "allow_insert_audit_trail" ON public.audit_trail;
DROP POLICY IF EXISTS "anon_insert_audit_trail" ON public.audit_trail;
DROP POLICY IF EXISTS "Anyone can insert audit_trail" ON public.audit_trail;
DROP POLICY IF EXISTS "Public insert audit_trail" ON public.audit_trail;

-- 4. Recreate as explicitly PERMISSIVE
CREATE POLICY "allow_insert_solicitudes"
  ON public.solicitudes
  AS PERMISSIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "allow_insert_documentos"
  ON public.documentos
  AS PERMISSIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "allow_insert_audit_trail"
  ON public.audit_trail
  AS PERMISSIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 5. Ensure generate_folio trigger exists
DROP TRIGGER IF EXISTS set_folio ON public.solicitudes;
CREATE TRIGGER set_folio
  BEFORE INSERT ON public.solicitudes
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_folio();
