
-- Make folio auto-generated (trigger handles it)
ALTER TABLE public.solicitudes ALTER COLUMN folio SET DEFAULT 'PENDING';
