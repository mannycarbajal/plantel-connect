import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAuditEvent(
  solicitudId: string,
  action: string,
  userEmail?: string,
  userRole?: string,
  client?: SupabaseClient
) {
  const db = client ?? supabase;
  const deviceName = navigator.userAgent;

  let ipAddress = "unknown";
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    ipAddress = data.ip;
  } catch {
    // ignore
  }

  await db.from("audit_trail").insert({
    solicitud_id: solicitudId,
    action,
    user_email: userEmail ?? null,
    user_role: userRole ?? null,
    device_name: deviceName,
    ip_address: ipAddress,
  } as any);
}

export async function markPrimeraLectura(
  solicitudId: string,
  field: "revisor_primera_lectura" | "enlace_primera_lectura" | "direccion_primera_lectura" | "comite_primera_lectura"
) {
  const { data } = await supabase
    .from("solicitudes")
    .select(field)
    .eq("id", solicitudId)
    .single();

  if (data && !(data as any)[field]) {
    await supabase
      .from("solicitudes")
      .update({ [field]: new Date().toISOString() } as any)
      .eq("id", solicitudId);
  }
}
