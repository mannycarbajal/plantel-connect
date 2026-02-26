import React, { createContext, useContext, useState, ReactNode } from "react";

export type SolicitudStatus = "pendiente_revision" | "en_revision" | "enviada_direccion" | "aprobada" | "rechazada";

export type MotivoSolicitud = "desempleo" | "separacion" | "defuncion" | "otro";

export interface Solicitud {
  id: string;
  folio: string;
  alumnoNombre: string;
  grupo: string;
  nivel: string;
  tutorNombre: string;
  tutorEmail: string;
  fechaPeticion: string;
  aportacionActual: number;
  aportacionPropuesta: number;
  motivo: MotivoSolicitud;
  motivoDetalle: string;
  documentos: string[];
  status: SolicitudStatus;
  comentarios: string;
  adeudo: number;
}

interface SolicitudesContextType {
  solicitudes: Solicitud[];
  addSolicitud: (s: Omit<Solicitud, "id" | "folio" | "status" | "fechaPeticion">) => void;
  updateStatus: (id: string, status: SolicitudStatus, comentarios?: string) => void;
}

const SolicitudesContext = createContext<SolicitudesContextType | null>(null);

const INITIAL: Solicitud[] = [
  {
    id: "1", folio: "SOL-2026-001", alumnoNombre: "Juan Pérez García", grupo: "3-A", nivel: "Secundaria",
    tutorNombre: "María García López", tutorEmail: "maria.garcia@ejemplo.com",
    fechaPeticion: "2026-02-03", aportacionActual: 1000, aportacionPropuesta: 500,
    motivo: "desempleo", motivoDetalle: "Pérdida de empleo en enero 2026. Comprobante de baja del IMSS adjunto.",
    documentos: ["constancia_baja_imss.pdf", "identificacion_oficial.pdf"], status: "pendiente_revision",
    comentarios: "", adeudo: 0,
  },
  {
    id: "2", folio: "SOL-2026-002", alumnoNombre: "Ana López Ruiz", grupo: "1-B", nivel: "Preparatoria",
    tutorNombre: "Roberto López Sánchez", tutorEmail: "roberto.lopez@ejemplo.com",
    fechaPeticion: "2026-02-04", aportacionActual: 1500, aportacionPropuesta: 800,
    motivo: "separacion", motivoDetalle: "Separación conyugal. Se adjunta acta de divorcio.",
    documentos: ["acta_divorcio.pdf", "comprobante_domicilio.pdf", "identificacion_oficial.pdf"],
    status: "en_revision", comentarios: "", adeudo: 500,
  },
  {
    id: "3", folio: "SOL-2026-003", alumnoNombre: "Pedro Martínez", grupo: "2-C", nivel: "Secundaria",
    tutorNombre: "Laura Martínez Díaz", tutorEmail: "laura.martinez@ejemplo.com",
    fechaPeticion: "2026-01-28", aportacionActual: 800, aportacionPropuesta: 300,
    motivo: "otro", motivoDetalle: "Enfermedad crónica del tutor. Se anexa constancia médica del ISSSTE.",
    documentos: ["constancia_medica.pdf", "identificacion_oficial.pdf"],
    status: "enviada_direccion", comentarios: "Documentación completa y verificada. Caso especial — requiere Comité.", adeudo: 0,
  },
];

export function SolicitudesProvider({ children }: { children: ReactNode }) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(INITIAL);

  const addSolicitud = (s: Omit<Solicitud, "id" | "folio" | "status" | "fechaPeticion">) => {
    const newId = String(solicitudes.length + 1);
    const folio = `SOL-2026-${String(solicitudes.length + 1).padStart(3, "0")}`;
    setSolicitudes(prev => [...prev, { ...s, id: newId, folio, status: "pendiente_revision", fechaPeticion: new Date().toISOString().split("T")[0] }]);
  };

  const updateStatus = (id: string, status: SolicitudStatus, comentarios?: string) => {
    setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, status, comentarios: comentarios ?? s.comentarios } : s));
  };

  return (
    <SolicitudesContext.Provider value={{ solicitudes, addSolicitud, updateStatus }}>
      {children}
    </SolicitudesContext.Provider>
  );
}

export function useSolicitudes() {
  const ctx = useContext(SolicitudesContext);
  if (!ctx) throw new Error("useSolicitudes must be inside SolicitudesProvider");
  return ctx;
}
