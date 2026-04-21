import { createContext, useContext, useMemo, useState } from "react";
import type { AuthedUser } from "../types";

interface AuthState {
  current: AuthedUser | null;
  setCurrent: (u: AuthedUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<AuthedUser | null>(null);

  const value = useMemo<AuthState>(
    () => ({ current, setCurrent, logout: () => setCurrent(null) }),
    [current]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
