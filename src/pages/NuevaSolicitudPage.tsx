import React, { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { CheckCircle, Upload, ChevronDown, Camera, X, AlertCircle, FileUp } from "lucide-react";
import { logAuditEvent } from "@/lib/audit";
import logo from "@/assets/logos-faz-plantel.png";

type MotivoSolicitud = "desempleo" | "separacion" | "defuncion" | "otro";

const APORTACIONES = [
{ value: 1500, label: "$1,500 MXN" },
{ value: 1000, label: "$1,000 MXN" },
{ value: 800, label: "$800 MXN" },
{ value: 500, label: "$500 MXN" },
{ value: 300, label: "$300 MXN" }];


const MOTIVOS: {value: MotivoSolicitud;label: string;}[] = [
{ value: "desempleo", label: "Desempleo" },
{ value: "separacion", label: "Separación conyugal" },
{ value: "defuncion", label: "Defunción" },
{ value: "otro", label: "Otro motivo (caso especial)" }];


const NIVELES = ["Secundaria", "Bachillerato"];
const TURNOS = ["Matutino", "Vespertino"];

function isWithinSubmissionWindow(): boolean {
  const today = new Date();
  return today.getDate() <= 5;
}

export default function NuevaSolicitudPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    alumnoNombre: "",
    matricula: "",
    grupo: "",
    nivel: "",
    turno: "",
    tutorNombre: "",
    tutorTelefono: "",
    tutorEmail: "",
    aportacionActual: 0,
    aportacionPropuesta: 0,
    motivo: "" as MotivoSolicitud | "",
    motivoDetalle: "",
    tieneAdeudo: false,
    montoAdeudo: 0
  });

  const [escritoLibre, setEscritoLibre] = useState<File | null>(null);
  const [documentos, setDocumentos] = useState<File[]>([]);
  const escritoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const withinWindow = isWithinSubmissionWindow();

  const canSubmit =
  withinWindow &&
  form.alumnoNombre &&
  form.matricula &&
  form.grupo &&
  form.nivel &&
  form.turno &&
  form.tutorNombre &&
  form.tutorTelefono &&
  form.tutorEmail &&
  form.aportacionActual &&
  form.aportacionPropuesta &&
  form.motivo &&
  form.motivoDetalle;

  const handleDocAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocumentos((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      // Insert solicitud
      const { data: sol, error: solErr } = await supabase.
      from("solicitudes").
      insert({
        alumno_nombre: form.alumnoNombre,
        matricula: form.matricula,
        grupo: form.grupo,
        nivel: form.nivel,
        turno: form.turno,
        tutor_nombre: form.tutorNombre,
        tutor_telefono: form.tutorTelefono,
        tutor_email: form.tutorEmail,
        aportacion_actual: form.aportacionActual,
        aportacion_propuesta: form.aportacionPropuesta,
        motivo: form.motivo,
        motivo_detalle: form.motivoDetalle,
        tiene_adeudo: form.tieneAdeudo,
        monto_adeudo: form.tieneAdeudo ? form.montoAdeudo : 0
      }).
      select("id").
      single();

      if (solErr) throw new Error(solErr.message);

      const solId = sol.id;

      // Upload escrito libre
      if (escritoLibre) {
        const path = `${solId}/escrito-libre/${escritoLibre.name}`;
        await supabase.storage.from("documentos").upload(path, escritoLibre);
        await supabase.from("documentos").insert({
          solicitud_id: solId,
          nombre: escritoLibre.name,
          tipo: "escrito_libre",
          file_path: path
        });
      }

      // Upload documents
      for (const doc of documentos) {
        const path = `${solId}/comprobatorios/${doc.name}`;
        await supabase.storage.from("documentos").upload(path, doc);
        await supabase.from("documentos").insert({
          solicitud_id: solId,
          nombre: doc.name,
          tipo: "comprobatorio",
          file_path: path
        });
      }

      // Audit trail
      await logAuditEvent(solId, "solicitud_creada", form.tutorEmail, "solicitante");

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Error al enviar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <PublicLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center">

          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <CheckCircle size={48} className="text-success" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Solicitud Enviada</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Su solicitud ha sido registrada exitosamente. El equipo de revisión la analizará en los próximos días.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ alumnoNombre: "", matricula: "", grupo: "", nivel: "", turno: "", tutorNombre: "", tutorTelefono: "", tutorEmail: "", aportacionActual: 0, aportacionPropuesta: 0, motivo: "", motivoDetalle: "", tieneAdeudo: false, montoAdeudo: 0 });
              setEscritoLibre(null);
              setDocumentos([]);
            }}
            className="touch-target px-8 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/90 transition-colors">

            Nueva Solicitud
          </button>
        </motion.div>
      </PublicLayout>);

  }

  return (
    <PublicLayout>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Nueva Solicitud de Ajuste</h2>
        <p className="text-muted-foreground mt-1">Complete todos los campos para enviar su solicitud.</p>
      </div>

      {!withinWindow &&
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={24} className="text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-bold text-destructive">Fuera de periodo de solicitud</p>
            <p className="text-sm text-destructive/80">Las solicitudes solo se pueden enviar los primeros 5 días del mes.</p>
          </div>
        </div>
      }

      <div className="space-y-6">
        {/* Student Info */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Datos del Alumno</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-semibold text-foreground mb-1">Nombre completo del alumno</label>
              <input value={form.alumnoNombre} onChange={(e) => set("alumnoNombre", e.target.value)}
              className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Nombre completo" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Matrícula (8 dígitos)</label>
              <input value={form.matricula} onChange={(e) => {const v = e.target.value.replace(/\D/g, "").slice(0, 8);set("matricula", v);}}
              inputMode="numeric" maxLength={8}
              className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ej: 29123456" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Nivel</label>
              <div className="relative">
                <select value={form.nivel} onChange={(e) => set("nivel", e.target.value)}
                className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Seleccione...</option>
                  {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Turno</label>
              <div className="relative">
                <select value={form.turno} onChange={(e) => set("turno", e.target.value)}
                className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Seleccione...</option>
                  {TURNOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Grupo (3-4 dígitos)</label>
              <input value={form.grupo} onChange={(e) => {const v = e.target.value.replace(/\D/g, "").slice(0, 4);set("grupo", v);}}
              inputMode="numeric" maxLength={4}
              className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ej: 123" />
            </div>
          </div>
        </section>

        {/* Tutor Info */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Datos del Tutor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Nombre completo del tutor</label>
              <input value={form.tutorNombre} onChange={(e) => set("tutorNombre", e.target.value)}
              className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Nombre del tutor" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Teléfono de contacto</label>
              <input value={form.tutorTelefono} onChange={(e) => set("tutorTelefono", e.target.value)}
              type="tel" inputMode="tel"
              className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="55 1234 5678" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Correo electrónico</label>
              <input value={form.tutorEmail} onChange={(e) => set("tutorEmail", e.target.value)}
              type="email"
              className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="correo@ejemplo.com" />
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
                <select value={form.aportacionActual} onChange={(e) => set("aportacionActual", Number(e.target.value))}
                className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value={0}>Seleccione...</option>
                  {APORTACIONES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Aportación solicitada</label>
              <div className="relative">
                <select value={form.aportacionPropuesta} onChange={(e) => set("aportacionPropuesta", Number(e.target.value))}
                className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value={0}>Seleccione...</option>
                  {APORTACIONES.filter((a) => a.value < form.aportacionActual || !form.aportacionActual).map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* Adeudo */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Adeudo</h3>
          <div className="flex gap-3 mb-4">
            {[{ v: false, l: "No" }, { v: true, l: "Sí" }].map((opt) =>
            <button key={String(opt.v)} onClick={() => {set("tieneAdeudo", opt.v);if (!opt.v) set("montoAdeudo", 0);}}
            className={`touch-target flex-1 rounded-xl border-2 p-4 text-center font-heading font-medium transition-all
                  ${form.tieneAdeudo === opt.v ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/40"}`}>
                {opt.l}
              </button>
            )}
          </div>
          {form.tieneAdeudo &&
          <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Monto del adeudo (MXN)</label>
              <input value={form.montoAdeudo || ""} onChange={(e) => set("montoAdeudo", Number(e.target.value.replace(/\D/g, "")))}
            inputMode="numeric"
            className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="$0" />
            </div>
          }
        </section>

        {/* Reason */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Motivo de la Solicitud</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {MOTIVOS.map((m) => {
              const active = form.motivo === m.value;
              return (
                <button key={m.value} onClick={() => set("motivo", m.value)}
                className={`touch-target rounded-xl border-2 p-4 text-center font-heading font-medium transition-all
                    ${active ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/40"}`}>
                  {m.label}
                </button>);

            })}
          </div>
          <label className="block text-sm font-semibold text-foreground mb-1">Detalle del motivo</label>
          <textarea value={form.motivoDetalle} onChange={(e) => set("motivoDetalle", e.target.value)}
          rows={3} placeholder="Describa brevemente su situación..."
          className="w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        </section>

        {/* Escrito Libre */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Escrito Libre</h3>
          <input ref={escritoRef} type="file" accept="image/*,application/pdf" className="hidden"
          onChange={(e) => {if (e.target.files?.[0]) setEscritoLibre(e.target.files[0]);e.target.value = "";}} />
          {escritoLibre ?
          <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-3">
              <span className="text-foreground flex-1 truncate">{escritoLibre.name}</span>
              <button onClick={() => setEscritoLibre(null)} className="text-destructive"><X size={20} /></button>
            </div> :

          <div className="flex gap-3">
              <button onClick={() => { escritoRef.current?.setAttribute("capture", "environment"); escritoRef.current?.click(); }}
              className="flex-1 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-colors">
                <Camera size={36} className="text-muted-foreground mb-2" />
                <p className="font-heading font-semibold text-foreground">Tomar Foto</p>
              </button>
              <button onClick={() => { escritoRef.current?.removeAttribute("capture"); escritoRef.current?.click(); }}
              className="flex-1 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-colors">
                <FileUp size={36} className="text-muted-foreground mb-2" />
                <p className="font-heading font-semibold text-foreground">Cargar Archivo</p>
              </button>
            </div>
          }
        </section>

        {/* Documents */}
        <section className="bg-card rounded-xl border p-6 shadow-sm">
          <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
            Documentos Comprobatorios
            {documentos.length > 0 && <span className="ml-2 text-sm font-normal text-muted-foreground">({documentos.length} archivo{documentos.length !== 1 ? "s" : ""})</span>}
          </h3>
          <input ref={docRef} type="file" accept="image/*,application/pdf" className="hidden"
          onChange={handleDocAdd} />
          <div className="flex gap-3">
            <button onClick={() => {
              const input = docRef.current;
              if (!input) return;
              input.setAttribute("capture", "environment");
              input.removeAttribute("multiple");
              input.click();
            }}
            className="flex-1 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-colors cursor-pointer">
              <Camera size={36} className="text-muted-foreground mb-2" />
              <p className="font-heading font-semibold text-foreground">Tomar Foto</p>
            </button>
            <button onClick={() => {
              const input = docRef.current;
              if (!input) return;
              input.removeAttribute("capture");
              input.setAttribute("multiple", "true");
              input.click();
            }}
            className="flex-1 border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-colors cursor-pointer">
              <FileUp size={36} className="text-muted-foreground mb-2" />
              <p className="font-heading font-semibold text-foreground">Cargar Archivos</p>
              <p className="text-sm text-muted-foreground mt-1">Puede seleccionar varios</p>
            </button>
          </div>
          {documentos.length > 0 && (
            <div className="mt-4 space-y-2">
              {documentos.map((d, i) => (
                <div key={`${d.name}-${d.size}-${i}`} className="flex items-center gap-3 bg-muted rounded-lg px-4 py-3">
                  <Upload size={16} className="text-muted-foreground shrink-0" />
                  <span className="text-foreground flex-1 truncate text-sm">{d.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{(d.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => setDocumentos((prev) => prev.filter((_, j) => j !== i))} className="text-destructive shrink-0"><X size={20} /></button>
                </div>
              ))}
            </div>
          )}
        </section>

        {submitError &&
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-destructive text-sm font-semibold">
            {submitError}
          </div>
        }

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className={`touch-target w-full py-4 rounded-xl font-heading font-bold text-lg transition-all shadow-lg
            ${canSubmit && !submitting ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>

          {submitting ? "Enviando..." : "Enviar Solicitud"}
        </button>
      </div>
    </PublicLayout>);

}

function PublicLayout({ children }: {children: React.ReactNode;}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <img alt="Fundación Azteca / Plantel Azteca" className="h-10 w-auto" src="/lovable-uploads/d5f2960e-fcb4-4f84-8f75-87b3eb1c6074.png" />
          <div>
            <h1 className="font-heading text-lg font-bold leading-tight">Plantel Azteca CDMX</h1>
            <p className="text-sm opacity-80">Gestión de Aportaciones</p>
          </div>
        </div>
        <a href="/login" className="text-sm font-heading font-semibold text-primary-foreground/80 hover:text-primary-foreground underline">
          Personal
        </a>
      </header>
      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full animate-fade-in">
        {children}
      </main>
      <footer className="bg-muted text-muted-foreground text-center text-xs py-3 font-body">
        © 2026 Fundación Azteca de Grupo Salinas — Plantel Azteca CDMX
      </footer>
    </div>);

}