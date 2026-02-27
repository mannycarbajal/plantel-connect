
-- Fix solicitudes INSERT policy: change from RESTRICTIVE to PERMISSIVE
DROP POLICY "Anyone can create solicitudes" ON public.solicitudes;
CREATE POLICY "Anyone can create solicitudes"
  ON public.solicitudes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Fix documentos INSERT policy: change from RESTRICTIVE to PERMISSIVE
DROP POLICY "Anyone can upload documentos" ON public.documentos;
CREATE POLICY "Anyone can upload documentos"
  ON public.documentos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Fix audit_trail INSERT policy: change from RESTRICTIVE to PERMISSIVE
DROP POLICY "Anyone can insert audit_trail" ON public.audit_trail;
CREATE POLICY "Anyone can insert audit_trail"
  ON public.audit_trail
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
