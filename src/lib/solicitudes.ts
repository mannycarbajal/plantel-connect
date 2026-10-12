import { centralSupabase as supabase } from "@/integrations/supabase/centralClient";

export type SolicitudRow = {
  id: string;
  folio: string;
  alumno_nombre: string;
  matricula: string;
  grupo: string;
  nivel: string;
  turno: string;
  tutor_nombre: string;
  tutor_telefono: string;
  tutor_email: string;
  aportacion_actual: number;
  aportacion_propuesta: number;
  motivo: string;
  motivo_detalle: string;
  tiene_adeudo: boolean;
  monto_adeudo: number | null;
  status: string;
  enlace_asignado: string | null;
  comentarios_revisor: string | null;
  comentarios_enlace: string | null;
  comentarios_direccion: string | null;
  fecha_recepcion: string | null;
  fecha_validacion: string | null;
  fecha_enlace: string | null;
  fecha_direccion: string | null;
  fecha_resolucion: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentoRow = {
  id: string;
  solicitud_id: string;
  nombre: string;
  tipo: string;
  file_path: string;
  uploaded_at: string;
};

export async function fetchSolicitudes(statusIn?: string[]): Promise<SolicitudRow[]> {
  let q = supabase.from("contrib_solicitudes").select("*").order("created_at", { ascending: false });
  if (statusIn && statusIn.length > 0) {
    q = q.in("status", statusIn);
  }
  const { data, error } = await q;
  if (error) throw error;
  return data as SolicitudRow[];
}

export async function fetchSolicitudesForEnlace(userId: string): Promise<SolicitudRow[]> {
  const { data, error } = await supabase
    .from("contrib_solicitudes")
    .select("*")
    .eq("status", "enviada_enlace")
    .eq("enlace_asignado", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as SolicitudRow[];
}

export async function fetchDocumentos(solicitudId: string): Promise<DocumentoRow[]> {
  const { data, error } = await supabase
    .from("contrib_documentos")
    .select("*")
    .eq("solicitud_id", solicitudId)
    .order("uploaded_at");
  if (error) throw error;
  return data as DocumentoRow[];
}

export async function getDocumentUrl(filePath: string): Promise<string> {
  const { data } = await supabase.storage.from("contrib-documentos").createSignedUrl(filePath, 3600);
  return data?.signedUrl ?? "";
}

export async function updateSolicitudStatus(
  id: string,
  status: string,
  extras: Record<string, any> = {},
): Promise<void> {
  const { error } = await supabase
    .from("contrib_solicitudes")
    .update({ status, ...extras })
    .eq("id", id);
  if (error) throw error;
}

// Enlace asignado por nivel/turno (tabla contrib_enlaces en el Supabase central)
export async function fetchEnlaceUserId(nivel: string, turno: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("contrib_enlaces")
    .select("user_id")
    .eq("nivel", nivel)
    .eq("turno", turno)
    .maybeSingle();
  if (error) throw error;
  return data?.user_id ?? null;
}

// Map nivel+turno to enlace user (obsoleto: usar fetchEnlaceUserId)
const ENLACE_EMAILS: Record<string, string> = {
  Bachillerato_Matutino: "ruben.carbajal@fundacionazteca.org",
  Bachillerato_Vespertino: "ruben.carbajal@fundacionazteca.org",
  Secundaria_Matutino: "claudia.cruz@fundacionazteca.org",
  Secundaria_Vespertino: "maria.lopez@fundacionazteca.org",
};

export async function getEnlaceUserId(nivel: string, turno: string): Promise<string | null> {
  const key = `${nivel}_${turno}`;
  const email = ENLACE_EMAILS[key];
  if (!email) return null;

  // Look up user by email via edge function or a workaround
  // Since we can't query auth.users from client, we store email->role in user_roles
  // We'll use a helper: get all enlace users and match by checking auth metadata
  // For now, use the seed data to map
  const { data } = await supabase.rpc("has_role", {
    _user_id: "00000000-0000-0000-0000-000000000000",
    _role: "enlace" as any,
  });

  // Workaround: we stored the mapping, let's query user_roles for enlace users
  // and then we need to know which one. Since we can't get email from client,
  // we'll use an edge function.
  return null; // Will be resolved via edge function
}
