import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "solicitante" | "revisor" | "direccion";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<UserRole, User> = {
  solicitante: { id: "1", name: "María García López", role: "solicitante", email: "maria.garcia@ejemplo.com" },
  revisor: { id: "2", name: "Carlos Hernández", role: "revisor", email: "carlos.hernandez@plantelazteca.org" },
  direccion: { id: "3", name: "Lic. Ana Martínez", role: "direccion", email: "ana.martinez@fundacionazteca.org" },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (_email: string, _password: string, role: UserRole) => {
    setUser(MOCK_USERS[role]);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
