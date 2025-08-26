import { HD_Incidencia } from "./hd_incidencia";
import { HD_SLA } from "./hd_sla";
import { HD_Subarea } from "./hd_subarea";
import { HD_Ticket } from "./hd_ticket";

export interface HD_Categoria {
  id: number;
  nombre: string;

  incidencia_id: number;
  incidencia?: HD_Incidencia;

  subarea_id: number;
  subarea?: HD_Subarea;

  sla?: HD_SLA[];
  ticket?: HD_Ticket[];
}
