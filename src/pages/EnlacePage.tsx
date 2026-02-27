import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, FileText, Send, ExternalLink, Loader2 } from "lucide-react";
import { fetchSolicitudesForEnlace, fetchDocumentos, getDocumentUrl, updateSolicitudStatus, type SolicitudRow, type DocumentoRow } from "@/lib/solicitudes";
import { logAuditEvent, markPrimeraLectura } from "@/lib/audit";

const MOTIVO_LABELS: Record<string, string> = {
  desempleo: "Desempleo",
  separacion: "Separación conyugal",
  defuncion: "Defunción",
  otro: "Caso especial",
};

export default function EnlacePage() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudRow[]>([]);
  const [selected, setSelected] = useState<SolicitudRow | null>(null);
  const [docs, setDocs] = useState<DocumentoRow[]>([]);
  const [comentarios, setComentarios] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchSolicitudesForEnlace(user.id);
      setSolicitudes(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  useEffect(() => {
    if (selected) {
      fetchDocumentos(selected.id).then(setDocs).catch(console.error);
      markPrimeraLectura(selected.id, "enlace_primera_lectura");
    }
  }, [selected?.id]);

  const handleSendToDireccion = async () => {
    if (!selected) return;
    setActing(true);
    try {
      await updateSolicitudStatus(selected.id, "enviada_direccion", {
        comentarios_enlace: comentarios || "Revisado por enlace de nivel.",
        fecha_enlace: new Date().toISOString(),
      });
      await logAuditEvent(selected.id, "enviada_direccion", user?.email, "enlace");
      setSelected(null);
      setComentarios("");
      await load();
    } catch (e) { console.error(e); }
    setActing(false);
  };

  const handleReject = async () => {
    if (!selected) return;
    setActing(true);
    try {
      await updateSolicitudStatus(selected.id, "rechazada", {
        comentarios_enlace: comentarios || "Rechazado por enlace de nivel.",
        fecha_enlace: new Date().toISOString(),
        fecha_resolucion: new Date().toISOString(),
      });
      await logAuditEvent(selected.id, "rechazada_enlace", user?.email, "enlace");
      setSelected(null);
      setComentarios("");
      await load();
    } catch (e) { console.error(e); }
    setActing(false);
  };

  const openDoc = async (filePath: string) => {
    const url = await getDocumentUrl(filePath);
    if (url) window.open(url, "_blank");
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Solicitudes Asignadas</h2>
        <p className="text-muted-foreground mt-1">{solicitudes.length} solicitud(es) asignada(s)</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {solicitudes.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center">
                <p className="text-muted-foreground text-lg">No hay solicitudes asignadas.</p>
              </div>
            ) : solicitudes.map(s => (
              <button key={s.id} onClick={() => { setSelected(s); setComentarios(s.comentarios_enlace ?? ""); }}
                className={`touch-target w-full text-left bg-card rounded-xl border p-5 shadow-sm transition-all
                  ${selected?.id === s.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-heading font-bold text-foreground">{s.folio}</p>
                    <p className="text-sm text-muted-foreground">{s.tutor_nombre}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <p className="text-sm mt-2 text-foreground">{s.alumno_nombre} — {s.nivel} {s.turno} {s.grupo}</p>
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
                    <div><span className="text-muted-foreground">Alumno:</span> <span className="font-semibold text-foreground">{selected.alumno_nombre}</span></div>
                    <div><span className="text-muted-foreground">Matrícula:</span> <span className="font-semibold text-foreground">{selected.matricula}</span></div>
                    <div><span className="text-muted-foreground">Nivel/Turno:</span> <span className="font-semibold text-foreground">{selected.nivel} {selected.turno}</span></div>
                    <div><span className="text-muted-foreground">Grupo:</span> <span className="font-semibold text-foreground">{selected.grupo}</span></div>
                    <div><span className="text-muted-foreground">Tutor:</span> <span className="font-semibold text-foreground">{selected.tutor_nombre}</span></div>
                    <div><span className="text-muted-foreground">Teléfono:</span> <span className="font-semibold text-foreground">{selected.tutor_telefono}</span></div>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div><span className="text-muted-foreground">Actual:</span> <span className="font-bold text-foreground">${selected.aportacion_actual.toLocaleString()}</span></div>
                      <div><span className="text-muted-foreground">Solicitada:</span> <span className="font-bold text-primary">${selected.aportacion_propuesta.toLocaleString()}</span></div>
                    </div>
                    <div><span className="text-muted-foreground">Motivo:</span> <span className="font-semibold text-foreground">{MOTIVO_LABELS[selected.motivo] ?? selected.motivo}</span></div>
                  </div>

                  {selected.comentarios_revisor && (
                    <div className="bg-accent/10 rounded-lg p-3">
                      <p className="text-muted-foreground font-semibold mb-1">Nota del revisor:</p>
                      <p className="text-foreground">{selected.comentarios_revisor}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-muted-foreground font-semibold mb-2">Documentos:</p>
                    <div className="space-y-2">
                      {docs.map(d => (
                        <button key={d.id} onClick={() => openDoc(d.file_path)}
                          className="w-full flex items-center gap-2 bg-muted rounded-lg px-3 py-2 hover:bg-muted/80 transition-colors text-left">
                          <FileText size={16} className="text-primary shrink-0" />
                          <span className="text-foreground flex-1 truncate">{d.nombre}</span>
                          <ExternalLink size={14} className="text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Comentarios del enlace:</label>
                    <textarea value={comentarios} onChange={e => setComentarios(e.target.value)}
                      rows={3} className="w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Observaciones del enlace..." />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={handleReject} disabled={acting}
                    className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-destructive text-destructive font-heading font-semibold hover:bg-destructive/5 transition-colors">
                    <XCircle size={20} /> Rechazar
                  </button>
                  <button onClick={handleSendToDireccion} disabled={acting}
                    className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                    <Send size={20} /> Enviar a Dirección
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AppLayout>
  );
}
