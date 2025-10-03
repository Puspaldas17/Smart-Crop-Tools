import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { FarmerDTO } from "@shared/api";

const KEY = "farmer";

type AuthContextType = {
  farmer: FarmerDTO | null;
  login: (f: FarmerDTO) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [farmer, setFarmer] = useState<FarmerDTO | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFarmer(JSON.parse(raw));
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        try {
          setFarmer(e.newValue ? (JSON.parse(e.newValue) as FarmerDTO) : null);
        } catch {
          setFarmer(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback((f: FarmerDTO) => {
    setFarmer(f);
    localStorage.setItem(KEY, JSON.stringify(f));
  }, []);

  const logout = useCallback(() => {
    setFarmer(null);
    localStorage.removeItem(KEY);
  }, []);

  const value = useMemo(() => ({ farmer, login, logout }), [farmer, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    const parsed = raw ? (JSON.parse(raw) as FarmerDTO) : null;
    const noop = () => {};
    return { farmer: parsed, login: noop, logout: noop };
  }
  return ctx;
}
