import { centralSupabase as supabase } from "@/integrations/supabase/centralClient";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAuditEvent(
  solicitudId: string,
  action: string,
  userEmail?: string,
  userRole?: string,
  client?: SupabaseClient,
) {
  const db = client ?? supabase;
  const deviceName = navigator.userAgent;

  await db.from("contrib_audit_trail").insert({
    solicitud_id: solicitudId,
    action,
    user_email: userEmail ?? null,
    user_role: userRole ?? null,
    device_name: deviceName,
    ip_address: null,
  } as any);
}

export async function markPrimeraLectura(
  solicitudId: string,
  field: "revisor_primera_lectura" | "enlace_primera_lectura" | "direccion_primera_lectura" | "comite_primera_lectura",
) {
  const { data } = await supabase.from("contrib_solicitudes").select(field).eq("id", solicitudId).single();

  if (data && !(data as any)[field]) {
    await supabase
      .from("contrib_solicitudes")
      .update({ [field]: new Date().toISOString() } as any)
      .eq("id", solicitudId);
  }
}
