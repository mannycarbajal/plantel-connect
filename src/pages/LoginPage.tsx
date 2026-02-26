import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logos-faz-plantel.png";

const ROLE_ROUTES: Record<string, string> = {
  revisor: "/revisor/pendientes",
  enlace: "/enlace/pendientes",
  direccion: "/direccion/panel",
  comite: "/comite/panel",
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const err = await login(email, password);
    if (err) {
      setError("Credenciales incorrectas. Intente de nuevo.");
      setLoading(false);
      return;
    }
    // Wait for auth state to settle and get role
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();
      const route = ROLE_ROUTES[roleData?.role ?? ""] ?? "/login";
      navigate(route);
    }
    setLoading(false);
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
