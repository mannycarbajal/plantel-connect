import React, { useState } from "react";
import { useSolicitudes, Solicitud } from "@/contexts/SolicitudesContext";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, FileText } from "lucide-react";

const MOTIVO_LABELS = {
  desempleo: "Desempleo",
  separacion: "Separación conyugal",
  defuncion: "Defunción",
  otro: "Caso especial",
};

export default function DireccionPage() {
  const { solicitudes, updateStatus } = useSolicitudes();
  const [selected, setSelected] = useState<Solicitud | null>(null);
  const [comentarios, setComentarios] = useState("");
  const [filter, setFilter] = useState<"pendientes" | "resueltas">("pendientes");

  const pendientes = solicitudes.filter(s => s.status === "enviada_direccion");
  const resueltas = solicitudes.filter(s => s.status === "aprobada" || s.status === "rechazada");
  const displayed = filter === "pendientes" ? pendientes : resueltas;

  const handleApprove = () => {
    if (!selected) return;
    updateStatus(selected.id, "aprobada", comentarios || "Solicitud aprobada por Dirección Operativa.");
    setSelected(null);
    setComentarios("");
  };

  const handleReject = () => {
    if (!selected) return;
    updateStatus(selected.id, "rechazada", comentarios || "Solicitud rechazada por Dirección Operativa.");
    setSelected(null);
    setComentarios("");
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Panel de Dirección Operativa</h2>
        <p className="text-muted-foreground mt-1">Analice y resuelva las solicitudes de ajuste.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4 text-center shadow-sm">
          <p className="text-3xl font-heading font-bold text-brand-yellow">{pendientes.length}</p>
          <p className="text-sm text-muted-foreground font-heading">Por Resolver</p>
        </div>
        <div className="bg-card rounded-xl border p-4 text-center shadow-sm">
          <p className="text-3xl font-heading font-bold text-success">{resueltas.filter(s => s.status === "aprobada").length}</p>
          <p className="text-sm text-muted-foreground font-heading">Aprobadas</p>
        </div>
        <div className="bg-card rounded-xl border p-4 text-center shadow-sm">
          <p className="text-3xl font-heading font-bold text-destructive">{resueltas.filter(s => s.status === "rechazada").length}</p>
          <p className="text-sm text-muted-foreground font-heading">Rechazadas</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(["pendientes", "resueltas"] as const).map(f => (
          <button key={f} onClick={() => { setFilter(f); setSelected(null); }}
            className={`touch-target px-5 py-3 rounded-lg font-heading font-medium text-sm transition-colors
              ${filter === f ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:bg-muted"}`}>
            {f === "pendientes" ? `Por Resolver (${pendientes.length})` : `Resueltas (${resueltas.length})`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {displayed.length === 0 ? (
            <div className="bg-card rounded-xl border p-12 text-center">
              <p className="text-muted-foreground text-lg">No hay solicitudes en esta categoría.</p>
            </div>
          ) : displayed.map(s => (
            <button key={s.id} onClick={() => { setSelected(s); setComentarios(s.comentarios); }}
              className={`touch-target w-full text-left bg-card rounded-xl border p-5 shadow-sm transition-all
                ${selected?.id === s.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-heading font-bold text-foreground">{s.folio}</p>
                  <p className="text-sm text-muted-foreground">{s.tutorNombre}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-foreground">{s.alumnoNombre}</span>
                <span className="text-muted-foreground">{MOTIVO_LABELS[s.motivo]}</span>
              </div>
              <div className="flex gap-4 mt-1 text-sm">
                <span className="text-muted-foreground">Actual: <span className="font-semibold text-foreground">${s.aportacionActual.toLocaleString()}</span></span>
                <span className="text-muted-foreground">→ <span className="font-bold text-primary">${s.aportacionPropuesta.toLocaleString()}</span></span>
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selected && (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="bg-card rounded-xl border p-6 shadow-sm">
              <h3 className="font-heading text-xl font-bold text-foreground mb-4">{selected.folio}</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">Alumno:</span> <span className="font-semibold text-foreground">{selected.alumnoNombre}</span></div>
                  <div><span className="text-muted-foreground">Nivel/Grupo:</span> <span className="font-semibold text-foreground">{selected.nivel} {selected.grupo}</span></div>
                  <div><span className="text-muted-foreground">Tutor:</span> <span className="font-semibold text-foreground">{selected.tutorNombre}</span></div>
                  <div><span className="text-muted-foreground">Fecha:</span> <span className="font-semibold text-foreground">{selected.fechaPeticion}</span></div>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <div><span className="text-muted-foreground">Actual:</span> <span className="font-bold text-foreground">${selected.aportacionActual.toLocaleString()}</span></div>
                    <div><span className="text-muted-foreground">Solicitada:</span> <span className="font-bold text-primary">${selected.aportacionPropuesta.toLocaleString()}</span></div>
                  </div>
                  <div><span className="text-muted-foreground">Motivo:</span> <span className="font-semibold text-foreground">{MOTIVO_LABELS[selected.motivo]}</span></div>
                  {selected.adeudo > 0 && (
                    <div className="mt-1"><span className="text-muted-foreground">Adeudo:</span> <span className="font-bold text-destructive">${selected.adeudo.toLocaleString()}</span></div>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold mb-1">Detalle del motivo:</p>
                  <p className="text-foreground">{selected.motivoDetalle}</p>
                </div>
                {selected.comentarios && (
                  <div className="bg-accent/10 rounded-lg p-3">
                    <p className="text-muted-foreground font-semibold mb-1">Nota del revisor:</p>
                    <p className="text-foreground">{selected.comentarios}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground font-semibold mb-2">Documentos:</p>
                  {selected.documentos.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 mb-1">
                      <FileText size={16} className="text-primary" /> <span className="text-foreground">{d}</span>
                    </div>
                  ))}
                </div>
                {selected.status === "enviada_direccion" && (
                  <>
                    <div>
                      <label className="block text-muted-foreground font-semibold mb-1">Resolución / Comentarios:</label>
                      <textarea value={comentarios} onChange={e => setComentarios(e.target.value)}
                        rows={3} className="w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        placeholder="Fundamento de la resolución..." />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={handleReject}
                        className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-destructive text-destructive font-heading font-semibold hover:bg-destructive/5 transition-colors">
                        <XCircle size={20} /> Rechazar
                      </button>
                      <button onClick={handleApprove}
                        className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-success text-success-foreground font-heading font-semibold hover:bg-success/90 transition-colors shadow-lg">
                        <CheckCircle size={20} /> Aprobar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
