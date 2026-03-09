
CREATE OR REPLACE FUNCTION public.generate_folio()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM public.solicitudes;
  NEW.folio := 'SOL-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

-- Also drop duplicate trigger
DROP TRIGGER IF EXISTS set_folio ON public.solicitudes;
