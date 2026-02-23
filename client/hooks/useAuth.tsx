import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { FarmerDTO } from "@shared/api";

const FARMER_KEY = "agriverse_farmer";
const TOKEN_KEY = "agriverse_token";

type AuthContextType = {
  farmer: FarmerDTO | null;
  token: string | null;
  login: (f: FarmerDTO, token?: string) => void;
  logout: () => void;
  authHeaders: () => Record<string, string>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [farmer, setFarmer] = useState<FarmerDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FARMER_KEY);
      if (raw) setFarmer(JSON.parse(raw));
      const t = localStorage.getItem(TOKEN_KEY);
      if (t) setToken(t);
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key === FARMER_KEY) {
        try { setFarmer(e.newValue ? JSON.parse(e.newValue) : null); }
        catch { setFarmer(null); }
      }
      if (e.key === TOKEN_KEY) {
        setToken(e.newValue || null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback((f: FarmerDTO, t?: string) => {
    setFarmer(f);
    localStorage.setItem(FARMER_KEY, JSON.stringify(f));
    if (t) {
      setToken(t);
      localStorage.setItem(TOKEN_KEY, t);
    }
  }, []);

  const logout = useCallback(() => {
    setFarmer(null);
    setToken(null);
    localStorage.removeItem(FARMER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  /** Returns Authorization header if token exists */
  const authHeaders = useCallback((): Record<string, string> => {
    const t = localStorage.getItem(TOKEN_KEY);
    return t ? { Authorization: `Bearer ${t}` } : {};
  }, []);

  const value = useMemo(
    () => ({ farmer, token, login, logout, authHeaders }),
    [farmer, token, login, logout, authHeaders],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    const raw = typeof window !== "undefined" ? localStorage.getItem(FARMER_KEY) : null;
    const tok = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    const parsed = raw ? (JSON.parse(raw) as FarmerDTO) : null;
    const noop = () => {};
    const authHeaders = () => tok ? { Authorization: `Bearer ${tok}` } : {};
    return { farmer: parsed, token: tok, login: noop as any, logout: noop, authHeaders };
  }
  return ctx;
}
