import { Estado } from "./estado";
import { Categoria, Incidencia } from "./incidencia";
import { Prioridad } from "./prioridad";
import { Usuario } from "./usuario";

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
}
