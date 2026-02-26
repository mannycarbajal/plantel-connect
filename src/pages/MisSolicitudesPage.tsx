import React from "react";
import { useSolicitudes } from "@/contexts/SolicitudesContext";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";

export default function MisSolicitudesPage() {
  const { solicitudes } = useSolicitudes();
  // In real app, filter by user ID
  const mis = solicitudes.filter(s => s.tutorNombre === "María García López");

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Mis Solicitudes</h2>
        <p className="text-muted-foreground mt-1">Consulte el estado de sus solicitudes enviadas.</p>
      </div>

      {mis.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <p className="text-muted-foreground text-lg">No tiene solicitudes registradas aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mis.map(s => (
            <div key={s.id} className="bg-card rounded-xl border p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-heading font-bold text-foreground text-lg">{s.folio}</p>
                  <p className="text-muted-foreground">{s.alumnoNombre} — {s.nivel} {s.grupo}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div className="mt-3 flex gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Actual:</span>{" "}
                  <span className="font-semibold text-foreground">${s.aportacionActual.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Solicitada:</span>{" "}
                  <span className="font-semibold text-primary">${s.aportacionPropuesta.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fecha:</span>{" "}
                  <span className="font-semibold text-foreground">{s.fechaPeticion}</span>
                </div>
              </div>
              {s.comentarios && (
                <div className="mt-3 bg-muted rounded-lg p-3 text-sm text-foreground">
                  <span className="font-semibold">Comentarios:</span> {s.comentarios}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
