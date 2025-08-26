import { HD_CatalogoServicio } from "./hd_catalogoServicio";
import { HD_DerivacionTicket } from "./hd_derivacionTicket";
import { HD_Subarea } from "./hd_subarea";
import { HD_Ticket } from "./hd_ticket";
import { HD_UsuarioArea } from "./hd_usuarioArea";

export interface HD_Area {
  id: number;
  nombre: string;
  abreviado: string;

  subarea?: HD_Subarea[];
  usuarioArea?: HD_UsuarioArea[];
  catalogoServicio?: HD_CatalogoServicio[];
  derivadoDesde?: HD_DerivacionTicket[];
  derivadoHacia?: HD_DerivacionTicket[];
  ticket?: HD_Ticket[];
}
