// src/context/user.types.ts
import type { Core_Rol } from "@interfaces/core/core_rol";

// ===================================================================================
export type Area = { id: number; nombre: string; abreviado: string };

// ===================================================================================
export type HdExtras = { areas: Area[]; rooms: string[] };

// ===================================================================================
export type ModuleBase<P = unknown, E = unknown> = {
  code: string;
  name: string;
  icon?: string;
  role: string | null;
  perfil: P;
  extras?: E;
};

// ===================================================================================
export type HdModule = ModuleBase<unknown, HdExtras> & { code: "HD" };

// ===================================================================================
export type IamCtx = {
  user: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    rol: Core_Rol;
  };
  perfil_global: unknown;
  modules: ModuleBase[];
};

// ===================================================================================
export type UserContextValue = {
  usuario: IamCtx["user"] | null;
  iam: IamCtx | null;

  hd?: HdModule;
  modulesByCode: Record<string, ModuleBase | undefined>;

  isReadyApp: boolean;
  isReadyIam: boolean;
  isAuthenticated: boolean;

  refreshIam: () => Promise<void>;
  logout: () => Promise<void>;

  hasModule: (code: string) => boolean;
  hasRole: (code: string, roles: string | string[]) => boolean;
};
