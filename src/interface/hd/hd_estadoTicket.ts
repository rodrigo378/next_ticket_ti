import { HD_Ticket } from "./hd_ticket";

export interface HD_EstadoTicket {
  id: number;
  codigo: string; // unique
  nombre: string;
  tickets?: HD_Ticket[];
}
