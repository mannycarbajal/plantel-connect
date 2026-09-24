import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { centralSupabase } from "@/integrations/supabase/centralClient";
import logo from "@/assets/logos-faz-plantel.png";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await centralSupabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/restablecer`,
      });
    } catch {
      // ignore — show generic message regardless
    }
    setSent(true);
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
            Recuperar Contraseña
          </h1>
          <p className="text-muted-foreground text-center mt-1">
            Ingresa tu correo y te enviaremos un enlace
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-6">
            <p className="text-foreground text-sm">
              Si el correo existe, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link
              to="/login"
              className="touch-target inline-flex items-center justify-center gap-2 mx-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-bold transition-all hover:bg-primary/90"
            >
              <ArrowLeft size={18} />
              Volver al login
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="touch-target w-full rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="correo@fundacionazteca.org"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              className={`touch-target w-full py-4 rounded-xl font-heading font-bold text-lg transition-all flex items-center justify-center gap-2
                ${email && !loading
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
            >
              {loading && <Loader2 size={20} className="animate-spin" />}
              Enviar enlace
            </button>

            <Link
              to="/login"
              className="block text-center text-sm text-primary hover:underline mt-6"
            >
              ← Volver al login
            </Link>
          </>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Fundación Azteca de Grupo Salinas
        </p>
      </motion.div>
    </div>
  );
}
