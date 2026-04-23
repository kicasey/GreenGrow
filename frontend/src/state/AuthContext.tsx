import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthedUser } from "../types";

interface AuthState {
  current: AuthedUser | null;
  setCurrent: (u: AuthedUser | null) => void;
  updateCurrent: (patch: Partial<AuthedUser>) => void;
  logout: () => void;
  isEmployee: boolean;
  isCustomer: boolean;
}

const STORAGE_KEY = "greengrow.auth";

const AuthContext = createContext<AuthState | null>(null);

function readStored(): AuthedUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthedUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrentState] = useState<AuthedUser | null>(() => readStored());

  function setCurrent(u: AuthedUser | null) {
    setCurrentState(u);
  }

  useEffect(() => {
    try {
      if (current) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore quota / private mode errors */
    }
  }, [current]);

  const value = useMemo<AuthState>(
    () => ({
      current,
      setCurrent,
      updateCurrent: (patch) =>
        setCurrentState((prev) => (prev ? { ...prev, ...patch } : prev)),
      logout: () => setCurrentState(null),
      isEmployee: current?.kind === "employee",
      isCustomer: current?.kind === "user",
    }),
    [current]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
