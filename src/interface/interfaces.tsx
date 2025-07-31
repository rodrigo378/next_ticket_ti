import { Categoria } from "./incidencia";
import { PrioridadTicket } from "./prioridad";
import { Ticket } from "./ticket_ti";
import { Usuario } from "./usuario";

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

export interface LogAuditoria {
  id: number;
  entidad: string;
  entidad_id: number;
  accion: string;
  usuario_id: number;
  usuario?: Usuario;
  createdAt?: string;
}
