import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { centralSupabase } from "@/integrations/supabase/centralClient";
import type { User as SupaUser } from "@supabase/supabase-js";

export type UserRole = "revisor" | "enlace" | "direccion" | "comite";

export interface User {
  id: string;
  email: string;
  role: UserRole;
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
    fullName: profile.full_name ?? "",
    status: profile.status ?? "pending",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = centralSupabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = await buildUser(session.user);
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    centralSupabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = await buildUser(session.user);
        setUser(u);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
