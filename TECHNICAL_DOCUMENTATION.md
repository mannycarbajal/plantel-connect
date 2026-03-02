# Plantel Azteca CDMX — Technical Documentation
## Complete Migration Guide

**Generated:** 2026-03-02  
**App URL:** https://plantel-connect.lovable.app  
**Project ID:** f06d4b36-ad31-489b-90bb-0515ef8c5983

---

## 1. Project Overview

### App Name
**Plantel Azteca CDMX — Gestión de Aportaciones**

### Purpose
A school tuition adjustment request management system for **Plantel Azteca CDMX** (Fundación Azteca de Grupo Salinas). Parents/guardians submit requests to reduce their tuition contributions due to financial hardship (unemployment, separation, death, special circumstances). These requests flow through a multi-stage approval pipeline: Reviewer → Liaison → Director → Committee.

### Target Users
| Role | Description | Auth Required |
|------|-------------|---------------|
| **Solicitante (Parent/Guardian)** | Submits tuition adjustment requests via a shared kiosk iPad | No (anonymous) |
| **Revisor** | Reviews document completeness, forwards to Enlace | Yes |
| **Enlace** | Level/shift-specific liaison, reviews and forwards to Dirección | Yes |
| **Dirección** | Operations director, approves/rejects/escalates to Comité | Yes |
| **Comité** | Final decision body for escalated cases | Yes |
| **Auditor** | Read-only access to all views with SLA tracking | Yes |

### Use Cases
1. Parent submits adjustment request with supporting documents on shared kiosk
2. Reviewer validates documentation completeness
3. Enlace verifies contextual information for their level/shift
4. Director approves, rejects, or escalates to Committee
5. Committee makes final decision on escalated cases
6. Auditor monitors SLA compliance across all stages

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | ^18.3.1 | UI framework |
| TypeScript | ^5.8.3 | Type safety |
| Vite | ^5.4.19 | Build tool & dev server |
| Tailwind CSS | ^3.4.17 | Utility-first styling |
| shadcn/ui | (various @radix-ui) | Component library |
| React Router DOM | ^6.30.1 | Client-side routing |
| Framer Motion | ^12.34.3 | Animations |
| TanStack React Query | ^5.83.0 | Server state management |
| Lucide React | ^0.462.0 | Icons |
| React Hook Form | ^7.61.1 | Form handling |
| Zod | ^3.25.76 | Schema validation |
| Recharts | ^2.15.4 | Charts (installed, not actively used) |
| date-fns | ^3.6.0 | Date utilities |

### Backend (Supabase / Lovable Cloud)
| Technology | Purpose |
|-----------|---------|
| Supabase PostgreSQL | Database |
| Supabase Auth | Staff authentication (email/password) |
| Supabase Storage | Document file storage |
| Supabase Edge Functions (Deno) | Server-side logic |
| Row Level Security (RLS) | Data access control |

### Build Configuration
| Tool | File |
|------|------|
| Vite config | `vite.config.ts` |
| TypeScript config | `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` |
| Tailwind config | `tailwind.config.ts` |
| PostCSS | `postcss.config.js` |
| ESLint | `eslint.config.js` |
| Vitest | `vitest.config.ts` |

### All Dependencies (package.json)
```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@supabase/supabase-js": "^2.98.0",
    "@tanstack/react-query": "^5.83.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "framer-motion": "^12.34.3",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-resizable-panels": "^2.1.9",
    "react-router-dom": "^6.30.1",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@tailwindcss/typography": "^0.5.16",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^22.16.5",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.32.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "jsdom": "^20.0.3",
    "lovable-tagger": "^1.1.13",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.38.0",
    "vite": "^5.4.19",
    "vitest": "^3.2.4"
  }
}
```

---

## 3. Architecture

### Folder Structure
```
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── postcss.config.js
├── eslint.config.js
├── vitest.config.ts
├── components.json                    # shadcn/ui config
├── public/
│   ├── favicon.ico
│   ├── favicon.png
│   ├── apple-touch-icon.png
│   ├── robots.txt
│   ├── placeholder.svg
│   └── lovable-uploads/
│       ├── 7a75dc81-...png            # Header logo (staff pages)
│       └── d5f2960e-...png            # Header logo (public pages)
├── src/
│   ├── main.tsx                       # Entry point
│   ├── App.tsx                        # Router + providers
│   ├── App.css                        # Legacy CSS (unused)
│   ├── index.css                      # Tailwind + design tokens
│   ├── vite-env.d.ts
│   ├── assets/
│   │   ├── logo-fundacion-azteca.png
│   │   └── logos-faz-plantel.png      # Landing/Login logo
│   ├── components/
│   │   ├── AppLayout.tsx              # Staff layout wrapper
│   │   ├── NavLink.tsx                # Router NavLink wrapper
│   │   ├── StatusBadge.tsx            # Solicitud status badge
│   │   └── ui/                        # shadcn/ui components (30+ files)
│   ├── contexts/
│   │   └── AuthContext.tsx            # Auth state (login/logout/role)
│   ├── hooks/
│   │   ├── use-mobile.tsx             # Mobile breakpoint hook
│   │   └── use-toast.ts              # Toast notifications
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts             # Auto-generated Supabase client
│   │       └── types.ts             # Auto-generated DB types
│   ├── lib/
│   │   ├── audit.ts                  # Audit trail + primera lectura
│   │   ├── solicitudes.ts            # CRUD helpers for solicitudes
│   │   └── utils.ts                  # cn() utility
│   ├── pages/
│   │   ├── LandingPage.tsx           # Public landing (/ route)
│   │   ├── NuevaSolicitudPage.tsx    # Public form (/nueva-solicitud)
│   │   ├── LoginPage.tsx             # Staff login (/login)
│   │   ├── RevisorPage.tsx           # Reviewer dashboard
│   │   ├── EnlacePage.tsx            # Liaison dashboard
│   │   ├── DireccionPage.tsx         # Director dashboard
│   │   ├── ComitePage.tsx            # Committee dashboard
│   │   ├── AuditorPage.tsx           # Auditor SLA table
│   │   └── NotFound.tsx              # 404 page
│   └── test/
│       ├── setup.ts
│       └── example.test.ts
└── supabase/
    ├── config.toml                    # Supabase local config
    └── functions/
        ├── get-enlace-user/index.ts   # Maps nivel+turno to enlace user ID
        └── seed-users/index.ts        # Seeds staff auth users + roles
```

### Component Hierarchy
```
App
├── QueryClientProvider (TanStack)
├── TooltipProvider
├── Toaster + Sonner
├── AuthProvider (context)
└── BrowserRouter
    └── AppRoutes
        ├── / → LandingPage (public)
        ├── /nueva-solicitud → NuevaSolicitudPage (public)
        │   └── PublicLayout (inline component)
        ├── /login → LoginPage (public, redirects if authenticated)
        ├── /revisor/pendientes → ProtectedRoute → RevisorPage
        │   └── AppLayout
        ├── /enlace/pendientes → ProtectedRoute → EnlacePage
        │   └── AppLayout
        ├── /direccion/panel → ProtectedRoute → DireccionPage
        │   └── AppLayout
        ├── /comite/panel → ProtectedRoute → ComitePage
        │   └── AppLayout
        ├── /auditor/panel → ProtectedRoute → AuditorPage
        │   └── AppLayout
        └── * → NotFound
```

### State Management
- **Auth State**: React Context (`AuthContext`) — stores user, role, login/logout
- **Server State**: Direct Supabase SDK calls with `useState` + `useEffect` (no React Query usage in page components)
- **Form State**: Local `useState` in `NuevaSolicitudPage`
- **UI State**: Local `useState` per page (selected item, loading, acting, comments)

### Routing Structure
| Route | Component | Auth | Roles |
|-------|-----------|------|-------|
| `/` | LandingPage | Public | — |
| `/nueva-solicitud` | NuevaSolicitudPage | Public | — |
| `/login` | LoginPage | Public | Redirects if logged in |
| `/revisor/pendientes` | RevisorPage | Protected | revisor, auditor |
| `/enlace/pendientes` | EnlacePage | Protected | enlace, auditor |
| `/direccion/panel` | DireccionPage | Protected | direccion, auditor |
| `/comite/panel` | ComitePage | Protected | comite, auditor |
| `/auditor/panel` | AuditorPage | Protected | auditor |

---

## 4. Full Source Code

### Entry Point: `src/main.tsx`
```tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### Router & Providers: `src/App.tsx`
```tsx
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
      <Route path="/revisor/pendientes" element={<ProtectedRoute allowedRoles={["revisor", "auditor"]}><RevisorPage /></ProtectedRoute>} />
      <Route path="/enlace/pendientes" element={<ProtectedRoute allowedRoles={["enlace", "auditor"]}><EnlacePage /></ProtectedRoute>} />
      <Route path="/direccion/panel" element={<ProtectedRoute allowedRoles={["direccion", "auditor"]}><DireccionPage /></ProtectedRoute>} />
      <Route path="/comite/panel" element={<ProtectedRoute allowedRoles={["comite", "auditor"]}><ComitePage /></ProtectedRoute>} />
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
```

### Auth Context: `src/contexts/AuthContext.tsx`
```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupaUser } from "@supabase/supabase-js";

export type UserRole = "revisor" | "enlace" | "direccion" | "comite" | "auditor";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchRole(userId: string): Promise<UserRole | null> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.role as UserRole) ?? null;
}

async function buildUser(su: SupaUser): Promise<User | null> {
  const role = await fetchRole(su.id);
  if (!role) return null;
  return { id: su.id, email: su.email ?? "", role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = await buildUser(session.user);
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = await buildUser(session.user);
        setUser(u);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
```

### Layout: `src/components/AppLayout.tsx`
```tsx
import React from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ClipboardCheck, ShieldCheck, Link2, Users, Eye } from "lucide-react";

const ROLE_LABELS: Record<UserRole, string> = {
  revisor: "Revisor de Documentación",
  enlace: "Enlace de Nivel",
  direccion: "Dirección Operativa",
  comite: "Comité",
  auditor: "Auditor"
};

const NAV_ITEMS: Record<UserRole, {path: string; label: string; icon: React.ElementType;}[]> = {
  revisor: [{ path: "/revisor/pendientes", label: "Solicitudes Pendientes", icon: ClipboardCheck }],
  enlace: [{ path: "/enlace/pendientes", label: "Solicitudes Asignadas", icon: Link2 }],
  direccion: [{ path: "/direccion/panel", label: "Panel de Solicitudes", icon: ShieldCheck }],
  comite: [{ path: "/comite/panel", label: "Casos para Comité", icon: Users }],
  auditor: [
    { path: "/auditor/panel", label: "Panel de Auditoría", icon: Eye },
    { path: "/revisor/pendientes", label: "Vista Revisor", icon: ClipboardCheck },
    { path: "/enlace/pendientes", label: "Vista Enlace", icon: Link2 },
    { path: "/direccion/panel", label: "Vista Dirección", icon: ShieldCheck },
    { path: "/comite/panel", label: "Vista Comité", icon: Users }
  ]
};

// Renders header with logo, user info, logout button + nav tabs + footer
```

### Solicitudes Library: `src/lib/solicitudes.ts`
```typescript
import { supabase } from "@/integrations/supabase/client";

export type SolicitudRow = {
  id: string;
  folio: string;
  alumno_nombre: string;
  matricula: string;
  grupo: string;
  nivel: string;
  turno: string;
  tutor_nombre: string;
  tutor_telefono: string;
  tutor_email: string;
  aportacion_actual: number;
  aportacion_propuesta: number;
  motivo: string;
  motivo_detalle: string;
  tiene_adeudo: boolean;
  monto_adeudo: number | null;
  status: string;
  enlace_asignado: string | null;
  comentarios_revisor: string | null;
  comentarios_enlace: string | null;
  comentarios_direccion: string | null;
  fecha_recepcion: string | null;
  fecha_validacion: string | null;
  fecha_enlace: string | null;
  fecha_direccion: string | null;
  fecha_resolucion: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentoRow = {
  id: string;
  solicitud_id: string;
  nombre: string;
  tipo: string;
  file_path: string;
  uploaded_at: string;
};

export async function fetchSolicitudes(statusIn?: string[]): Promise<SolicitudRow[]> {
  let q = supabase.from("solicitudes").select("*").order("created_at", { ascending: false });
  if (statusIn && statusIn.length > 0) q = q.in("status", statusIn);
  const { data, error } = await q;
  if (error) throw error;
  return data as SolicitudRow[];
}

export async function fetchSolicitudesForEnlace(userId: string): Promise<SolicitudRow[]> {
  const { data, error } = await supabase
    .from("solicitudes").select("*")
    .eq("status", "enviada_enlace")
    .eq("enlace_asignado", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as SolicitudRow[];
}

export async function fetchDocumentos(solicitudId: string): Promise<DocumentoRow[]> {
  const { data, error } = await supabase
    .from("documentos").select("*")
    .eq("solicitud_id", solicitudId)
    .order("uploaded_at");
  if (error) throw error;
  return data as DocumentoRow[];
}

export async function getDocumentUrl(filePath: string): Promise<string> {
  const { data } = await supabase.storage.from("documentos").createSignedUrl(filePath, 3600);
  return data?.signedUrl ?? "";
}

export async function updateSolicitudStatus(
  id: string, status: string, extras: Record<string, any> = {}
): Promise<void> {
  const { error } = await supabase.from("solicitudes").update({ status, ...extras }).eq("id", id);
  if (error) throw error;
}

// Enlace mapping (also in edge function)
const ENLACE_EMAILS: Record<string, string> = {
  "Bachillerato_Matutino": "ruben.carbajal@fundacionazteca.org",
  "Bachillerato_Vespertino": "ruben.carbajal@fundacionazteca.org",
  "Secundaria_Matutino": "claudia.cruz@fundacionazteca.org",
  "Secundaria_Vespertino": "maria.lopez@fundacionazteca.org",
};
```

### Audit Library: `src/lib/audit.ts`
```typescript
import { supabase } from "@/integrations/supabase/client";

export async function logAuditEvent(
  solicitudId: string, action: string, userEmail?: string, userRole?: string
) {
  const deviceName = navigator.userAgent;
  let ipAddress = "unknown";
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    ipAddress = data.ip;
  } catch { /* ignore */ }

  await supabase.from("audit_trail").insert({
    solicitud_id: solicitudId,
    action,
    user_email: userEmail ?? null,
    user_role: userRole ?? null,
    device_name: deviceName,
    ip_address: ipAddress,
  } as any);
}

export async function markPrimeraLectura(
  solicitudId: string,
  field: "revisor_primera_lectura" | "enlace_primera_lectura" | "direccion_primera_lectura" | "comite_primera_lectura"
) {
  const { data } = await supabase.from("solicitudes").select(field).eq("id", solicitudId).single();
  if (data && !(data as any)[field]) {
    await supabase.from("solicitudes")
      .update({ [field]: new Date().toISOString() } as any)
      .eq("id", solicitudId);
  }
}
```

### StatusBadge: `src/components/StatusBadge.tsx`
```tsx
export type SolicitudStatus =
  | "pendiente_revision" | "en_revision" | "enviada_enlace"
  | "enviada_direccion" | "enviada_comite" | "aprobada" | "rechazada";

const STATUS_CONFIG: Record<SolicitudStatus, { label: string; className: string }> = {
  pendiente_revision: { label: "Pendiente de Revisión", className: "bg-brand-yellow/15 text-brand-yellow border-brand-yellow/30" },
  en_revision: { label: "En Revisión", className: "bg-accent/15 text-accent border-accent/30" },
  enviada_enlace: { label: "Enviada a Enlace", className: "bg-primary/15 text-primary border-primary/30" },
  enviada_direccion: { label: "Enviada a Dirección", className: "bg-primary/15 text-primary border-primary/30" },
  enviada_comite: { label: "Enviada a Comité", className: "bg-brand-yellow/15 text-brand-yellow border-brand-yellow/30" },
  aprobada: { label: "Aprobada", className: "bg-success/15 text-success border-success/30" },
  rechazada: { label: "Rechazada", className: "bg-destructive/15 text-destructive border-destructive/30" },
};
```

### Environment Variables
```env
VITE_SUPABASE_PROJECT_ID="<your-project-id>"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-anon-key>"
VITE_SUPABASE_URL="https://<your-project-id>.supabase.co"
```

---

## 5. Database & Backend

### Database Schema

#### Table: `solicitudes`
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| folio | text | NO | 'PENDING' | Auto-generated by trigger: SOL-YYYY-NNNN |
| alumno_nombre | text | NO | — | |
| matricula | text | NO | — | 8-digit student ID |
| grupo | text | NO | — | 3-4 digit group |
| nivel | text | NO | — | CHECK: Secundaria, Bachillerato |
| turno | text | NO | — | CHECK: Matutino, Vespertino |
| tutor_nombre | text | NO | — | |
| tutor_telefono | text | NO | — | |
| tutor_email | text | NO | — | |
| aportacion_actual | numeric | NO | — | Current tuition |
| aportacion_propuesta | numeric | NO | — | Requested tuition |
| motivo | text | NO | — | CHECK: desempleo, separacion, defuncion, otro |
| motivo_detalle | text | NO | — | Free-text explanation |
| tiene_adeudo | boolean | NO | false | Has outstanding debt? |
| monto_adeudo | numeric | YES | 0 | Debt amount |
| status | text | NO | 'pendiente_revision' | CHECK: 7 values (see below) |
| enlace_asignado | uuid | YES | — | FK → auth.users(id) |
| comentarios_revisor | text | YES | '' | |
| comentarios_enlace | text | YES | '' | |
| comentarios_direccion | text | YES | '' | |
| fecha_recepcion | timestamptz | YES | now() | |
| fecha_validacion | timestamptz | YES | — | |
| fecha_enlace | timestamptz | YES | — | |
| fecha_direccion | timestamptz | YES | — | |
| fecha_resolucion | timestamptz | YES | — | |
| revisor_primera_lectura | timestamptz | YES | — | SLA tracking |
| enlace_primera_lectura | timestamptz | YES | — | SLA tracking |
| direccion_primera_lectura | timestamptz | YES | — | SLA tracking |
| comite_primera_lectura | timestamptz | YES | — | SLA tracking |
| created_at | timestamptz | NO | now() | |
| updated_at | timestamptz | NO | now() | Auto-updated by trigger |

**Status values:** `pendiente_revision`, `en_revision`, `enviada_enlace`, `enviada_direccion`, `enviada_comite`, `aprobada`, `rechazada`

**Constraints:**
- UNIQUE (folio)
- FK enlace_asignado → auth.users(id)
- CHECK constraints on nivel, turno, motivo, status

#### Table: `documentos`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| solicitud_id | uuid | NO | — (FK → solicitudes.id CASCADE) |
| nombre | text | NO | — |
| tipo | text | NO | 'comprobatorio' |
| file_path | text | NO | — |
| uploaded_at | timestamptz | NO | now() |

#### Table: `audit_trail`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| solicitud_id | uuid | NO | — (FK → solicitudes.id CASCADE) |
| action | text | NO | — |
| user_email | text | YES | — |
| user_role | text | YES | — |
| device_name | text | YES | — |
| ip_address | text | YES | — |
| created_at | timestamptz | NO | now() |

#### Table: `user_roles`
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | NO | — (FK → auth.users(id) CASCADE) |
| role | app_role (enum) | NO | — |

**Enum `app_role`:** `revisor`, `enlace`, `direccion`, `comite`, `auditor`

### Database Functions
```sql
-- Auto-generate folio: SOL-YYYY-NNNN
CREATE OR REPLACE FUNCTION public.generate_folio()
  RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$
DECLARE seq INT;
BEGIN
  SELECT COUNT(*) + 1 INTO seq FROM public.solicitudes;
  NEW.folio := 'SOL-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(seq::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Role checker (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
  RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
```

### Triggers
```sql
-- Generate folio before insert
CREATE TRIGGER set_folio BEFORE INSERT ON public.solicitudes
  FOR EACH ROW EXECUTE FUNCTION public.generate_folio();

CREATE TRIGGER generate_folio_trigger BEFORE INSERT ON public.solicitudes
  FOR EACH ROW EXECUTE FUNCTION public.generate_folio();

-- Auto-update updated_at
CREATE TRIGGER update_solicitudes_updated_at BEFORE UPDATE ON public.solicitudes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### RLS Policies

#### solicitudes
| Policy | Command | Roles | Condition |
|--------|---------|-------|-----------|
| allow_insert_solicitudes | INSERT | anon, authenticated | WITH CHECK (true) |
| Staff can read all solicitudes | SELECT | authenticated | has_role() for revisor/enlace/direccion/comite |
| Auditor can read all solicitudes | SELECT | public | has_role() for auditor |
| Staff can update solicitudes | UPDATE | authenticated | has_role() for revisor/enlace/direccion/comite |

#### documentos
| Policy | Command | Roles | Condition |
|--------|---------|-------|-----------|
| allow_insert_documentos | INSERT | anon, authenticated | WITH CHECK (true) |
| Staff can read documentos | SELECT | authenticated | has_role() for revisor/enlace/direccion/comite |
| Auditor can read documentos | SELECT | public | has_role() for auditor |

#### audit_trail
| Policy | Command | Roles | Condition |
|--------|---------|-------|-----------|
| allow_insert_audit_trail | INSERT | anon, authenticated | WITH CHECK (true) |
| Staff can read audit_trail | SELECT | public | has_role() for all staff roles |

#### user_roles
| Policy | Command | Roles | Condition |
|--------|---------|-------|-----------|
| Users can read own role | SELECT | authenticated | auth.uid() = user_id |

### Storage
- **Bucket:** `documentos` (private)
- Storage policies allow `anon` and `authenticated` to INSERT objects where `bucket_id = 'documentos'`
- Staff can SELECT objects from the bucket

### Edge Functions

#### `get-enlace-user`
Maps `nivel` + `turno` to the corresponding Enlace user by looking up their email in auth.users.

```typescript
// Maps: Bachillerato_Matutino → ruben.carbajal@fundacionazteca.org
//        Bachillerato_Vespertino → ruben.carbajal@fundacionazteca.org
//        Secundaria_Matutino → claudia.cruz@fundacionazteca.org
//        Secundaria_Vespertino → maria.lopez@fundacionazteca.org
// Returns: { user_id, email }
```

#### `seed-users`
Creates staff auth users with pre-defined credentials and assigns roles:
| Email | Role |
|-------|------|
| fernando.barreto@fundacionazteca.org | revisor |
| ruben.carbajal@fundacionazteca.org | enlace |
| claudia.cruz@fundacionazteca.org | enlace |
| maria.lopez@fundacionazteca.org | enlace |
| juan.sanchez@fundacionazteca.org | direccion |
| coral.perez@fundacionazteca.org | comite |
| manuel.carbajal@fundacionazteca.org | auditor |

### Auth Configuration
- Email/password authentication for staff users
- No anonymous sign-ups
- Public form uses `anon` Supabase key (no auth required for INSERT)

### Required Secrets (Edge Functions)
| Secret | Purpose |
|--------|---------|
| SUPABASE_URL | Database connection |
| SUPABASE_SERVICE_ROLE_KEY | Admin operations in edge functions |
| SUPABASE_ANON_KEY | Public client key |

---

## 6. UI Screenshots

### Landing Page (`/`)
The main entry point with two buttons: "Nueva Solicitud" (public form) and "Acceso Personal Autorizado" (staff login). Centered card on blue background with institutional logos.

### New Request Form (`/nueva-solicitud`)
Multi-section form with: Student Data, Tutor Data, Contribution amounts, Debt info, Reason selection (cards), Free-text document upload, Supporting documents upload (camera + file picker). Submit button at bottom.

### Login Page (`/login`)
Simple email/password form centered on blue background. Shows error message on invalid credentials.

### Staff Pages (require login)
All staff pages use `AppLayout` with:
- Blue header bar with logo, user email, role label, logout button
- Navigation tabs below header
- Master-detail layout: list on left, detail panel on right
- Action buttons (Approve/Reject/Forward) at bottom of detail

**Revisor:** Shows pending requests, can send to Enlace or reject  
**Enlace:** Shows assigned requests, can send to Dirección or reject  
**Dirección:** Dashboard with stats (pending/approved/rejected counts), filter tabs, can approve/reject/send to Comité  
**Comité:** Shows escalated cases, can approve or reject with resolution text  
**Auditor:** Full table view with SLA tracking columns (primera lectura + action timestamps) per role, color-coded for SLA compliance

---

## 7. User Flows

### Flow 1: Parent Submits Request (Public)
1. Parent navigates to `/` on shared kiosk iPad
2. Taps "Nueva Solicitud"
3. Fills form: student info, tutor info, contribution amounts, reason, detailed explanation
4. Optionally uploads "Escrito Libre" (formal letter) via camera or file
5. Optionally uploads supporting documents (multiple) via camera or file
6. Taps "Enviar Solicitud"
7. System creates `solicitudes` row (status: `pendiente_revision`), uploads files to storage, creates `documentos` rows, logs audit event
8. Success screen shown with "Nueva Solicitud" button to reset

### Flow 2: Reviewer Validates Request
1. Reviewer logs in at `/login`
2. Redirected to `/revisor/pendientes`
3. Sees list of pending requests (status: `pendiente_revision`, `en_revision`)
4. Clicks request → detail panel opens, status auto-changes to `en_revision`, primera_lectura timestamp set
5. Reviews documents (clickable to open signed URLs)
6. Adds comments
7. Either "Enviar a Enlace" (calls edge function to find enlace user by nivel+turno) or "Rechazar"

### Flow 3: Enlace Reviews Request
1. Enlace logs in → redirected to `/enlace/pendientes`
2. Sees only requests assigned to them (status: `enviada_enlace`, `enlace_asignado` = their user ID)
3. Reviews details, documents, reviewer comments
4. Either "Enviar a Dirección" or "Rechazar"

### Flow 4: Director Resolves Request
1. Director logs in → redirected to `/direccion/panel`
2. Dashboard shows stats: pending / approved / rejected counts
3. Filter between "Por Resolver" and "Resueltas"
4. Can: Approve, Reject, or Escalate to Comité

### Flow 5: Committee Final Decision
1. Committee member logs in → `/comite/panel`
2. Sees only escalated cases (status: `enviada_comite`)
3. Reviews all previous comments from reviewer, enlace, dirección
4. Documents viewable and downloadable
5. Final decision: Approve or Reject

### Flow 6: Auditor Monitors SLA
1. Auditor logs in → `/auditor/panel`
2. Full table with all requests showing timestamps for each role's primera_lectura and action
3. Color-coded cells: green = within SLA, red = overdue
4. Can also view all other role pages in read-only mode

### Form Validations
- **Submission window:** Only first 5 days of each month (with override for specific test dates)
- **Matrícula:** 8 digits only (numeric input filter)
- **Grupo:** 3-4 digits only
- **Nivel:** Must be "Secundaria" or "Bachillerato"
- **Turno:** Must be "Matutino" or "Vespertino"
- **Motivo:** Must be one of: desempleo, separacion, defuncion, otro
- **All required fields** must be filled before submit button enables

### Business Rules
- Folio auto-generated as `SOL-YYYY-NNNN` via database trigger
- Enlace assignment is automatic based on nivel+turno mapping
- Primera lectura timestamps are set only once (first view)
- Auditor SLA rules:
  - Revisor: green if acted within first 10 days of month
  - Enlace/Dirección: green if acted within 5 days of receiving

---

## 8. Integrations & APIs

### External APIs
| API | Purpose | Called From |
|-----|---------|------------|
| https://api.ipify.org?format=json | Get client IP for audit trail | `src/lib/audit.ts` |

### Supabase SDK Usage
- **Auth:** `signInWithPassword`, `signOut`, `getSession`, `onAuthStateChange`
- **Database:** `.from().select()`, `.insert()`, `.update()`, `.eq()`, `.in()`, `.order()`
- **Storage:** `.from("documentos").upload()`, `.createSignedUrl()`
- **Edge Functions:** `.functions.invoke("get-enlace-user")`
- **RPC:** `.rpc("has_role")` (used in RLS policies, not directly from client)

---

## 9. Design System

### Fonts
- **Heading:** Fira Sans (Google Fonts)
- **Body:** Nunito (Google Fonts)

### Color Palette (HSL values in CSS custom properties)
```css
--primary: 205 100% 34%;          /* Deep blue */
--primary-foreground: 0 0% 100%;  /* White */
--secondary: 46 100% 50%;         /* Gold/yellow */
--accent: 197 100% 44%;           /* Bright blue */
--destructive: 5 85% 56%;         /* Red */
--success: 85 65% 51%;            /* Green */
--brand-green: 160 100% 29%;
--brand-red: 3 85% 56%;
--brand-yellow: 46 100% 50%;
--brand-dark-red: 350 55% 30%;
--background: 210 20% 98%;        /* Off-white */
--foreground: 210 30% 12%;        /* Near-black */
--muted: 210 20% 94%;
--card: 0 0% 100%;                /* White */
```

### Custom Utilities
```css
.touch-target { min-height: 52px; min-width: 52px; }  /* iPad-optimized touch targets */
```

---

## 10. Known Issues & TODOs

1. **`getEnlaceUserId()` in solicitudes.ts** returns `null` — the client-side function is a stub, actual mapping happens via the `get-enlace-user` edge function
2. **Duplicate trigger:** Both `set_folio` and `generate_folio_trigger` exist on solicitudes — should consolidate to one
3. **`App.css`** contains unused Vite boilerplate CSS — can be removed
4. **Recharts** is installed but not used in any component
5. **Several shadcn/ui components** are installed but not used (accordion, carousel, menubar, etc.)
6. **Folio generation** uses `COUNT(*) + 1` which is not concurrent-safe — could produce duplicates under simultaneous inserts
7. **No password reset flow** — staff must contact admin
8. **No email notifications** — all status changes are silent
9. **Submission window override** has hardcoded dates (Feb 27-28, 2026) for testing
10. **`enlace_asignado` FK** references auth.users directly — should reference a profiles table instead per best practices

---

## 11. Reconstruction Notes for Another Platform

### Steps to Rebuild
1. Create a new React + Vite + TypeScript project
2. Install all dependencies from package.json
3. Set up Tailwind CSS with the custom design tokens from `index.css` and `tailwind.config.ts`
4. Install shadcn/ui components (see `components.json` for config)
5. Set up Supabase project:
   a. Create all 4 tables with exact schema above
   b. Create the `app_role` enum
   c. Create all 3 functions (generate_folio, update_updated_at_column, has_role)
   d. Create triggers
   e. Set up RLS policies exactly as documented
   f. Create the `documentos` storage bucket
   g. Set up storage policies
6. Deploy edge functions (get-enlace-user, seed-users)
7. Run seed-users to create staff accounts
8. Copy all source code files
9. Set environment variables

### Critical Configuration
- Supabase client must use the anon/publishable key (not service role)
- Edge functions need SUPABASE_SERVICE_ROLE_KEY for admin operations
- The `has_role` function MUST be SECURITY DEFINER to work in RLS policies
- Storage bucket `documentos` must be private with INSERT policies for anon
- GRANT SELECT, INSERT, UPDATE to both `anon` and `authenticated` on public tables
