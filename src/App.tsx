import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import NuevaSolicitudPage from "./pages/NuevaSolicitudPage";
import RevisorPage from "./pages/RevisorPage";
import EnlacePage from "./pages/EnlacePage";
import DireccionPage from "./pages/DireccionPage";
import ComitePage from "./pages/ComitePage";
import AuditorPage from "./pages/AuditorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const ROLE_HOME: Record<string, string> = {
    revisor: "/revisor/pendientes",
    enlace: "/enlace/pendientes",
    direccion: "/direccion/panel",
    comite: "/comite/panel",
    auditor: "/auditor/panel",
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/nueva-solicitud" element={<NuevaSolicitudPage />} />

      <Route path="/login" element={
        isAuthenticated && user ? <Navigate to={ROLE_HOME[user.role] ?? "/"} replace /> : <LoginPage />
      } />

      <Route path="/revisor/pendientes" element={<ProtectedRoute allowedRoles={["revisor"]}><RevisorPage /></ProtectedRoute>} />
      <Route path="/enlace/pendientes" element={<ProtectedRoute allowedRoles={["enlace"]}><EnlacePage /></ProtectedRoute>} />
      <Route path="/direccion/panel" element={<ProtectedRoute allowedRoles={["direccion"]}><DireccionPage /></ProtectedRoute>} />
      <Route path="/comite/panel" element={<ProtectedRoute allowedRoles={["comite"]}><ComitePage /></ProtectedRoute>} />
      <Route path="/auditor/panel" element={<ProtectedRoute allowedRoles={["auditor"]}><AuditorPage /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
