import { Area } from "./area";
import { Ticket } from "./ticket_ti";
import { Usuario } from "./usuario";

export interface DerivacionTicket {
  id: number;

  ticket_id: number;
  ticket: Ticket;

  nuevo_ticket_id: number;
  nuevo_ticket: Ticket;

  de_area_id: number;
  de_area: Area;

  a_area_id: number;
  a_area: Area;

  usuario_id: number;
  usuario: Usuario;

  motivo: string;

  createdAt: Date;
}
