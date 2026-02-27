import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, LogIn } from "lucide-react";
import logo from "@/assets/logos-faz-plantel.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-lg"
      >
        <div className="flex flex-col items-center mb-10">
          <img src={logo} alt="Fundación Azteca / Plantel Azteca" className="h-16 w-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground text-center">
            Plantel Azteca CDMX
          </h1>
          <p className="text-muted-foreground text-center mt-1">
            Gestión de Aportaciones
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/nueva-solicitud")}
            className="touch-target w-full py-5 rounded-xl bg-primary text-primary-foreground font-heading font-bold text-lg transition-all hover:bg-primary/90 shadow-lg flex items-center justify-center gap-3"
          >
            <FileText size={24} />
            Nueva Solicitud
          </button>

          <button
            onClick={() => navigate("/login")}
            className="touch-target w-full py-5 rounded-xl border-2 border-primary text-primary font-heading font-bold text-lg transition-all hover:bg-primary/5 flex items-center justify-center gap-3"
          >
            <LogIn size={24} />
            Acceso Personal Autorizado
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2026 Fundación Azteca de Grupo Salinas
        </p>
      </motion.div>
    </div>
  );
}
