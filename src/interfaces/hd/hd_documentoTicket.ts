import { Core_Archivo } from "../core/core_archivo";
import { HD_Ticket } from "./hd_ticket";

export interface HD_DocumentoTicket {
  id: number;

  ticket_id: number;
  ticket?: HD_Ticket;

  archivo_id: number;
  archivo: Core_Archivo;

  createdAt: string;
}
