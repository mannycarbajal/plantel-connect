
-- Role enum for staff
CREATE TYPE public.app_role AS ENUM ('revisor', 'enlace', 'direccion', 'comite');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check roles (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Solicitudes table
CREATE TABLE public.solicitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio TEXT NOT NULL UNIQUE,
  alumno_nombre TEXT NOT NULL,
  matricula TEXT NOT NULL,
  grupo TEXT NOT NULL,
  nivel TEXT NOT NULL CHECK (nivel IN ('Secundaria', 'Bachillerato')),
  turno TEXT NOT NULL CHECK (turno IN ('Matutino', 'Vespertino')),
  tutor_nombre TEXT NOT NULL,
  tutor_telefono TEXT NOT NULL,
  tutor_email TEXT NOT NULL,
  aportacion_actual NUMERIC NOT NULL,
  aportacion_propuesta NUMERIC NOT NULL,
  motivo TEXT NOT NULL CHECK (motivo IN ('desempleo', 'separacion', 'defuncion', 'otro')),
  motivo_detalle TEXT NOT NULL,
  tiene_adeudo BOOLEAN NOT NULL DEFAULT FALSE,
  monto_adeudo NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendiente_revision' CHECK (status IN (
    'pendiente_revision', 'en_revision', 'enviada_enlace', 'enviada_direccion', 'enviada_comite', 'aprobada', 'rechazada'
  )),
  enlace_asignado UUID REFERENCES auth.users(id),
  comentarios_revisor TEXT DEFAULT '',
  comentarios_enlace TEXT DEFAULT '',
  comentarios_direccion TEXT DEFAULT '',
  fecha_recepcion TIMESTAMPTZ DEFAULT now(),
  fecha_validacion TIMESTAMPTZ,
  fecha_enlace TIMESTAMPTZ,
  fecha_direccion TIMESTAMPTZ,
  fecha_resolucion TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.solicitudes ENABLE ROW LEVEL SECURITY;

-- Documents table
CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitud_id UUID REFERENCES public.solicitudes(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'comprobatorio',
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', false);

-- Folio sequence function
CREATE OR REPLACE FUNCTION public.generate_folio()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM public.solicitudes;
  NEW.folio := 'SOL-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_folio_trigger
BEFORE INSERT ON public.solicitudes
FOR EACH ROW EXECUTE FUNCTION public.generate_folio();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_solicitudes_updated_at
BEFORE UPDATE ON public.solicitudes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- user_roles: only staff can read their own role
CREATE POLICY "Users can read own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- solicitudes: anon can INSERT (public iPad form)
CREATE POLICY "Anyone can create solicitudes"
ON public.solicitudes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- solicitudes: authenticated staff can read all
CREATE POLICY "Staff can read all solicitudes"
ON public.solicitudes FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'revisor') OR
  public.has_role(auth.uid(), 'enlace') OR
  public.has_role(auth.uid(), 'direccion') OR
  public.has_role(auth.uid(), 'comite')
);

-- solicitudes: staff can update based on role
CREATE POLICY "Staff can update solicitudes"
ON public.solicitudes FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'revisor') OR
  public.has_role(auth.uid(), 'enlace') OR
  public.has_role(auth.uid(), 'direccion') OR
  public.has_role(auth.uid(), 'comite')
);

-- documentos: anon can insert
CREATE POLICY "Anyone can upload documentos"
ON public.documentos FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- documentos: staff can read
CREATE POLICY "Staff can read documentos"
ON public.documentos FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'revisor') OR
  public.has_role(auth.uid(), 'enlace') OR
  public.has_role(auth.uid(), 'direccion') OR
  public.has_role(auth.uid(), 'comite')
);

-- Storage policies for documentos bucket
CREATE POLICY "Anyone can upload documents"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Staff can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos' AND (
  public.has_role(auth.uid(), 'revisor') OR
  public.has_role(auth.uid(), 'enlace') OR
  public.has_role(auth.uid(), 'direccion') OR
  public.has_role(auth.uid(), 'comite')
));
