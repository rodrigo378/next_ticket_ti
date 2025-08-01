import { SLA, Ticket } from "./log";

export interface PrioridadTicket {
  id: number;
  nombre: string;
  tickets?: Ticket[];
  slas?: SLA[];
}
