import { Estado } from "./estado";
import { Categoria, Incidencia } from "./incidencia";
import { Mensaje } from "./mensaje";
import { Prioridad } from "./prioridad";
import { Usuario } from "./usuario";

export interface Documento {
  id: number;
  ticket_id: number;
  nombre: string;
  url: string;
  createdAt: Date;
}

export interface SlaTicket {
  id: number;
  ticket_id: number;
  sla_id: number;
  tiempo_estimado_respuesta: Date;
  tiempo_estimado_resolucion: Date;
  cumplido: boolean;
}

export interface TicketTi {
  id?: number;
  titulo: string;
  descripcion: string;

  incidencia_id: number;
  incidencia: Incidencia;

  categoria_id: number;
  categoria: Categoria;

  prioridad_id?: number;
  prioridad?: Prioridad;

  estado_id?: number;
  estado: Estado;

  creado_id?: number;
  creado: Usuario;

  asignado_id?: number | null;
  createdAt?: Date;
  updatedAt?: Date;

  documentos?: Documento[];

  mensajes: Mensaje[];
  slaTicket: SlaTicket;
}
