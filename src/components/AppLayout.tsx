import React from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ClipboardCheck, ShieldCheck, Link2, Users, Eye } from "lucide-react";
import logo from "@/assets/logos-faz-plantel.png";

const ROLE_LABELS: Record<UserRole, string> = {
  revisor: "Revisor de Documentación",
  enlace: "Enlace de Nivel",
  direccion: "Dirección Operativa",
  comite: "Comité",
  auditor: "Auditor",
};

const NAV_ITEMS: Record<UserRole, { path: string; label: string; icon: React.ElementType }[]> = {
  revisor: [
    { path: "/revisor/pendientes", label: "Solicitudes Pendientes", icon: ClipboardCheck },
  ],
  enlace: [
    { path: "/enlace/pendientes", label: "Solicitudes Asignadas", icon: Link2 },
  ],
  direccion: [
    { path: "/direccion/panel", label: "Panel de Solicitudes", icon: ShieldCheck },
  ],
  comite: [
    { path: "/comite/panel", label: "Casos para Comité", icon: Users },
  ],
  auditor: [
    { path: "/auditor/panel", label: "Panel de Auditoría", icon: Eye },
  ],
};
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const navItems = NAV_ITEMS[user.role] ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Fundación Azteca / Plantel Azteca" className="h-10 w-auto" />
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
            onClick={async () => { await logout(); navigate("/login"); }}
            className="touch-target flex items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors p-3"
            aria-label="Cerrar sesión"
          >
            <LogOut size={22} />
          </button>
        </div>
      </header>

      <nav className="bg-card border-b px-4 py-2 flex gap-2 overflow-x-auto">
        {navItems.map(item => {
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

      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full animate-fade-in">
        {children}
      </main>

      <footer className="bg-muted text-muted-foreground text-center text-xs py-3 font-body">
        © 2026 Fundación Azteca de Grupo Salinas — Plantel Azteca CDMX
      </footer>
    </div>
  );
}
