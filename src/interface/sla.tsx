import { Categoria } from "./incidencia";
import { PrioridadTicket } from "./prioridad";
import { Ticket } from "./ticket_ti";

export interface SLATicket {
  id: number;
  ticket_id: number;
  sla_id: number;
  tiempo_estimado_respuesta: string;
  tiempo_estimado_resolucion: string;
  cumplido: boolean;
  ticket?: Ticket;
  sla?: SLA;
}

export interface SLA {
  id: number;
  tiempo_respuesta: number;
  tiempo_resolucion: number;
  categoria_id: number;
  categoria?: Categoria;
  prioridad_id: number;
  prioridad?: PrioridadTicket;
  slaTickets?: SLATicket[];
}

export interface UpdateSla {
  tiempo_respuesta: number;
  tiempo_resolucion: number;
}
