import { Core_Item } from "./core_item";
import { Core_Submodulo } from "./core_submodulo";
import { Core_UsuarioModulo } from "./core_usuarioModulo";

export interface Core_Modulo {
  id: number;
  nombre: string;
  codigo: string; // unique
  estado: string; // 'A' | 'I' (según tu convención)
  items?: Core_Item[];
  Submodulo?: Core_Submodulo[];
  UsuarioModulo?: Core_UsuarioModulo[];
}
