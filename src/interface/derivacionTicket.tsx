import { Area } from "./area";
import { Categoria } from "./incidencia";
import { Ticket } from "./ticket_ti";
import { Usuario } from "./usuario";

export interface DerivacionTicket {
  id: number;

  ticket_id: number;
  ticket: Ticket;

  de_area_id: number;
  de_area: Area;

  a_area_id: number;
  a_area: Area;

  categoria_id: number;
  categoria: Categoria;

  nueva_categoria_id: number;
  nueva_cateogora: Categoria;

  usuario_id: number;
  usuario: Usuario;

  motivo: string;

  createdAt: Date;
}
