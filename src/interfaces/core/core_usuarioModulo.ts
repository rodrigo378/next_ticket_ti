import { Core_Modulo } from "./core_modulo";
import { Core_Usuario } from "./core_usuario";

export interface Core_UsuarioModulo {
  usuario_id: number;
  modulo_id: number;
  rol?: string | null;
  perfil?: Record<string, unknown> | null;
  usuario?: Core_Usuario;
  modulo?: Core_Modulo;
}
