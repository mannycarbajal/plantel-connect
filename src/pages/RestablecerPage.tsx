import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { centralSupabase } from "@/integrations/supabase/centralClient";
import logo from "@/assets/logos-faz-plantel.png";

export default function RestablecerPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Check if we already have a recovery session on mount
    centralSupabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && mounted) setReady(true);
    });

    const { data: { subscription } } = centralSupabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session?.user)) {
          if (mounted) setReady(true);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error: updateErr } = await centralSupabase.auth.updateUser({ password });
    setLoading(false);

    if (updateErr) {
      setError(updateErr.message || "Error al actualizar la contraseña.");
      return;
    }

    setDone(true);
    setTimeout(() => navigate("/login"), 2000);
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
            Restablecer Contraseña
          </h1>
          <p className="text-muted-foreground text-center mt-1">
            Define tu nueva contraseña
          </p>
        </div>

        {done ? (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle size={40} className="text-success" />
            </div>
            <p className="text-foreground font-semibold">
              Contraseña actualizada. Redirigiendo al login…
            </p>
          </div>
        ) : !ready ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Repite la nueva contraseña"
                />
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm font-semibold mb-4 text-center">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !password || !confirm}
              className={`touch-target w-full py-4 rounded-xl font-heading font-bold text-lg transition-all flex items-center justify-center gap-2
                ${password && confirm && !loading
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              Restablecer
            </button>
          </>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Fundación Azteca de Grupo Salinas
        </p>
      </motion.div>
    </div>
  );
}
