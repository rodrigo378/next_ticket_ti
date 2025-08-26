"use client";

import { Core_Usuario } from "@/interface/core/core_usuario";
import { getMe } from "@/services/auth";
import { useRouter, usePathname } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type UserContextType = {
  usuario: Core_Usuario | null;
  setUsuario: (user: Core_Usuario | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Core_Usuario | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ⚠️ Evita redirigir si ya estás en /login
    if (pathname === "/login") return;

    const token = localStorage.getItem("token");

    if (token) {
      getMe()
        .then((usuario) => {
          console.log("✅ Usuario obtenido:", usuario);
          setUsuario(usuario);
        })
        .catch((error) => {
          console.warn("⚠️ Error al obtener usuario:", error);
          localStorage.removeItem("token");
          setUsuario(null);
          // router.push("/login");
        });
    } else {
      console.log("⛔ No hay token, redirigiendo a login");
      // router.push("/login");
    }
  }, [router, pathname]);

  const value = useMemo(() => {
    return { usuario, setUsuario };
  }, [usuario]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUsuario = () => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUsuario debe usarse dentro del UserProvider");
  return context;
};
