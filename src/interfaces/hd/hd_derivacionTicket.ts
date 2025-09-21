import { Core_Usuario } from "../core/core_usuario";
import { HD_Area } from "./hd_area";
import { HD_Ticket } from "./hd_ticket";

export interface HD_DerivacionTicket {
  id: number;

  ticket_id: number;
  ticket?: HD_Ticket;

  nuevo_ticket_id: number;
  nuevo_ticket?: HD_Ticket;

  de_area_id: number;
  de_area?: HD_Area;

  a_area_id: number;
  a_area?: HD_Area;

  usuario_id: number;
  usuario?: Core_Usuario;

  motivo: string;
  createdAt: string; // ISO
}
