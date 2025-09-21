import { HD_SLA } from "./hd_sla";
import { HD_Ticket } from "./hd_ticket";

export enum SlaEstado {
  ABIERTO = "ABIERTO",
  EN_PROCESO = "EN_PROCESO",
  RESUELTO = "RESUELTO",
  CERRADO = "CERRADO",
  DERIVADO = "DERIVADO",
}

export interface HD_SLATicket {
  id: number;
  tiempo_estimado_respuesta: Date; // ISO
  tiempo_estimado_resolucion?: Date | null; // ISO
  cumplido: boolean;

  ticket_id: number; // unique
  ticket?: HD_Ticket;

  estado: SlaEstado;

  sla_id: number;
  sla?: HD_SLA;
}
