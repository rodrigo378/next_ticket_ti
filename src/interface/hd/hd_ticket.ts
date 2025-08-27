import { Core_Usuario } from "../core/core_usuario";
import { HD_Area } from "./hd_area";
import { HD_CalificacionTicket } from "./hd_calificacionTicket";
import { HD_Categoria } from "./hd_categoria";
import { HD_DerivacionTicket } from "./hd_derivacionTicket";
import { HD_DocumentoTicket } from "./hd_documentoTicket";
import { HD_EstadoTicket } from "./hd_estadoTicket";
import { HD_MensajeTicket } from "./hd_mensajeTicket";
import { HD_PrioridadTicket } from "./hd_prioridadTicket";
import { HD_SLATicket } from "./hd_slaTicket";

export interface HD_Ticket {
  id: number;

  codigo: string;
  descripcion: string;
  correo_id?: string | null;

  prioridad_id?: number | null;
  prioridad?: HD_PrioridadTicket | null;

  estado_id: number;
  estado?: HD_EstadoTicket;

  creado_id: number;
  creado?: Core_Usuario;

  asignado_id?: number | null;
  asignado?: Core_Usuario | null;

  area_id: number;
  area?: HD_Area;

  categoria_id?: number | null;
  categoria?: HD_Categoria | null;

  createdAt: Date; // ISO
  asignadoAt?: Date | null;
  respondidoAt?: Date | null;
  finalizadoAt?: Date | null;

  documentos?: HD_DocumentoTicket[];
  mensajes?: HD_MensajeTicket[];
  slaTicket?: HD_SLATicket | null;
  calificacionTicket?: HD_CalificacionTicket | null;

  derivacionesComoOrigen?: HD_DerivacionTicket[];
  derivacionesComoDestino?: HD_DerivacionTicket[];
}
