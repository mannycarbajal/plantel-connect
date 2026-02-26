import React, { useState } from "react";
import { useSolicitudes, MotivoSolicitud } from "@/contexts/SolicitudesContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { motion } from "framer-motion";
import { CheckCircle, Upload, ChevronDown } from "lucide-react";

const APORTACIONES = [
  { value: 1500, label: "$1,500 MXN" },
  { value: 1000, label: "$1,000 MXN" },
  { value: 800, label: "$800 MXN" },
  { value: 500, label: "$500 MXN" },
  { value: 300, label: "$300 MXN" },
];

const MOTIVOS: { value: MotivoSolicitud; label: string }[] = [
  { value: "desempleo", label: "Desempleo" },
  { value: "separacion", label: "Separación conyugal" },
  { value: "defuncion", label: "Defunción" },
  { value: "otro", label: "Otro motivo (caso especial)" },
];

const NIVELES = ["Secundaria", "Preparatoria"];
const GRUPOS = ["1-A", "1-B", "1-C", "2-A", "2-B", "2-C", "3-A", "3-B", "3-C"];

export default function NuevaSolicitudPage() {
  const { addSolicitud } = useSolicitudes();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    alumnoNombre: "",
    grupo: "",
    nivel: "",
    aportacionActual: 0,
    aportacionPropuesta: 0,
    motivo: "" as MotivoSolicitud | "",
    motivoDetalle: "",
    adeudo: 0,
  });

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const canSubmit = form.alumnoNombre && form.grupo && form.nivel && form.aportacionActual && form.aportacionPropuesta && form.motivo && form.motivoDetalle;

  const handleSubmit = () => {
    if (!canSubmit || !user) return;
    addSolicitud({
      alumnoNombre: form.alumnoNombre,
      grupo: form.grupo,
      nivel: form.nivel,
      tutorNombre: user.name,
      tutorEmail: user.email,
      aportacionActual: form.aportacionActual,
      aportacionPropuesta: form.aportacionPropuesta,
      motivo: form.motivo as MotivoSolicitud,
      motivoDetalle: form.motivoDetalle,
      documentos: ["documento_adjunto.pdf"],
      comentarios: "",
      adeudo: form.adeudo,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AppLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <CheckCircle size={48} className="text-success" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
            Solicitud Enviada
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Su solicitud ha sido registrada exitosamente. El equipo de revisión la analizará en los próximos días. Le notificaremos la resolución por correo electrónico.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setSubmitted(false); setForm({ alumnoNombre: "", grupo: "", nivel: "", aportacionActual: 0, aportacionPropuesta: 0, motivo: "", motivoDetalle: "", adeudo: 0 }); }} className="touch-target px-6 py-3 rounded-xl border-2 border-primary text-primary font-heading font-semibold hover:bg-primary/5 transition-colors">
              Nueva Solicitud
            </button>
            <button onClick={() => navigate("/solicitud/mis-solicitudes")} className="touch-target px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors">
              Ver Mis Solicitudes
            </button>
          </div>
        </motion.div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Nueva Solicitud de Ajuste</h2>
        <p className="text-muted-foreground mt-1">Complete todos los campos para enviar su solicitud.</p>
      </div>

      <div className="space-y-6">
        {/* Student Info */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Datos del Alumno</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Nombre completo del alumno</label>
              <input value={form.alumnoNombre} onChange={e => set("alumnoNombre", e.target.value)}
                className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nombre del alumno" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Nivel</label>
              <div className="relative">
                <select value={form.nivel} onChange={e => set("nivel", e.target.value)}
                  className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Seleccione...</option>
                  {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Grupo</label>
              <div className="relative">
                <select value={form.grupo} onChange={e => set("grupo", e.target.value)}
                  className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Seleccione...</option>
                  {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Contribution */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Aportación</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Aportación actual</label>
              <div className="relative">
                <select value={form.aportacionActual} onChange={e => set("aportacionActual", Number(e.target.value))}
                  className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value={0}>Seleccione...</option>
                  {APORTACIONES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Aportación solicitada</label>
              <div className="relative">
                <select value={form.aportacionPropuesta} onChange={e => set("aportacionPropuesta", Number(e.target.value))}
                  className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value={0}>Seleccione...</option>
                  {APORTACIONES.filter(a => a.value < form.aportacionActual || !form.aportacionActual).map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Reason */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Motivo de la Solicitud</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {MOTIVOS.map(m => {
              const active = form.motivo === m.value;
              return (
                <button key={m.value} onClick={() => set("motivo", m.value)}
                  className={`touch-target rounded-xl border-2 p-4 text-center font-heading font-medium transition-all
                    ${active ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/40"}`}>
                  {m.label}
                </button>
              );
            })}
          </div>
          <label className="block text-sm font-semibold text-foreground mb-1">Detalle del motivo</label>
          <textarea value={form.motivoDetalle} onChange={e => set("motivoDetalle", e.target.value)}
            rows={3} placeholder="Describa brevemente su situación..."
            className="w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        </section>

        {/* Documents */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Documentos Comprobatorios</h3>
          <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-colors cursor-pointer">
            <Upload size={36} className="text-muted-foreground mb-3" />
            <p className="font-heading font-semibold text-foreground">Toque para adjuntar documentos</p>
            <p className="text-sm text-muted-foreground mt-1">Identificación oficial, comprobantes, constancias</p>
          </div>
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`touch-target w-full py-4 rounded-xl font-heading font-bold text-lg transition-all shadow-lg
            ${canSubmit ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
          Enviar Solicitud
        </button>
      </div>
    </AppLayout>
  );
}
