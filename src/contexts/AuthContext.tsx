import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { centralSupabase } from "@/integrations/supabase/centralClient";
import type { User as SupaUser } from "@supabase/supabase-js";

export type UserRole = "revisor" | "enlace" | "direccion" | "comite";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  /** true para master_tic: puede actuar en todas las vistas (revisor, enlace, dirección, comité) */
  isMaster: boolean;
  fullName: string;
  status: "active" | "pending";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Map central profile roles → local app roles */
function mapCentralRole(centralRole: string): UserRole | null {
  switch (centralRole) {
    case "master_tic":
    case "direccion":
      return "direccion";
    case "tic":
      return "revisor";
    case "enlace":
      return "enlace";
    case "coordinador":
      return "enlace";
    default:
      return null;
  }
}

async function buildUser(su: SupaUser): Promise<User | null> {
  const { data: profile } = await centralSupabase
    .from("profiles")
    .select("role, status, full_name, plantel_id")
    .eq("id", su.id)
    .maybeSingle();

  if (!profile) return null;

  const appRole = mapCentralRole(profile.role);
  if (!appRole) return null;

  return {
    id: su.id,
    email: su.email ?? "",
    role: appRole,
    isMaster: profile.role === "master_tic",
    fullName: profile.full_name ?? "",
    status: profile.status ?? "pending",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const sync = async (session: { user: SupaUser } | null) => {
      try {
        const u = session?.user ? await buildUser(session.user) : null;
        if (active) setUser(u);
      } catch (e) {
        console.error("Error cargando el perfil:", e);
        if (active) setUser(null);
      }
      if (active) setLoading(false);
    };

    // IMPORTANTE: no hacer await de llamadas a Supabase dentro del callback de
    // onAuthStateChange (bloquea el lock de la sesión y deja la página colgada o
    // mandando al login al recargar). Se difiere con setTimeout.
    const {
      data: { subscription },
    } = centralSupabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        sync(session);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await centralSupabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  };

  const logout = async () => {
    await centralSupabase.auth.signOut();
    setUser(null);
    window.location.href = "https://plantelazteca.org";
  };

  const isAuthenticated = !!user && user.status === "active";

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
