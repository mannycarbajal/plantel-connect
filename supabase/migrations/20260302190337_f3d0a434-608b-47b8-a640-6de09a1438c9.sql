-- ============================================================
-- FIX: Missing GRANT permissions for anon and authenticated roles
-- RLS policies exist but roles lack basic table access privileges
-- ============================================================

-- Grant permissions on solicitudes
GRANT SELECT, INSERT, UPDATE ON public.solicitudes TO anon;
GRANT SELECT, INSERT, UPDATE ON public.solicitudes TO authenticated;

-- Grant permissions on documentos
GRANT SELECT, INSERT ON public.documentos TO anon;
GRANT SELECT, INSERT ON public.documentos TO authenticated;

-- Grant permissions on audit_trail
GRANT SELECT, INSERT ON public.audit_trail TO anon;
GRANT SELECT, INSERT ON public.audit_trail TO authenticated;

-- Also ensure storage.objects has proper grants for file uploads
GRANT SELECT, INSERT ON storage.objects TO anon;
GRANT SELECT, INSERT ON storage.objects TO authenticated;

-- Clean up test row
DELETE FROM public.solicitudes WHERE alumno_nombre = 'TEST ALUMNO';