import { Core_Modulo } from "./core_modulo";
import { Core_Permiso } from "./core_permiso";
import { Core_Submodulo } from "./core_submodulo";

export interface Core_Item {
  id: number;
  modulo_id: number;
  submodulo_id?: number | null;
  nombre: string;
  codigo: string;
  estado: string;
  modulo?: Core_Modulo;
  submodulo?: Core_Submodulo | null;
  permisos?: Core_Permiso[];
  config: Record<string, unknown>; // Json
}
