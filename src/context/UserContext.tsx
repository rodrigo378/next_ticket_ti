"use client";

import { Usuario } from "@/interface/usuario";
import { getMe } from "@/services/auth";
import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type UserContextType = {
  usuario: Usuario | null;
  setUsuario: (user: Usuario | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe()
        .then((usuario) => setUsuario(usuario))
        .catch(() => {
          localStorage.removeItem("token");
          setUsuario(null);
          router.push("/login");
        });
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <UserContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsuario = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUsuario debe usarse dentro del provider");
  return context;
};
