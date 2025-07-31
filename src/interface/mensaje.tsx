import { Ticket } from "./ticket_ti";
import { Usuario } from "./usuario";

export interface MensajeTicket {
  id: number;
  contenido?: string;
  tipo?: string;
  nombre?: string;
  url?: string;
  ticket_id: number;
  ticket?: Ticket;
  emisor_id: number;
  emisor?: Usuario;
  createdAt?: string;
}
