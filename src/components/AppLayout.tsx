import React from "react";
import { getDocumentUrl } from "@/lib/solicitudes";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ClipboardCheck, ShieldCheck, Link2, Users, UserCog, X, ExternalLink } from "lucide-react";
import logo from "@/assets/logos-faz-plantel.png";

const ROLE_LABELS: Record<UserRole, string> = {
  revisor: "Revisor de Documentación",
  enlace: "Enlace de Nivel",
  direccion: "Dirección Operativa",
  comite: "Comité",
};

const NAV_ITEMS: Record<UserRole, { path: string; label: string; icon: React.ElementType }[]> = {
  revisor: [{ path: "/revisor/pendientes", label: "Solicitudes Pendientes", icon: ClipboardCheck }],

  enlace: [{ path: "/enlace/pendientes", label: "Solicitudes Asignadas", icon: Link2 }],

  direccion: [
    { path: "/direccion/panel", label: "Panel de Solicitudes", icon: ShieldCheck },
    { path: "/revisor/pendientes", label: "Vista Revisor", icon: ClipboardCheck },
    { path: "/enlace/pendientes", label: "Vista Enlace", icon: Link2 },
    { path: "/comite/panel", label: "Vista Comité", icon: Users },
    { path: "/usuarios", label: "Usuarios", icon: UserCog },
  ],

  comite: [{ path: "/comite/panel", label: "Casos para Comité", icon: Users }],
};
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const navItems = (NAV_ITEMS[user.role] ?? []).filter((i) => i.path !== "/usuarios" || user.isMaster);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <img
            alt="Fundación Azteca / Plantel Azteca"
            className="h-10 w-auto"
            src="/lovable-uploads/7a75dc81-b7b0-425d-b2f2-9bf3439da870.png"
          />
          <div className="hidden sm:block">
            <h1 className="font-heading text-lg font-bold leading-tight">Plantel Azteca CDMX</h1>
            <p className="text-sm opacity-80">Gestión de Aportaciones</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user.email}</p>
            <p className="text-xs opacity-80">{ROLE_LABELS[user.role]}</p>
          </div>
          <button
            onClick={async () => {
              await logout();
            }}
            className="touch-target flex items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors p-3"
            aria-label="Cerrar sesión"
          >
            <LogOut size={22} />
          </button>
        </div>
      </header>

      <nav className="bg-card border-b px-4 py-2 flex gap-2 overflow-x-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`touch-target flex items-center gap-2 px-5 py-3 rounded-lg font-heading font-medium text-sm transition-colors whitespace-nowrap
                ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-muted"}`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full animate-fade-in">{children}</main>

      <footer className="bg-muted text-muted-foreground text-center text-xs py-3 font-body">
        © 2026 Fundación Azteca de Grupo Salinas — Plantel Azteca CDMX
        <span className="block text-muted-foreground/60 mt-0.5">v1.2.0</span>
      </footer>
    </div>
  );
}

export function useDocViewer() {
  const [doc, setDoc] = React.useState<{ url: string; name: string } | null>(null);
  const [err, setErr] = React.useState("");
  const close = React.useCallback(() => {
    setDoc(null);
    setErr("");
  }, []);

  React.useEffect(() => {
    if (!doc && !err) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [doc, err, close]);

  const openDoc = async (filePath: string, nombre?: string) => {
    setErr("");
    try {
      const url = await getDocumentUrl(filePath);
      if (!url) throw new Error("sin url");
      setDoc({ url, name: nombre ?? filePath.split("/").pop() ?? "Documento" });
    } catch (e) {
      console.error(e);
      setErr("No se pudo abrir el documento. Intente de nuevo.");
    }
  };

  const isPdf = doc ? /\.pdf$/i.test(doc.url.split("?")[0]) : false;

  const viewer =
    doc || err ? (
      <div className="fixed inset-0 z-50 flex flex-col bg-black/85" role="dialog" aria-modal="true" onClick={close}>
        <div
          className="flex items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="truncate font-heading font-semibold">{doc ? doc.name : "Documento"}</p>
          <div className="flex items-center gap-2">
            {doc && (
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="touch-target flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-4 py-2 text-sm hover:bg-primary-foreground/20"
              >
                <ExternalLink size={16} /> Nueva pestaña
              </a>
            )}
            <button
              onClick={close}
              className="touch-target flex items-center gap-2 rounded-lg bg-primary-foreground/20 px-4 py-2 font-semibold hover:bg-primary-foreground/30"
              aria-label="Cerrar vista previa"
            >
              <X size={20} /> Cerrar
            </button>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center overflow-auto p-2" onClick={(e) => e.stopPropagation()}>
          {err ? (
            <p className="rounded-xl bg-card p-6 font-semibold text-destructive">{err}</p>
          ) : isPdf ? (
            <iframe src={doc!.url} title={doc!.name} className="h-full w-full rounded-lg bg-white" />
          ) : (
            <img src={doc!.url} alt={doc!.name} className="max-h-full max-w-full object-contain" />
          )}
        </div>
      </div>
    ) : null;

  return { openDoc, viewer };
}
