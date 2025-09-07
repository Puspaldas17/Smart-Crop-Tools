import { useCallback, useEffect, useState } from "react";
import type { FarmerDTO } from "@shared/api";

const KEY = "farmer";

export function useAuth() {
  const [farmer, setFarmer] = useState<FarmerDTO | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setFarmer(JSON.parse(raw));
    } catch {}
  }, []);

  const login = useCallback((f: FarmerDTO) => {
    setFarmer(f);
    localStorage.setItem(KEY, JSON.stringify(f));
  }, []);

  const logout = useCallback(() => {
    setFarmer(null);
    localStorage.removeItem(KEY);
  }, []);

  return { farmer, login, logout };
}
