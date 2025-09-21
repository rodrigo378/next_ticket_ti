import { HD_Ticket } from "./hd_ticket";

export interface HD_DocumentoTicket {
  id: number;
  ticket_id: number;
  ticket?: HD_Ticket;
  nombre: string;
  url: string;
  createdAt: string; // ISO
}
