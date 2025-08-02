import { SLA } from "./sla";
import { Ticket } from "./ticket_ti";

export interface PrioridadTicket {
  id: number;
  nombre: string;
  tickets?: Ticket[];
  slas?: SLA[];
}
