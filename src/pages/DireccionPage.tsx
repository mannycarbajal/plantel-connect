import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, FileText, Users, ExternalLink, Loader2 } from "lucide-react";
import { fetchSolicitudes, fetchDocumentos, getDocumentUrl, updateSolicitudStatus, type SolicitudRow, type DocumentoRow } from "@/lib/solicitudes";
import { logAuditEvent, markPrimeraLectura } from "@/lib/audit";

const MOTIVO_LABELS: Record<string, string> = {
  desempleo: "Desempleo",
  separacion: "Separación conyugal",
  defuncion: "Defunción",
  otro: "Caso especial",
};

export default function DireccionPage() {
  const { user } = useAuth();
  const isAuditor = user?.role === "auditor";
  const [solicitudes, setSolicitudes] = useState<SolicitudRow[]>([]);
  const [selected, setSelected] = useState<SolicitudRow | null>(null);
  const [docs, setDocs] = useState<DocumentoRow[]>([]);
  const [comentarios, setComentarios] = useState("");
  const [filter, setFilter] = useState<"pendientes" | "resueltas">("pendientes");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchSolicitudes();
      setSolicitudes(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (selected) {
      fetchDocumentos(selected.id).then(setDocs).catch(console.error);
      if (!isAuditor) markPrimeraLectura(selected.id, "direccion_primera_lectura");
    }
  }, [selected?.id]);

  const pendientes = solicitudes.filter(s => s.status === "enviada_direccion");
  const resueltas = solicitudes.filter(s => ["aprobada", "rechazada", "enviada_comite"].includes(s.status));
  const displayed = filter === "pendientes" ? pendientes : resueltas;

  const handleAction = async (action: "aprobada" | "rechazada" | "enviada_comite") => {
    if (!selected) return;
    setActing(true);
    const labels = {
      aprobada: "Solicitud aprobada por Dirección Operativa.",
      rechazada: "Solicitud rechazada por Dirección Operativa.",
      enviada_comite: "Caso enviado a Comité para resolución.",
    };
    try {
      await updateSolicitudStatus(selected.id, action, {
        comentarios_direccion: comentarios || labels[action],
        fecha_direccion: new Date().toISOString(),
        ...(action !== "enviada_comite" ? { fecha_resolucion: new Date().toISOString() } : {}),
      });
      await logAuditEvent(selected.id, action, user?.email, "direccion");
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
        <h2 className="font-heading text-2xl font-bold text-foreground">Panel de Dirección Operativa</h2>
        <p className="text-muted-foreground mt-1">Analice y resuelva las solicitudes de ajuste.</p>
      </div>

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

      <div className="flex gap-2 mb-4">
        {(["pendientes", "resueltas"] as const).map(f => (
          <button key={f} onClick={() => { setFilter(f); setSelected(null); }}
            className={`touch-target px-5 py-3 rounded-lg font-heading font-medium text-sm transition-colors
              ${filter === f ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:bg-muted"}`}>
            {f === "pendientes" ? `Por Resolver (${pendientes.length})` : `Resueltas (${resueltas.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {displayed.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center">
                <p className="text-muted-foreground text-lg">No hay solicitudes en esta categoría.</p>
              </div>
            ) : displayed.map(s => (
              <button key={s.id} onClick={() => { setSelected(s); setComentarios(s.comentarios_direccion ?? ""); }}
                className={`touch-target w-full text-left bg-card rounded-xl border p-5 shadow-sm transition-all
                  ${selected?.id === s.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-heading font-bold text-foreground">{s.folio}</p>
                    <p className="text-sm text-muted-foreground">{s.tutor_nombre}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-foreground">{s.alumno_nombre}</span>
                  <span className="text-muted-foreground">{MOTIVO_LABELS[s.motivo] ?? s.motivo}</span>
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

                  {selected.status === "enviada_direccion" && !isAuditor && (
                    <>
                      <div>
                        <label className="block text-muted-foreground font-semibold mb-1">Resolución / Comentarios:</label>
                        <textarea value={comentarios} onChange={e => setComentarios(e.target.value)}
                          rows={3} className="w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          placeholder="Fundamento de la resolución..." />
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button onClick={() => handleAction("rechazada")} disabled={acting}
                          className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-destructive text-destructive font-heading font-semibold hover:bg-destructive/5 transition-colors">
                          <XCircle size={20} /> Rechazar
                        </button>
                        <button onClick={() => handleAction("enviada_comite")} disabled={acting}
                          className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-brand-yellow text-brand-yellow font-heading font-semibold hover:bg-brand-yellow/5 transition-colors">
                          <Users size={20} /> Comité
                        </button>
                        <button onClick={() => handleAction("aprobada")} disabled={acting}
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
      )}
    </AppLayout>
  );
}
