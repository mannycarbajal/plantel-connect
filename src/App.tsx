import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SolicitudesProvider } from "@/contexts/SolicitudesContext";
import LoginPage from "./pages/LoginPage";
import NuevaSolicitudPage from "./pages/NuevaSolicitudPage";
import MisSolicitudesPage from "./pages/MisSolicitudesPage";
import RevisorPage from "./pages/RevisorPage";
import DireccionPage from "./pages/DireccionPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/solicitud/nueva" replace /> : <LoginPage />} />
      <Route path="/solicitud/nueva" element={<ProtectedRoute allowedRoles={["solicitante"]}><NuevaSolicitudPage /></ProtectedRoute>} />
      <Route path="/solicitud/mis-solicitudes" element={<ProtectedRoute allowedRoles={["solicitante"]}><MisSolicitudesPage /></ProtectedRoute>} />
      <Route path="/revisor/pendientes" element={<ProtectedRoute allowedRoles={["revisor"]}><RevisorPage /></ProtectedRoute>} />
      <Route path="/direccion/panel" element={<ProtectedRoute allowedRoles={["direccion"]}><DireccionPage /></ProtectedRoute>} />
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
        <SolicitudesProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SolicitudesProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
