
DROP POLICY IF EXISTS "permissive_insert_solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "permissive_insert_documentos" ON public.documentos;
DROP POLICY IF EXISTS "permissive_insert_audit_trail" ON public.audit_trail;
DROP POLICY IF EXISTS "staff_can_read_solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "staff_can_read_documentos" ON public.documentos;
DROP POLICY IF EXISTS "staff_can_read_audit_trail" ON public.audit_trail;
DROP POLICY IF EXISTS "staff_can_update_solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "users_can_read_own_role" ON public.user_roles;

CREATE POLICY "allow_insert_solicitudes" ON public.solicitudes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "allow_read_solicitudes" ON public.solicitudes FOR SELECT TO authenticated USING (has_role(auth.uid(), 'revisor'::app_role) OR has_role(auth.uid(), 'enlace'::app_role) OR has_role(auth.uid(), 'direccion'::app_role) OR has_role(auth.uid(), 'comite'::app_role) OR has_role(auth.uid(), 'auditor'::app_role));
CREATE POLICY "allow_update_solicitudes" ON public.solicitudes FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'revisor'::app_role) OR has_role(auth.uid(), 'enlace'::app_role) OR has_role(auth.uid(), 'direccion'::app_role) OR has_role(auth.uid(), 'comite'::app_role));

CREATE POLICY "allow_insert_documentos" ON public.documentos FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "allow_read_documentos" ON public.documentos FOR SELECT TO authenticated USING (has_role(auth.uid(), 'revisor'::app_role) OR has_role(auth.uid(), 'enlace'::app_role) OR has_role(auth.uid(), 'direccion'::app_role) OR has_role(auth.uid(), 'comite'::app_role) OR has_role(auth.uid(), 'auditor'::app_role));

CREATE POLICY "allow_insert_audit_trail" ON public.audit_trail FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "allow_read_audit_trail" ON public.audit_trail FOR SELECT TO authenticated USING (has_role(auth.uid(), 'revisor'::app_role) OR has_role(auth.uid(), 'enlace'::app_role) OR has_role(auth.uid(), 'direccion'::app_role) OR has_role(auth.uid(), 'comite'::app_role) OR has_role(auth.uid(), 'auditor'::app_role));

CREATE POLICY "allow_read_own_role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
