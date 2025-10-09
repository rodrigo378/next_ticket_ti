// src/context/UserContext.tsx
"use client";

import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import { Spin, message } from "antd";
import { useRouter } from "next/navigation";
import type { IamCtx, UserContextValue } from "./user.types";
import { useIamContextQuery, useLogoutMutation } from "./useIamQueries";

// ===================================================================================
function LoaderUMA() {
  // ===================================================================================
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
}

// ===================================================================================
const Ctx = createContext<UserContextValue | undefined>(undefined);

// ===================================================================================
export function UserProvider({ children }: { children: ReactNode }) {
  // ===================================================================================
  const router = useRouter();
  const iamQ = useIamContextQuery();
  const logoutMut = useLogoutMutation();

  const iam: IamCtx | null = iamQ.data ?? null;
  const usuario = iam?.user ?? null;

  // ===================================================================================
  const modulesByCode = useMemo(() => {
    const dict: Record<string, IamCtx["modules"][number] | undefined> = {};
    for (const m of iam?.modules ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyM = m as any;
      const code: string | undefined =
        anyM.code ?? anyM.codigo ?? anyM.key ?? anyM.slug ?? anyM.modulo;
      if (typeof code === "string" && code.length) dict[code] = m;
    }
    return dict;
  }, [iam]);

  // ===================================================================================
  const isReadyIam = !iamQ.isLoading && !iamQ.isFetching;
  const isAuthenticated = !!usuario;
  const isReadyApp = isReadyIam;

  // ===================================================================================
  const refreshIam = useCallback(async () => {
    await iamQ.refetch();
  }, [iamQ]);

  // ===================================================================================
  const logout = useCallback(async () => {
    try {
      await logoutMut.mutateAsync();
    } catch {
      // no bloquear UX si falla
    } finally {
      message.success("Sesión cerrada");
      router.replace("/login");
    }
  }, [logoutMut, router]);

  // ===================================================================================
  const hasModule = useCallback(
    (code: string) => !!modulesByCode[code],
    [modulesByCode]
  );

  // ===================================================================================
  const hasRole = useCallback(
    (code: string, roles: string | string[]) => {
      const m = modulesByCode[code];
      if (!m?.role) return false;
      const arr = Array.isArray(roles) ? roles : [roles];
      return arr.includes(m.role);
    },
    [modulesByCode]
  );

  // ===================================================================================
  const value = useMemo<UserContextValue>(
    () => ({
      usuario,
      iam,
      modulesByCode,
      isReadyApp,
      isReadyIam,
      isAuthenticated,
      refreshIam,
      logout,
      hasModule,
      hasRole,
    }),
    [
      usuario,
      iam,
      modulesByCode,
      isReadyApp,
      isReadyIam,
      isAuthenticated,
      refreshIam,
      logout,
      hasModule,
      hasRole,
    ]
  );

  // ===================================================================================
  if (!isReadyApp) return <LoaderUMA />;

  // ===================================================================================
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// ===================================================================================
export const useUsuario = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUsuario debe usarse dentro del UserProvider");
  return ctx;
};
