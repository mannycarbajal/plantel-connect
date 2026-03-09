
-- Grant necessary table privileges
GRANT INSERT ON public.solicitudes TO anon;
GRANT INSERT ON public.solicitudes TO authenticated;
GRANT SELECT, UPDATE ON public.solicitudes TO authenticated;

GRANT INSERT ON public.documentos TO anon;
GRANT INSERT ON public.documentos TO authenticated;
GRANT SELECT ON public.documentos TO authenticated;

GRANT INSERT ON public.audit_trail TO anon;
GRANT INSERT ON public.audit_trail TO authenticated;
GRANT SELECT ON public.audit_trail TO authenticated;

GRANT SELECT ON public.user_roles TO authenticated;

-- Storage: allow anon uploads
GRANT INSERT ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO anon;
