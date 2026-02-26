import React, { useState } from "react";
import { useSolicitudes, Solicitud } from "@/contexts/SolicitudesContext";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, FileText, Send } from "lucide-react";

const MOTIVO_LABELS = {
  desempleo: "Desempleo",
  separacion: "Separación conyugal",
  defuncion: "Defunción",
  otro: "Caso especial",
};

export default function RevisorPage() {
  const { solicitudes, updateStatus } = useSolicitudes();
  const [selected, setSelected] = useState<Solicitud | null>(null);
  const [comentarios, setComentarios] = useState("");

  const pendientes = solicitudes.filter(s => s.status === "pendiente_revision" || s.status === "en_revision");

  const handleApproveAndSend = () => {
    if (!selected) return;
    updateStatus(selected.id, "enviada_direccion", comentarios || "Documentación completa y verificada.");
    setSelected(null);
    setComentarios("");
  };

  const handleReject = () => {
    if (!selected) return;
    updateStatus(selected.id, "rechazada", comentarios || "Documentación incompleta.");
    setSelected(null);
    setComentarios("");
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Solicitudes Pendientes de Revisión</h2>
        <p className="text-muted-foreground mt-1">{pendientes.length} solicitud(es) por revisar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-3">
          {pendientes.length === 0 ? (
            <div className="bg-card rounded-xl border p-12 text-center">
              <p className="text-muted-foreground text-lg">No hay solicitudes pendientes.</p>
            </div>
          ) : pendientes.map(s => (
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
              <p className="text-sm mt-2 text-foreground">{s.alumnoNombre} — {s.nivel} {s.grupo}</p>
            </button>
          ))}
        </div>

        {/* Detail */}
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
                </div>

                <div>
                  <p className="text-muted-foreground font-semibold mb-1">Detalle:</p>
                  <p className="text-foreground">{selected.motivoDetalle}</p>
                </div>

                <div>
                  <p className="text-muted-foreground font-semibold mb-2">Documentos adjuntos:</p>
                  <div className="space-y-2">
                    {selected.documentos.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                        <FileText size={16} className="text-primary" />
                        <span className="text-foreground">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Comentarios del revisor:</label>
                  <textarea value={comentarios} onChange={e => setComentarios(e.target.value)}
                    rows={3} className="w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    placeholder="Observaciones sobre la documentación..." />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={handleReject}
                  className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-destructive text-destructive font-heading font-semibold hover:bg-destructive/5 transition-colors">
                  <XCircle size={20} /> Rechazar
                </button>
                <button onClick={handleApproveAndSend}
                  className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                  <Send size={20} /> Enviar a Dirección
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
