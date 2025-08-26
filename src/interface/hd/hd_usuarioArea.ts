import { Core_Usuario } from "../core/core_usuario";
import { HD_Area } from "./hd_area";

export interface HD_UsuarioArea {
  usuario_id: number;
  usuario?: Core_Usuario;

  area_id: number;
  area?: HD_Area;
}
