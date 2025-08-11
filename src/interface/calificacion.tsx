import { Ticket } from "./ticket_ti";
import { Usuario } from "./usuario";

export interface CalificacionTicket {
  id: number;

  ticket_id: number;
  ticket: Ticket;

  usuario_id: number;
  usuario: Usuario;

  calificacion: number;
  comentario?: string;

  createdAt: Date;
}
