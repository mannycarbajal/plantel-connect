-- Storage policies for bucket "documentos"
DROP POLICY IF EXISTS "public_upload_documentos" ON storage.objects;
DROP POLICY IF EXISTS "public_read_documentos" ON storage.objects;
DROP POLICY IF EXISTS "anyone_upload_documentos" ON storage.objects;
DROP POLICY IF EXISTS "anyone_read_documentos" ON storage.objects;

CREATE POLICY "public_upload_documentos"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "public_read_documentos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'documentos');

-- Change INSERT RLS to PERMISSIVE TO public
DROP POLICY IF EXISTS "anyone_can_insert_solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "public_insert_solicitudes" ON public.solicitudes;
CREATE POLICY "public_insert_solicitudes"
ON public.solicitudes AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "anyone_can_insert_documentos" ON public.documentos;
DROP POLICY IF EXISTS "public_insert_documentos" ON public.documentos;
CREATE POLICY "public_insert_documentos"
ON public.documentos AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "anyone_can_insert_audit_trail" ON public.audit_trail;
DROP POLICY IF EXISTS "public_insert_audit_trail" ON public.audit_trail;
CREATE POLICY "public_insert_audit_trail"
ON public.audit_trail AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);

-- Recreate SELECT/UPDATE as PERMISSIVE
DROP POLICY IF EXISTS "staff_can_read_solicitudes" ON public.solicitudes;
CREATE POLICY "staff_can_read_solicitudes"
ON public.solicitudes AS PERMISSIVE FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'revisor'::app_role) OR has_role(auth.uid(), 'enlace'::app_role) OR has_role(auth.uid(), 'direccion'::app_role) OR has_role(auth.uid(), 'comite'::app_role) OR has_role(auth.uid(), 'auditor'::app_role));

DROP POLICY IF EXISTS "staff_can_update_solicitudes" ON public.solicitudes;
CREATE POLICY "staff_can_update_solicitudes"
ON public.solicitudes AS PERMISSIVE FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'revisor'::app_role) OR has_role(auth.uid(), 'enlace'::app_role) OR has_role(auth.uid(), 'direccion'::app_role) OR has_role(auth.uid(), 'comite'::app_role));

DROP POLICY IF EXISTS "staff_can_read_documentos" ON public.documentos;
CREATE POLICY "staff_can_read_documentos"
ON public.documentos AS PERMISSIVE FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'revisor'::app_role) OR has_role(auth.uid(), 'enlace'::app_role) OR has_role(auth.uid(), 'direccion'::app_role) OR has_role(auth.uid(), 'comite'::app_role) OR has_role(auth.uid(), 'auditor'::app_role));

DROP POLICY IF EXISTS "staff_can_read_audit_trail" ON public.audit_trail;
CREATE POLICY "staff_can_read_audit_trail"
ON public.audit_trail AS PERMISSIVE FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'revisor'::app_role) OR has_role(auth.uid(), 'enlace'::app_role) OR has_role(auth.uid(), 'direccion'::app_role) OR has_role(auth.uid(), 'comite'::app_role) OR has_role(auth.uid(), 'auditor'::app_role));

DROP POLICY IF EXISTS "users_can_read_own_role" ON public.user_roles;
CREATE POLICY "users_can_read_own_role"
ON public.user_roles AS PERMISSIVE FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Grants
GRANT INSERT ON public.solicitudes TO anon, authenticated;
GRANT INSERT ON public.documentos TO anon, authenticated;
GRANT INSERT ON public.audit_trail TO anon, authenticated;
GRANT SELECT, UPDATE ON public.solicitudes TO authenticated;
GRANT SELECT ON public.documentos TO authenticated;
GRANT SELECT ON public.audit_trail TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;