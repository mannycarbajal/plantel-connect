
-- Drop all RESTRICTIVE insert policies and recreate as PERMISSIVE

DROP POLICY IF EXISTS "allow_insert_solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "allow_insert_documentos" ON public.documentos;
DROP POLICY IF EXISTS "allow_insert_audit_trail" ON public.audit_trail;
DROP POLICY IF EXISTS "allow_anon_insert_storage" ON storage.objects;

-- Recreate as PERMISSIVE (default behavior when not specifying RESTRICTIVE)
CREATE POLICY "permissive_insert_solicitudes"
ON public.solicitudes FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "permissive_insert_documentos"
ON public.documentos FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "permissive_insert_audit_trail"
ON public.audit_trail FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "permissive_insert_storage"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'documentos');

-- Also need PERMISSIVE SELECT policies for tables that only have RESTRICTIVE ones
-- solicitudes: Staff and Auditor SELECT are both RESTRICTIVE - need a permissive base
DROP POLICY IF EXISTS "Staff can read all solicitudes" ON public.solicitudes;
CREATE POLICY "staff_can_read_solicitudes"
ON public.solicitudes FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'revisor'::app_role) OR
  has_role(auth.uid(), 'enlace'::app_role) OR
  has_role(auth.uid(), 'direccion'::app_role) OR
  has_role(auth.uid(), 'comite'::app_role) OR
  has_role(auth.uid(), 'auditor'::app_role)
);

DROP POLICY IF EXISTS "Auditor can read all solicitudes" ON public.solicitudes;

DROP POLICY IF EXISTS "Staff can update solicitudes" ON public.solicitudes;
CREATE POLICY "staff_can_update_solicitudes"
ON public.solicitudes FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'revisor'::app_role) OR
  has_role(auth.uid(), 'enlace'::app_role) OR
  has_role(auth.uid(), 'direccion'::app_role) OR
  has_role(auth.uid(), 'comite'::app_role)
);

-- documentos SELECT
DROP POLICY IF EXISTS "Staff can read documentos" ON public.documentos;
DROP POLICY IF EXISTS "Auditor can read documentos" ON public.documentos;
CREATE POLICY "staff_can_read_documentos"
ON public.documentos FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'revisor'::app_role) OR
  has_role(auth.uid(), 'enlace'::app_role) OR
  has_role(auth.uid(), 'direccion'::app_role) OR
  has_role(auth.uid(), 'comite'::app_role) OR
  has_role(auth.uid(), 'auditor'::app_role)
);

-- audit_trail SELECT
DROP POLICY IF EXISTS "Staff can read audit_trail" ON public.audit_trail;
CREATE POLICY "staff_can_read_audit_trail"
ON public.audit_trail FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'revisor'::app_role) OR
  has_role(auth.uid(), 'enlace'::app_role) OR
  has_role(auth.uid(), 'direccion'::app_role) OR
  has_role(auth.uid(), 'comite'::app_role) OR
  has_role(auth.uid(), 'auditor'::app_role)
);

-- user_roles SELECT
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "users_can_read_own_role"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Storage SELECT for authenticated users
CREATE POLICY "permissive_select_storage"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'documentos');
