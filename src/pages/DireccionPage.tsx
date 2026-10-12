import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout, { useDocViewer } from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, FileText, Users, ExternalLink, Loader2, Search, KeyRound } from "lucide-react";
import { centralSupabase } from "@/integrations/supabase/centralClient";
import {
  fetchSolicitudes,
  fetchDocumentos,
  getDocumentUrl,
  updateSolicitudStatus,
  type SolicitudRow,
  type DocumentoRow,
} from "@/lib/solicitudes";
import { logAuditEvent, markPrimeraLectura } from "@/lib/audit";

const MOTIVO_LABELS: Record<string, string> = {
  desempleo: "Desempleo",
  separacion: "Separación conyugal",
  defuncion: "Defunción",
  otro: "Caso especial",
};

export default function DireccionPage() {
  const { user } = useAuth();
  const isReadOnly = false;
  const [solicitudes, setSolicitudes] = useState<SolicitudRow[]>([]);
  const [selected, setSelected] = useState<SolicitudRow | null>(null);
  const [docs, setDocs] = useState<DocumentoRow[]>([]);
  const [comentarios, setComentarios] = useState("");
  const [filter, setFilter] = useState<"pendientes" | "resueltas">("pendientes");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchSolicitudes();
      setSolicitudes(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (selected) {
      fetchDocumentos(selected.id).then(setDocs).catch(console.error);
      if (!isReadOnly) markPrimeraLectura(selected.id, "direccion_primera_lectura");
    }
  }, [selected?.id]);

  const pendientes = solicitudes.filter((s) => s.status === "enviada_direccion");
  const resueltas = solicitudes.filter((s) => ["aprobada", "rechazada", "enviada_comite"].includes(s.status));
  const displayed = filter === "pendientes" ? pendientes : resueltas;

  const handleAction = async (action: "aprobada" | "rechazada" | "enviada_comite") => {
    if (!selected) return;
    const confirmMsg = {
      aprobada: "¿Aprobar esta solicitud?",
      rechazada: "¿Rechazar esta solicitud?",
      enviada_comite: "¿Enviar este caso al Comité?",
    }[action];
    if (!window.confirm(confirmMsg)) return;
    setActing(true);
    setActionError("");
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
    } catch (e) {
      console.error(e);
      setActionError("No se pudo guardar la resolución. Revise su conexión e intente de nuevo.");
    }
    setActing(false);
  };

  const { openDoc, viewer } = useDocViewer();

  return (
    <AppLayout>
      {viewer}
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
          <p className="text-3xl font-heading font-bold text-success">
            {resueltas.filter((s) => s.status === "aprobada").length}
          </p>
          <p className="text-sm text-muted-foreground font-heading">Aprobadas</p>
        </div>
        <div className="bg-card rounded-xl border p-4 text-center shadow-sm">
          <p className="text-3xl font-heading font-bold text-destructive">
            {resueltas.filter((s) => s.status === "rechazada").length}
          </p>
          <p className="text-sm text-muted-foreground font-heading">Rechazadas</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(["pendientes", "resueltas"] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setSelected(null);
            }}
            className={`touch-target px-5 py-3 rounded-lg font-heading font-medium text-sm transition-colors
              ${filter === f ? "bg-primary text-primary-foreground" : "bg-card border text-foreground hover:bg-muted"}`}
          >
            {f === "pendientes" ? `Por Resolver (${pendientes.length})` : `Resueltas (${resueltas.length})`}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {displayed.length === 0 ? (
              <div className="bg-card rounded-xl border p-12 text-center">
                <p className="text-muted-foreground text-lg">No hay solicitudes en esta categoría.</p>
              </div>
            ) : (
              displayed.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelected(s);
                    setComentarios(s.comentarios_direccion ?? "");
                  }}
                  className={`touch-target w-full text-left bg-card rounded-xl border p-5 shadow-sm transition-all
                  ${selected?.id === s.id ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40"}`}
                >
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
              ))
            )}
          </div>

          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-card rounded-xl border p-6 shadow-sm"
              >
                <h3 className="font-heading text-xl font-bold text-foreground mb-4">{selected.folio}</h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground">Alumno:</span>{" "}
                      <span className="font-semibold text-foreground">{selected.alumno_nombre}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Matrícula:</span>{" "}
                      <span className="font-semibold text-foreground">{selected.matricula}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Nivel/Turno:</span>{" "}
                      <span className="font-semibold text-foreground">
                        {selected.nivel} {selected.turno}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Grupo:</span>{" "}
                      <span className="font-semibold text-foreground">{selected.grupo}</span>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div>
                        <span className="text-muted-foreground">Actual:</span>{" "}
                        <span className="font-bold text-foreground">
                          ${selected.aportacion_actual.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Solicitada:</span>{" "}
                        <span className="font-bold text-primary">
                          ${selected.aportacion_propuesta.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Motivo:</span>{" "}
                      <span className="font-semibold text-foreground">
                        {MOTIVO_LABELS[selected.motivo] ?? selected.motivo}
                      </span>
                    </div>
                    {selected.tiene_adeudo && (
                      <div className="mt-1">
                        <span className="text-muted-foreground">Adeudo:</span>{" "}
                        <span className="font-bold text-destructive">
                          ${(selected.monto_adeudo ?? 0).toLocaleString()}
                        </span>
                      </div>
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
                      {docs.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => openDoc(d.file_path)}
                          className="w-full flex items-center gap-2 bg-muted rounded-lg px-3 py-2 hover:bg-muted/80 transition-colors text-left"
                        >
                          <FileText size={16} className="text-primary shrink-0" />
                          <span className="text-foreground flex-1 truncate">{d.nombre}</span>
                          <ExternalLink size={14} className="text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {selected.status === "enviada_direccion" && !isReadOnly && (
                    <>
                      <div>
                        <label className="block text-muted-foreground font-semibold mb-1">
                          Resolución / Comentarios:
                        </label>
                        <textarea
                          value={comentarios}
                          onChange={(e) => setComentarios(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          placeholder="Fundamento de la resolución..."
                        />
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleAction("rechazada")}
                          disabled={acting}
                          className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-destructive text-destructive font-heading font-semibold hover:bg-destructive/5 transition-colors"
                        >
                          <XCircle size={20} /> Rechazar
                        </button>
                        <button
                          onClick={() => handleAction("enviada_comite")}
                          disabled={acting}
                          className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-brand-yellow text-brand-yellow font-heading font-semibold hover:bg-brand-yellow/5 transition-colors"
                        >
                          <Users size={20} /> Comité
                        </button>
                        <button
                          onClick={() => handleAction("aprobada")}
                          disabled={acting}
                          className="touch-target flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-success text-success-foreground font-heading font-semibold hover:bg-success/90 transition-colors shadow-lg"
                        >
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

/* ------------------------------------------------------------------ */
/* Administración de usuarios (solo master_tic)                        */
/* ------------------------------------------------------------------ */

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  status: string;
  plantel_id: string | null;
  department: string | null;
  last_sign_in_at: string | null;
  created_at: string | null;
};

type EnlaceRow = { nivel: string; turno: string; user_id: string };

const ROLE_LABEL: Record<string, string> = {
  master_tic: "Master TIC",
  direccion: "Dirección",
  tic: "TIC / Revisor",
  enlace: "Enlace",
  coordinador: "Coordinador",
};

const EDITABLE_ROLES = ["tic", "enlace", "coordinador", "direccion"];

const STATUS_LABEL: Record<string, string> = {
  active: "Activo",
  pending: "Pendiente",
  rejected: "Rechazado",
};

const STATUS_CLASS: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-brand-yellow/20 text-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

const ENLACE_SLOTS = [
  { nivel: "Secundaria", turno: "Matutino" },
  { nivel: "Secundaria", turno: "Vespertino" },
  { nivel: "Bachillerato", turno: "Matutino" },
  { nivel: "Bachillerato", turno: "Vespertino" },
];

export function UsuariosPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [enlaces, setEnlaces] = useState<EnlaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [roleF, setRoleF] = useState("todos");
  const [statusF, setStatusF] = useState("todos");
  const [allPlanteles, setAllPlanteles] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    const [p, e] = await Promise.all([
      centralSupabase
        .from("profiles")
        .select("id,email,full_name,role,status,plantel_id,department,last_sign_in_at,created_at")
        .order("full_name"),
      centralSupabase.from("contrib_enlaces").select("nivel,turno,user_id"),
    ]);
    if (p.error) setError("No se pudo cargar la lista de usuarios: " + p.error.message);
    else setRows((p.data ?? []) as ProfileRow[]);
    if (!e.error) setEnlaces((e.data ?? []) as EnlaceRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.isMaster) load();
  }, [user?.id]);

  const isEditable = (r: ProfileRow) => r.role !== "master_tic" && r.id !== user?.id && r.plantel_id === "CDMX";

  const nameOf = (id: string) => {
    const r = rows.find((x) => x.id === id);
    return r ? r.full_name || r.email || id : "—";
  };

  const assignedSlots = (id: string) => enlaces.filter((x) => x.user_id === id).map((x) => x.nivel + " " + x.turno);

  const updateProfile = async (r: ProfileRow, patch: Partial<ProfileRow>, okMsg: string) => {
    setBusyId(r.id);
    setError("");
    setNotice("");
    const { data, error: err } = await centralSupabase.from("profiles").update(patch).eq("id", r.id).select("id");
    if (err || !data || data.length === 0) {
      setError("No se pudo guardar el cambio" + (err ? ": " + err.message : " (sin permiso)."));
    } else {
      setNotice(okMsg);
      await load();
    }
    setBusyId(null);
  };

  const changeStatus = async (r: ProfileRow, status: "active" | "rejected", verb: string) => {
    const slots = assignedSlots(r.id);
    let msg = "¿" + verb + " a " + (r.full_name || r.email) + "?";
    if (status === "rejected" && slots.length > 0)
      msg += " Atiende como enlace: " + slots.join(", ") + ". Reasigne esos niveles después.";
    if (!window.confirm(msg)) return;
    await updateProfile(
      r,
      { status },
      "Usuario actualizado: " + (r.full_name || r.email) + " → " + STATUS_LABEL[status] + ".",
    );
  };

  const changeRole = async (r: ProfileRow, role: string) => {
    if (role === r.role) return;
    const slots = assignedSlots(r.id);
    let msg = "¿Cambiar el rol de " + (r.full_name || r.email) + " a " + ROLE_LABEL[role] + "?";
    if (role !== "enlace" && role !== "coordinador" && slots.length > 0)
      msg += " Atiende como enlace: " + slots.join(", ") + ". Reasigne esos niveles después.";
    if (!window.confirm(msg)) return;
    await updateProfile(r, { role }, "Rol actualizado: " + (r.full_name || r.email) + " → " + ROLE_LABEL[role] + ".");
  };

  const sendReset = async (r: ProfileRow) => {
    if (!r.email) return;
    if (!window.confirm("¿Enviar correo para restablecer la contraseña a " + r.email + "?")) return;
    setBusyId(r.id);
    setError("");
    setNotice("");
    const { error: err } = await centralSupabase.auth.resetPasswordForEmail(r.email, {
      redirectTo: "https://contribuciones.plantelazteca.org/restablecer",
    });
    if (err) setError("No se pudo enviar el correo: " + err.message);
    else setNotice("Correo de restablecimiento enviado a " + r.email + ".");
    setBusyId(null);
  };

  const setEnlace = async (nivel: string, turno: string, userId: string) => {
    if (!userId) return;
    setError("");
    setNotice("");
    const { error: err } = await centralSupabase
      .from("contrib_enlaces")
      .upsert({ nivel, turno, user_id: userId }, { onConflict: "nivel,turno" });
    if (err) {
      setError("No se pudo guardar la asignación de enlace: " + err.message);
    } else {
      setNotice("Enlace de " + nivel + " " + turno + " actualizado: " + nameOf(userId) + ".");
      await load();
    }
  };

  const base = allPlanteles
    ? rows
    : rows.filter((r) => r.plantel_id === "CDMX" || r.role === "master_tic" || r.role === "direccion");
  const needle = q.trim().toLowerCase();
  const shown = base.filter(
    (r) =>
      (roleF === "todos" || r.role === roleF) &&
      (statusF === "todos" || r.status === statusF) &&
      (!needle || (r.full_name ?? "").toLowerCase().includes(needle) || (r.email ?? "").toLowerCase().includes(needle)),
  );

  const count = (s: string) => base.filter((r) => r.status === s).length;
  const eligibleEnlaces = rows.filter(
    (r) => r.plantel_id === "CDMX" && r.status === "active" && (r.role === "enlace" || r.role === "coordinador"),
  );

  if (!user?.isMaster) {
    return (
      <AppLayout>
        <div className="bg-card rounded-xl border p-12 text-center">
          <p className="text-muted-foreground text-lg">Esta sección es solo para el administrador TIC (master).</p>
        </div>
      </AppLayout>
    );
  }

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("es-MX") : "Nunca");

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Administración de Usuarios</h2>
        <p className="text-muted-foreground mt-1">
          Cuentas con acceso a Contribuciones CDMX. Los cambios de rol y estado aplican en todo el portal Plantel
          Azteca.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border p-4 text-center shadow-sm">
          <p className="text-3xl font-heading font-bold text-foreground">{base.length}</p>
          <p className="text-sm text-muted-foreground font-heading">Usuarios</p>
        </div>
        <div className="bg-card rounded-xl border p-4 text-center shadow-sm">
          <p className="text-3xl font-heading font-bold text-success">{count("active")}</p>
          <p className="text-sm text-muted-foreground font-heading">Activos</p>
        </div>
        <div className="bg-card rounded-xl border p-4 text-center shadow-sm">
          <p className="text-3xl font-heading font-bold text-brand-yellow">{count("pending")}</p>
          <p className="text-sm text-muted-foreground font-heading">Pendientes</p>
        </div>
        <div className="bg-card rounded-xl border p-4 text-center shadow-sm">
          <p className="text-3xl font-heading font-bold text-destructive">{count("rejected")}</p>
          <p className="text-sm text-muted-foreground font-heading">Rechazados</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-semibold text-success">
          {notice}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="touch-target w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={roleF}
          onChange={(e) => setRoleF(e.target.value)}
          className="touch-target rounded-lg border bg-background px-3 py-2 text-foreground"
        >
          <option value="todos">Todos los roles</option>
          {Object.keys(ROLE_LABEL).map((k) => (
            <option key={k} value={k}>
              {ROLE_LABEL[k]}
            </option>
          ))}
        </select>
        <select
          value={statusF}
          onChange={(e) => setStatusF(e.target.value)}
          className="touch-target rounded-lg border bg-background px-3 py-2 text-foreground"
        >
          <option value="todos">Todos los estados</option>
          {Object.keys(STATUS_LABEL).map((k) => (
            <option key={k} value={k}>
              {STATUS_LABEL[k]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={allPlanteles} onChange={(e) => setAllPlanteles(e.target.checked)} />
          Ver todos los planteles
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="p-3 font-heading">Usuario</th>
                <th className="p-3 font-heading">Rol</th>
                <th className="p-3 font-heading">Plantel</th>
                <th className="p-3 font-heading">Estado</th>
                <th className="p-3 font-heading">Último acceso</th>
                <th className="p-3 font-heading">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No hay usuarios con esos filtros.
                  </td>
                </tr>
              )}
              {shown.map((r) => {
                const editable = isEditable(r);
                const busy = busyId === r.id;
                const slots = assignedSlots(r.id);
                return (
                  <tr key={r.id} className="border-b last:border-0 align-top">
                    <td className="p-3">
                      <p className="font-semibold text-foreground">{r.full_name || "(sin nombre)"}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                      {slots.length > 0 && <p className="text-xs text-primary mt-1">Enlace: {slots.join(", ")}</p>}
                    </td>
                    <td className="p-3">
                      {editable ? (
                        <select
                          value={r.role}
                          disabled={busy}
                          onChange={(e) => changeRole(r, e.target.value)}
                          className="touch-target rounded-lg border bg-background px-2 py-1 text-foreground"
                        >
                          {EDITABLE_ROLES.map((k) => (
                            <option key={k} value={k}>
                              {ROLE_LABEL[k]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-foreground">{ROLE_LABEL[r.role] ?? r.role}</span>
                      )}
                    </td>
                    <td className="p-3 text-foreground">{r.plantel_id ?? "—"}</td>
                    <td className="p-3">
                      <span
                        className={
                          "inline-block rounded-full px-3 py-1 text-xs font-semibold " +
                          (STATUS_CLASS[r.status] ?? "bg-muted")
                        }
                      >
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{fmt(r.last_sign_in_at)}</td>
                    <td className="p-3">
                      {editable ? (
                        <div className="flex flex-wrap gap-2">
                          {r.status !== "active" && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                changeStatus(r, "active", r.status === "pending" ? "Aprobar" : "Reactivar")
                              }
                              className="touch-target rounded-lg bg-success px-3 py-1 text-xs font-semibold text-success-foreground"
                            >
                              {r.status === "pending" ? "Aprobar" : "Reactivar"}
                            </button>
                          )}
                          {r.status !== "rejected" && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                changeStatus(r, "rejected", r.status === "pending" ? "Rechazar" : "Desactivar")
                              }
                              className="touch-target rounded-lg border-2 border-destructive px-3 py-1 text-xs font-semibold text-destructive"
                            >
                              {r.status === "pending" ? "Rechazar" : "Desactivar"}
                            </button>
                          )}
                          <button
                            disabled={busy}
                            onClick={() => sendReset(r)}
                            className="touch-target flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-semibold text-foreground"
                          >
                            <KeyRound size={12} /> Restablecer contraseña
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {r.id === user?.id
                            ? "Tu cuenta"
                            : r.role === "master_tic"
                              ? "Protegido"
                              : "Otro plantel / global"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <h3 className="font-heading text-xl font-bold text-foreground mb-1">Enlace por nivel y turno</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Quien recibe las solicitudes que el revisor envía a enlace, según el nivel y turno del alumno.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ENLACE_SLOTS.map((s) => {
            const cur = enlaces.find((x) => x.nivel === s.nivel && x.turno === s.turno);
            return (
              <div key={s.nivel + s.turno} className="bg-muted rounded-lg p-4">
                <p className="font-heading font-semibold text-foreground mb-2">
                  {s.nivel} — {s.turno}
                </p>
                <select
                  value={cur?.user_id ?? ""}
                  onChange={(e) => setEnlace(s.nivel, s.turno, e.target.value)}
                  className="touch-target w-full rounded-lg border bg-background px-3 py-2 text-foreground"
                >
                  {!cur && <option value="">Sin asignar</option>}
                  {eligibleEnlaces.map((r) => (
                    <option key={r.id} value={r.id}>
                      {(r.full_name || r.email) + " (" + ROLE_LABEL[r.role] + ")"}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
