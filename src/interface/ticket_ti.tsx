import { EstadoTicket } from "./estado";
import { Categoria } from "./incidencia";
import { MensajeTicket } from "./mensaje";
import { PrioridadTicket } from "./prioridad";
import { SLATicket } from "./sla";
import { Usuario } from "./usuario";

export interface DocumentoTicket {
  id: number;
  ticket_id: number;
  ticket?: Ticket;
  nombre: string;
  url: string;
  createdAt?: string;
}
export interface SlaTicket {
  id: number;
  ticket_id: number;
  sla_id: number;
  tiempo_estimado_respuesta: Date;
  tiempo_estimado_resolucion: Date;
  cumplido: boolean;
}

export interface Ticket {
  id: number;
  codigo: string;
  descripcion: string;
  correo_id?: string;
  prioridad_id: number;
  prioridad?: PrioridadTicket;
  estado_id: number;
  estado?: EstadoTicket;
  creado_id: number;
  creado?: Usuario;
  asignado_id?: number;
  asignado?: Usuario;
  categoria_id: number;
  categoria?: Categoria;
  createdAt?: string;
  updatedAt?: string;
  documentos?: DocumentoTicket[];
  mensajes?: MensajeTicket[];
  slaTicket?: SLATicket;
}
