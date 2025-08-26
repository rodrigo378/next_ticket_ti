import { HD_SLA } from "./hd_sla";
import { HD_Ticket } from "./hd_ticket";

export interface HD_PrioridadTicket {
  id: number;
  nombre: string;
  tickets?: HD_Ticket[];
  slas?: HD_SLA[];
}
