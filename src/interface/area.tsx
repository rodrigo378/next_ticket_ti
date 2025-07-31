import { CatalogoServicio } from "./catalogo";
import { Incidencia } from "./incidencia";
import { Usuario } from "./usuario";

export interface Area {
  id: number;
  nombre: string;
  Subarea?: Subarea[];
  UsuarioArea?: UsuarioArea[];
  CatalogoServicio?: CatalogoServicio[];
}

export interface Subarea {
  id: number;
  nombre: string;
  area_id: number;
  area?: Area;
  Usuario?: Usuario[];
  Incidencia?: Incidencia[];
}
export interface UsuarioArea {
  usuario_id: number;
  area_id: number;
  usuario?: Usuario;
  area?: Area;
}
