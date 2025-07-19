import { Incidencia } from "./incidencia";
import { Prioridad } from "./prioridad";

export interface Sla {
  id: number;

  incidencia_id: number;
  incidencia: Incidencia;

  prioridad_id: number;
  prioridad: Prioridad;

  tiempo_respuesta: number;
  tiempo_resolucion: number;
}

export interface UpdateSla {
  tiempo_respuesta: number;
  tiempo_resolucion: number;
}
