import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { SolicitudRow } from "@/lib/solicitudes";

type AuditSolicitud = SolicitudRow & {
  revisor_primera_lectura: string | null;
  enlace_primera_lectura: string | null;
  direccion_primera_lectura: string | null;
  comite_primera_lectura: string | null;
};

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function daysBetween(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function getSlaColor(role: string, recibido: string | null, accionado: string | null, solicitudCreated: string | null): string {
  if (!accionado) return "";

  if (role === "revisor") {
    // Green if acted within first 10 days of the month
    const actionDate = new Date(accionado);
    return actionDate.getDate() <= 10 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  }

  if (role === "enlace" || role === "direccion") {
    // Green if acted within 5 days of receiving
    const ref = recibido || solicitudCreated;
    const days = daysBetween(ref, accionado);
    if (days === null) return "";
    return days <= 5 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  }

  return "";
}

export default function AuditorPage() {
  const [solicitudes, setSolicitudes] = useState<AuditSolicitud[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("solicitudes")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setSolicitudes(data as unknown as AuditSolicitud[]);
      setLoading(false);
    })();
  }, []);

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Panel de Auditoría</h2>
        <p className="text-muted-foreground mt-1">{solicitudes.length} caso(s) registrado(s)</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-xl border shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-3 py-3 font-heading font-semibold text-foreground whitespace-nowrap">Folio</th>
                <th className="text-left px-3 py-3 font-heading font-semibold text-foreground whitespace-nowrap">Alumno</th>
                <th className="text-left px-3 py-3 font-heading font-semibold text-foreground whitespace-nowrap">Status</th>
                <th className="text-center px-3 py-3 font-heading font-semibold text-foreground whitespace-nowrap" colSpan={2}>Revisor</th>
                <th className="text-center px-3 py-3 font-heading font-semibold text-foreground whitespace-nowrap" colSpan={2}>Enlace</th>
                <th className="text-center px-3 py-3 font-heading font-semibold text-foreground whitespace-nowrap" colSpan={2}>Dirección</th>
                <th className="text-center px-3 py-3 font-heading font-semibold text-foreground whitespace-nowrap" colSpan={2}>Comité</th>
              </tr>
              <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                <th></th>
                <th></th>
                <th></th>
                <th className="px-2 py-1 text-center">Lectura</th>
                <th className="px-2 py-1 text-center">Acción</th>
                <th className="px-2 py-1 text-center">Lectura</th>
                <th className="px-2 py-1 text-center">Acción</th>
                <th className="px-2 py-1 text-center">Lectura</th>
                <th className="px-2 py-1 text-center">Acción</th>
                <th className="px-2 py-1 text-center">Lectura</th>
                <th className="px-2 py-1 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => {
                const revisorSla = getSlaColor("revisor", s.revisor_primera_lectura, s.fecha_validacion, s.created_at);
                const enlaceSla = getSlaColor("enlace", s.enlace_primera_lectura, s.fecha_enlace, s.created_at);
                const direccionSla = getSlaColor("direccion", s.direccion_primera_lectura, s.fecha_direccion, s.created_at);

                return (
                  <tr key={s.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 font-heading font-bold text-foreground whitespace-nowrap">{s.folio}</td>
                    <td className="px-3 py-2 text-foreground whitespace-nowrap">{s.alumno_nombre}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-xs font-semibold capitalize">{s.status.replace(/_/g, " ")}</span>
                    </td>
                    {/* Revisor */}
                    <td className="px-2 py-2 text-center text-xs whitespace-nowrap">{formatDate(s.revisor_primera_lectura)}</td>
                    <td className={`px-2 py-2 text-center text-xs whitespace-nowrap ${revisorSla}`}>{formatDate(s.fecha_validacion)}</td>
                    {/* Enlace */}
                    <td className="px-2 py-2 text-center text-xs whitespace-nowrap">{formatDate(s.enlace_primera_lectura)}</td>
                    <td className={`px-2 py-2 text-center text-xs whitespace-nowrap ${enlaceSla}`}>{formatDate(s.fecha_enlace)}</td>
                    {/* Dirección */}
                    <td className="px-2 py-2 text-center text-xs whitespace-nowrap">{formatDate(s.direccion_primera_lectura)}</td>
                    <td className={`px-2 py-2 text-center text-xs whitespace-nowrap ${direccionSla}`}>{formatDate(s.fecha_direccion)}</td>
                    {/* Comité */}
                    <td className="px-2 py-2 text-center text-xs whitespace-nowrap">{formatDate(s.comite_primera_lectura)}</td>
                    <td className="px-2 py-2 text-center text-xs whitespace-nowrap">{formatDate(s.fecha_resolucion)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
