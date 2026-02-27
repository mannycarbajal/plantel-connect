
-- Add "primera lectura" timestamps per role phase
ALTER TABLE public.solicitudes 
  ADD COLUMN IF NOT EXISTS revisor_primera_lectura timestamptz,
  ADD COLUMN IF NOT EXISTS enlace_primera_lectura timestamptz,
  ADD COLUMN IF NOT EXISTS direccion_primera_lectura timestamptz,
  ADD COLUMN IF NOT EXISTS comite_primera_lectura timestamptz;

-- Create audit trail table for device/IP tracking
CREATE TABLE public.audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id uuid NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
  action text NOT NULL,
  user_email text,
  user_role text,
  device_name text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- Staff and auditor can read audit trail
CREATE POLICY "Staff can read audit_trail"
ON public.audit_trail FOR SELECT
USING (
  has_role(auth.uid(), 'revisor') OR
  has_role(auth.uid(), 'enlace') OR
  has_role(auth.uid(), 'direccion') OR
  has_role(auth.uid(), 'comite') OR
  has_role(auth.uid(), 'auditor')
);

-- Anyone can insert audit entries (for anonymous solicitud creation too)
CREATE POLICY "Anyone can insert audit_trail"
ON public.audit_trail FOR INSERT
WITH CHECK (true);

-- Auditor can read all solicitudes
CREATE POLICY "Auditor can read all solicitudes"
ON public.solicitudes FOR SELECT
USING (has_role(auth.uid(), 'auditor'));

-- Auditor can read all documentos
CREATE POLICY "Auditor can read documentos"
ON public.documentos FOR SELECT
USING (has_role(auth.uid(), 'auditor'));
