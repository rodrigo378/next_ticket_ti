import { Categoria } from "./incidencia";
import { PrioridadTicket } from "./prioridad";

export interface Sla {
  id: number;

  categoria_id: number;
  categoria: Categoria;

  prioridad_id: number;
  prioridad: PrioridadTicket;

  tiempo_respuesta: number;
  tiempo_resolucion: number;
}

export interface UpdateSla {
  tiempo_respuesta: number;
  tiempo_resolucion: number;
}
