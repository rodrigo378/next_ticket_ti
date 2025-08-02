import { Ticket } from "./ticket_ti";

export interface EstadoTicket {
  id: number;
  nombre: string;
  tickets?: Ticket[];
}
