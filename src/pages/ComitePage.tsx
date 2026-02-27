import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, FileText, Download, ExternalLink, Loader2 } from "lucide-react";
import { fetchSolicitudes, fetchDocumentos, getDocumentUrl, updateSolicitudStatus, type SolicitudRow, type DocumentoRow } from "@/lib/solicitudes";
import { logAuditEvent, markPrimeraLectura } from "@/lib/audit";

const MOTIVO_LABELS: Record<string, string> = {
  desempleo: "Desempleo",
  separacion: "Separación conyugal",
  defuncion: "Defunción",
  otro: "Caso especial",
};

export default function ComitePage() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<SolicitudRow[]>([]);
  const [selected, setSelected] = useState<SolicitudRow | null>(null);
  const [docs, setDocs] = useState<DocumentoRow[]>([]);
  const [comentarios, setComentarios] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchSolicitudes(["enviada_comite"]);
      setSolicitudes(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (selected) {
      fetchDocumentos(selected.id).then(setDocs).catch(console.error);
      markPrimeraLectura(selected.id, "comite_primera_lectura");
    }
  }, [selected?.id]);

  const handleAction = async (action: "aprobada" | "rechazada") => {
    if (!selected) return;
    setActing(true);
    try {
      await updateSolicitudStatus(selected.id, action, {
        comentarios_direccion: comentarios || `Resuelto por Comité: ${action}.`,
        fecha_resolucion: new Date().toISOString(),
      });
      await logAuditEvent(selected.id, `${action}_comite`, user?.email, "comite");
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

  const downloadDoc = async (filePath: string, nombre: string) => {
    const url = await getDocumentUrl(filePath);
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre;
      a.target = "_blank";
      a.click();
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Casos para Comité</h2>
        <p className="text-muted-foreground mt-1">{solicitudes.length} caso(s) pendiente(s) de resolución por el Comité.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {solicitudes.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center">
                <p className="text-muted-foreground text-lg">No hay casos pendientes para el Comité.</p>
              </div>
            ) : solicitudes.map(s => (
              <button key={s.id} onClick={() => { setSelected(s); setComentarios(""); }}
                className={`touch-target w-full text-left bg-card rounded-xl border p-5 shadow-sm transition-all
                  ${selected?.id === s.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-heading font-bold text-foreground">{s.folio}</p>
                    <p className="text-sm text-muted-foreground">{s.alumno_nombre} — {s.nivel} {s.turno}</p>
                  </div>
                  <StatusBadge status={s.status} />
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
                    {selected.tiene_adeudo && (
                      <div className="mt-1"><span className="text-muted-foreground">Adeudo:</span> <span className="font-bold text-destructive">${(selected.monto_adeudo ?? 0).toLocaleString()}</span></div>
                    )}
                  </div>

                  <div><p className="text-muted-foreground font-semibold mb-1">Detalle:</p><p className="text-foreground">{selected.motivo_detalle}</p></div>

                  {selected.comentarios_revisor && (
                    <div className="bg-accent/10 rounded-lg p-3">
                      <p className="text-muted-foreground font-semibold mb-1">Nota del revisor:</p>
                      <p className="text-foreground">{selected.comentarios_revisor}</p>
                    </div>
                  )}
                  {selected.comentarios_enlace && (
                    <div className="bg-accent/10 rounded-lg p-3">
                      <p className="text-muted-foreground font-semibold mb-1">Nota del enlace:</p>
                      <p className="text-foreground">{selected.comentarios_enlace}</p>
                    </div>
                  )}
                  {selected.comentarios_direccion && (
                    <div className="bg-accent/10 rounded-lg p-3">
                      <p className="text-muted-foreground font-semibold mb-1">Nota de dirección:</p>
                      <p className="text-foreground">{selected.comentarios_direccion}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-muted-foreground font-semibold mb-2">Documentos:</p>
                    <div className="space-y-2">
                      {docs.map(d => (
                        <div key={d.id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                          <FileText size={16} className="text-primary shrink-0" />
                          <span className="text-foreground flex-1 truncate">{d.nombre}</span>
                          <button onClick={() => openDoc(d.file_path)} className="text-primary"><ExternalLink size={14} /></button>
                          <button onClick={() => downloadDoc(d.file_path, d.nombre)} className="text-primary"><Download size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Resolución del Comité:</label>
                    <textarea value={comentarios} onChange={e => setComentarios(e.target.value)}
                      rows={3} className="w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Fundamento de la resolución del Comité..." />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => handleAction("rechazada")} disabled={acting}
                    className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-destructive text-destructive font-heading font-semibold hover:bg-destructive/5 transition-colors">
                    <XCircle size={20} /> Rechazar
                  </button>
                  <button onClick={() => handleAction("aprobada")} disabled={acting}
                    className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-success text-success-foreground font-heading font-semibold hover:bg-success/90 transition-colors shadow-lg">
                    <CheckCircle size={20} /> Aprobar
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
