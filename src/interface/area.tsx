import { CatalogoServicio } from "./catalogo";
import { DerivacionTicket } from "./derivacionTicket";
import { Incidencia } from "./incidencia";
import { Ticket } from "./ticket_ti";
import { Usuario } from "./usuario";

export interface Area {
  id: number;
  nombre: string;

  Subarea?: Subarea[];
  UsuarioArea?: UsuarioArea[];
  CatalogoServicio?: CatalogoServicio[];
  DerivadoDesde: DerivacionTicket[];
  DerivadoHacia: DerivacionTicket[];
  Ticket: Ticket[];
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
  usuario?: Usuario;

  area_id: number;
  area?: Area;
}
