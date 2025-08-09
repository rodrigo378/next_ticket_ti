import { Area } from "./area";
import { CalificacionTicket } from "./calificacion";
import { DerivacionTicket } from "./derivacionTicket";
import { EstadoTicket } from "./estado";
import { Categoria } from "./incidencia";
import { MensajeTicket } from "./mensaje";
import { PrioridadTicket } from "./prioridad";
import { SLATicket } from "./sla";

import { Usuario } from "./usuario";

export interface DocumentoTicket {
  id: number;
  nombre: string;
  url: string;
  createdAt?: string;

  ticket_id: number;
  ticket?: Ticket;
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

  area_id?: number;
  area?: Area;

  categoria_id: number;
  categoria?: Categoria;

  createdAt?: string;
  updatedAt?: string;

  documentos?: DocumentoTicket[];
  mensajes?: MensajeTicket[];
  slaTicket?: SLATicket;
  DerivacionTicket: DerivacionTicket[];
  CalificacionTicket: CalificacionTicket;
}
