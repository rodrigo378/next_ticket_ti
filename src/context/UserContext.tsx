// src/context/UserContext.tsx
"use client";

import { Core_Rol } from "@/interface/core/core_rol";
import { getIamContext } from "@/services/core/iam";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  perfil: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extras?: any;
};
type HdModule = ModuleBase & { code: "HD"; extras: HdExtras };
type IamCtx = {
  user: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    rol: Core_Rol;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  perfil_global: any;
  modules: ModuleBase[];
};
/* ===================================== */

type UserContextType = {
  usuario: IamCtx["user"] | null;
  iam: IamCtx | null;
  hd?: HdModule;
  ready: boolean;
  readyIam: boolean;
  refreshIam: () => Promise<void>;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

/* ---------------- Loader con branding UMA ---------------- */
const Loader = () => {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        width: "100dvw",
        height: "100dvh",
        background:
          "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(244,245,247,1) 100%)",
      }}
    >
      <div
        role="status"
        aria-live="polite"
        aria-label="Verificando sesión"
        style={{
          width: 380,
          maxWidth: "92vw",
          padding: 24,
          borderRadius: 16,
          backgroundColor: "#fff",
          boxShadow:
            "0 1px 2px rgba(16,24,40,.04), 0 8px 24px rgba(16,24,40,.08)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 14,
          }}
        />
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#0F172A",
            marginBottom: 6,
            letterSpacing: 0.2,
          }}
        >
          Verificando sesión…
        </div>
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>
          Mesa de Ayuda UMA
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <Spin size="large" />
          <div
            style={{
              height: 6,
              background:
                "linear-gradient(90deg, #eef2f7 0%, #f5f7fb 50%, #eef2f7 100%)",
              borderRadius: 999,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              className="uma-shimmer"
              style={{
                position: "absolute",
                inset: 0,
                transform: "translateX(-100%)",
                background:
                  "linear-gradient(90deg, rgba(233,30,99,0) 0%, rgba(233,30,99,.15) 50%, rgba(233,30,99,0) 100%)",
                animation: "uma-slide 1.6s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        <div style={{ fontSize: 12, color: "#64748B", marginTop: 14 }}>
          Por favor, espera un momento…
        </div>
      </div>

      <style>{`
        @keyframes uma-slide {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .uma-shimmer { animation: none !important; }
        }
      `}</style>
    </div>
  );
};
/* --------------------------------------------------------- */

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [iam, setIam] = useState<IamCtx | null>(null);
  const [ready, setReady] = useState(false);
  const [readyIam, setReadyIam] = useState(false);

  const router = useRouter();

  const refreshIam = useCallback(async () => {
    setReadyIam(false);
    try {
      const ctx = await getIamContext(); // ← usa cookie HttpOnly (via axios withCredentials)
      setIam(ctx);
    } catch {
      // 401/403/etc → sin sesión
      setIam(null);
    } finally {
      setReadyIam(true);
    }
  }, []);

  const logout = useCallback(() => {
    (async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ""}/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch {}
      setIam(null);
      setReady(false);
      setReadyIam(false);
      router.replace("/login");
    })();
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshIam();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Si quieres refrescar al cambiar de ruta (opcional), incluye `pathname`:
  }, [refreshIam /* , pathname */]);

  const usuario = iam?.user ?? null;

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

  const FORCE_LOADER = false;

  return (
    <UserContext.Provider value={value}>
      {FORCE_LOADER ? <Loader /> : ready ? children : <Loader />}
    </UserContext.Provider>
  );
};

export const useUsuario = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUsuario debe usarse dentro del UserProvider");
  return ctx;
};
