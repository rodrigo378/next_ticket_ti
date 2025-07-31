import { SLA, Ticket } from "./interfaces";

export interface PrioridadTicket {
  id: number;
  nombre: string;
  tickets?: Ticket[];
  slas?: SLA[];
}
