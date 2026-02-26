import React from "react";
import { SolicitudStatus } from "@/contexts/SolicitudesContext";

const STATUS_CONFIG: Record<SolicitudStatus, { label: string; className: string }> = {
  pendiente_revision: { label: "Pendiente de Revisión", className: "bg-brand-yellow/15 text-brand-yellow border-brand-yellow/30" },
  en_revision: { label: "En Revisión", className: "bg-accent/15 text-accent border-accent/30" },
  enviada_direccion: { label: "Enviada a Dirección", className: "bg-primary/15 text-primary border-primary/30" },
  aprobada: { label: "Aprobada", className: "bg-success/15 text-success border-success/30" },
  rechazada: { label: "Rechazada", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export default function StatusBadge({ status }: { status: SolicitudStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-heading font-bold border ${config.className}`}>
      {config.label}
    </span>
  );
}
