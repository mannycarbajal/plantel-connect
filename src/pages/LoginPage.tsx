import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, LogOut } from "lucide-react";
import logo from "@/assets/logos-faz-plantel.png";

const ROLE_ROUTES: Record<string, string> = {
  revisor: "/revisor/pendientes",
  enlace: "/enlace/pendientes",
  direccion: "/direccion/panel",
  comite: "/comite/panel",
  auditor: "/auditor/panel",
};

export default function LoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ email: string } | null>(null);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    setPendingUser(null);

    const err = await login(email, password);
    if (err) {
      setError("Credenciales incorrectas. Intente de nuevo.");
      setLoading(false);
      return;
    }

    // After login, check user from context — need to fetch profile from central
    const { centralSupabase } = await import("@/integrations/supabase/centralClient");
    const { data: { user } } = await centralSupabase.auth.getUser();

    if (user) {
      const { data: profile } = await centralSupabase
        .from("profiles")
        .select("role, status, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        setError("No se encontró perfil para este usuario.");
        setLoading(false);
        return;
      }

      if (profile.status === "pending") {
        setPendingUser({ email: user.email ?? email });
        setLoading(false);
        return;
      }

      // Map role to route
      const roleMap: Record<string, string> = {
        master_tic: "direccion",
        direccion: "direccion",
        tic: "revisor",
        enlace: "enlace",
        coordinador: "enlace",
      };
      const appRole = roleMap[profile.role] ?? "";
      const route = ROLE_ROUTES[appRole] ?? "/login";
      navigate(route);
    }
    setLoading(false);
  };

  if (pendingUser) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-lg text-center"
        >
          <img src={logo} alt="Fundación Azteca / Plantel Azteca" className="h-16 w-auto mb-6 mx-auto" />
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <p className="text-amber-800 font-semibold text-lg mb-2">⏳ Cuenta pendiente</p>
            <p className="text-amber-700 text-sm">
              Tu cuenta está pendiente de aprobación. Contacta al administrador TIC.
            </p>
          </div>
          <p className="text-muted-foreground text-sm mb-6">{pendingUser.email}</p>
          <button
            onClick={logout}
            className="touch-target flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold transition-all hover:bg-primary/90"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-lg"
      >
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Fundación Azteca / Plantel Azteca" className="h-16 w-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground text-center">
            Plantel Azteca CDMX
          </h1>
          <p className="text-muted-foreground text-center mt-1">
            Acceso Personal Autorizado
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="correo@fundacionazteca.org"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <p className="text-destructive text-sm font-semibold mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className={`touch-target w-full py-4 rounded-xl font-heading font-bold text-lg transition-all flex items-center justify-center gap-2
            ${email && password && !loading
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
        >
          {loading && <Loader2 size={20} className="animate-spin" />}
          Ingresar
        </button>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Fundación Azteca de Grupo Salinas
        </p>
      </motion.div>
    </div>
  );
}
