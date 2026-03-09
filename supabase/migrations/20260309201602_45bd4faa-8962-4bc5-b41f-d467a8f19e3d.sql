
-- Drop the restrictive insert policy and recreate as permissive
DROP POLICY IF EXISTS "allow_insert_solicitudes" ON public.solicitudes;
CREATE POLICY "allow_insert_solicitudes"
ON public.solicitudes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Same for documentos
DROP POLICY IF EXISTS "allow_insert_documentos" ON public.documentos;
CREATE POLICY "allow_insert_documentos"
ON public.documentos
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Same for audit_trail
DROP POLICY IF EXISTS "allow_insert_audit_trail" ON public.audit_trail;
CREATE POLICY "allow_insert_audit_trail"
ON public.audit_trail
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
