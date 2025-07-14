import { Incidencia } from "./incidencia";
import { Prioridad } from "./prioridad";

export interface Sla {
  id: number;
  incidencia_id: number;
  prioridad_id: number;
  tiempo_respuesta: number;
  tiempo_resolucion: number;
  incidencia: Incidencia;
  prioridad: Prioridad;
}

export interface UpdateSla {
  tiempo_respuesta: number;
  tiempo_resolucion: number;
}
