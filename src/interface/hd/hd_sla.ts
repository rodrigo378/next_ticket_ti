import { HD_Categoria } from "./hd_categoria";
import { HD_PrioridadTicket } from "./hd_prioridadTicket";
import { HD_SLATicket } from "./hd_slaTicket";

export interface HD_SLA {
  id: number;

  tiempo_respuesta: number;
  tiempo_resolucion: number;

  categoria_id: number;
  categoria?: HD_Categoria;

  prioridad_id: number;
  prioridad?: HD_PrioridadTicket;

  slaTickets?: HD_SLATicket[];

  // @@unique([categoria_id, prioridad_id]) a nivel BD
}
