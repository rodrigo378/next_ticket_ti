import { Core_Usuario } from "../core/core_usuario";
import { HD_Ticket } from "./hd_ticket";

export interface HD_MensajeTicket {
  id: number;
  contenido?: string | null;
  tipo?: string | null;
  nombre?: string | null;
  url?: string | null;

  ticket_id: number;
  ticket?: HD_Ticket;

  emisor_id: number;
  emisor?: Core_Usuario;

  createdAt: string; // ISO
}
