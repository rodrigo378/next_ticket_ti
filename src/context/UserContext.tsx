"use client";

import { getIamContext } from "@/services/core/iam";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

/* ===== Tipos para autocompletado ===== */
type Area = { id: number; nombre: string; abreviado: string };
type HdExtras = { areas: Area[]; rooms: string[] };
type ModuleBase = {
  code: string;
  name: string;
  icon: string;
  role: string | null;
  perfil: any;
  extras?: any;
};
type HdModule = ModuleBase & { code: "HD"; extras: HdExtras };
type IamCtx = {
  user: { id: number; nombre: string; apellidos: string; email: string };
  perfil_global: any;
  modules: ModuleBase[];
};
/* ===================================== */

type UserContextType = {
  /** identidad (derivada de iam.user) */
  usuario: IamCtx["user"] | null;
  /** IAM completo (perfil_global, módulos, extras, etc.) */
  iam: IamCtx | null;
  /** módulo HD resuelto (si existe) */
  hd?: HdModule;
  /** listo para navegar (auth) */
  ready: boolean;
  /** IAM cargado (áreas/rooms/roles) */
  readyIam: boolean;
  /** recargar IAM */
  refreshIam: () => Promise<void>;
  /** cerrar sesión */
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);
const PUBLIC_ROUTES = ["/login"];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [iam, setIam] = useState<IamCtx | null>(null);
  const [ready, setReady] = useState(false);
  const [readyIam, setReadyIam] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const loginRedirect = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname === "/login") return;
    router.replace("/login");
  }, [router]);

  const refreshIam = useCallback(async () => {
    setReadyIam(false);
    try {
      const ctx = await getIamContext();
      console.log("ctx => ", ctx);
      setIam(ctx);
    } finally {
      setReadyIam(true);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    setIam(null);
    setReady(false);
    setReadyIam(false);
    loginRedirect();
  }, [loginRedirect]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) Captura ?token=... y limpia la URL (SSO)
    const url = new URL(window.location.href);
    const tokenFromUrl = url.searchParams.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      url.searchParams.delete("token");
      url.searchParams.delete("returnTo");
      const qs = url.searchParams.toString();
      window.history.replaceState({}, "", url.pathname + (qs ? `?${qs}` : ""));
    }

    // 2) Si no hay token -> redirigir si ruta privada
    const token = localStorage.getItem("token");
    if (!token) {
      setIam(null);
      setReady(true);
      setReadyIam(false);
      if (!PUBLIC_ROUTES.includes(pathname)) loginRedirect();
      return;
    }

    // 3) Si hay token -> cargar SOLO IAM
    let cancelled = false;
    (async () => {
      try {
        await refreshIam();
      } catch {
        localStorage.removeItem("token");
        if (!cancelled) setIam(null);
        // opcional: loginRedirect();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, loginRedirect, refreshIam]);

  // Derivar usuario desde IAM (no hay estado separado)
  const usuario = iam?.user ?? null;

  // Resolver módulo HD ya tipado
  const hd = useMemo(() => {
    const mod = iam?.modules.find((m) => m.code === "HD");
    return mod ? ({ ...mod, code: "HD" } as HdModule) : undefined;
  }, [iam]);

  const value = useMemo<UserContextType>(
    () => ({
      usuario,
      iam,
      hd,
      ready,
      readyIam,
      refreshIam,
      logout,
    }),
    [usuario, iam, hd, ready, readyIam, refreshIam, logout]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsuario = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUsuario debe usarse dentro del UserProvider");
  return ctx;
};
