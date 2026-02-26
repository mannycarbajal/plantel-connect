import React, { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, ClipboardCheck, ShieldCheck, Eye } from "lucide-react";
import logo from "@/assets/logo-fundacion-azteca.png";

const ROLES: { value: UserRole; label: string; desc: string; icon: React.ElementType; path: string }[] = [
  { value: "solicitante", label: "Soy Tutor/a", desc: "Solicitar ajuste de aportación", icon: User, path: "/solicitud/nueva" },
  { value: "revisor", label: "Revisor", desc: "Revisar documentación", icon: Eye, path: "/revisor/pendientes" },
  { value: "direccion", label: "Dirección", desc: "Aprobar o denegar solicitudes", icon: ShieldCheck, path: "/direccion/panel" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleLogin = () => {
    if (!selectedRole) return;
    const role = ROLES.find(r => r.value === selectedRole)!;
    login("demo@plantelazteca.org", "demo", selectedRole);
    navigate(role.path);
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-lg"
      >
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Fundación Azteca" className="h-16 w-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground text-center">
            Plantel Azteca CDMX
          </h1>
          <p className="text-muted-foreground text-center mt-1">
            Gestión de Aportaciones Económicas
          </p>
        </div>

        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
          Seleccione su perfil para ingresar
        </h2>

        <div className="space-y-3 mb-8">
          {ROLES.map(role => {
            const active = selectedRole === role.value;
            return (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`touch-target w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                  ${active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0
                  ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <role.icon size={24} />
                </div>
                <div>
                  <p className="font-heading font-semibold text-foreground">{role.label}</p>
                  <p className="text-sm text-muted-foreground">{role.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleLogin}
          disabled={!selectedRole}
          className={`touch-target w-full py-4 rounded-xl font-heading font-bold text-lg transition-all
            ${selectedRole
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
        >
          Ingresar
        </button>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Fundación Azteca de Grupo Salinas
        </p>
      </motion.div>
    </div>
  );
}
