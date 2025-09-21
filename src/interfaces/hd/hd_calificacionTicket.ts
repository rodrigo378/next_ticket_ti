import { Core_Usuario } from "../core/core_usuario";
import { HD_Ticket } from "./hd_ticket";

export interface HD_CalificacionTicket {
  id: number;

  ticket_id: number; // unique
  ticket?: HD_Ticket;

  usuario_id: number;
  usuario?: Core_Usuario;

  calificacion: number;
  comentario?: string | null;

  createdAt: string; // ISO
}
