import { Ticket } from "./log";

export interface EstadoTicket {
  id: number;
  nombre: string;
  tickets?: Ticket[];
}
