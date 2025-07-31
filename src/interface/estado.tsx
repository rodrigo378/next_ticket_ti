import { Ticket } from "./interfaces";

export interface EstadoTicket {
  id: number;
  nombre: string;
  tickets?: Ticket[];
}
