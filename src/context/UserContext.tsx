"use client";

import { Core_Usuario } from "@/interface/core/core_usuario";
import { getMe } from "@/services/core/usuario";
import { usePathname, useRouter } from "next/navigation"; // 👈 importa router
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

type UserContextType = {
  usuario: Core_Usuario | null;
  setUsuario: (user: Core_Usuario | null) => void;
  ready: boolean;
  refreshUsuario: () => Promise<void>;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);
const PUBLIC_ROUTES = ["/login"];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Core_Usuario | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter(); // 👈

  const loginRedirect = useCallback(() => {
    if (typeof window === "undefined") return;
    // evita bucles si ya estás en /login
    if (window.location.pathname === "/login") return;
    // 👇 client-side navigation: no hay full reload ni FOUC
    router.replace("/login");
  }, [router]);

  const refreshUsuario = useCallback(async () => {
    const u = await getMe();
    console.log("funcion getMe => ", u);
    setUsuario(u);
  }, []);

  const logout = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    setUsuario(null);
    loginRedirect(); // 👈 ya usa router.replace
  }, [loginRedirect]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) Captura ?token=... y limpia la URL (también returnTo)
    const url = new URL(window.location.href);
    const tokenFromUrl = url.searchParams.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      url.searchParams.delete("token");
      url.searchParams.delete("returnTo"); // 👈 limpia también esto
      const qs = url.searchParams.toString();
      window.history.replaceState({}, "", url.pathname + (qs ? `?${qs}` : ""));
    }

    // 2) Si no hay token
    const token = localStorage.getItem("token");
    if (!token) {
      setUsuario(null);
      setReady(true);
      if (!PUBLIC_ROUTES.includes(pathname)) {
        loginRedirect(); // 👈 navegación sin recarga
      }
      return;
    }

    // 3) Si hay token, intenta cargar /me
    let cancelled = false;
    (async () => {
      try {
        const u = await getMe();
        if (!cancelled) setUsuario(u);
      } catch {
        localStorage.removeItem("token");
        if (!cancelled) setUsuario(null);
        // opcional: loginRedirect();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, loginRedirect]);

  const value = useMemo(
    () => ({ usuario, setUsuario, ready, refreshUsuario, logout }),
    [usuario, ready, refreshUsuario, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsuario = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUsuario debe usarse dentro del UserProvider");
  return ctx;
};
