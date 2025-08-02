import { Subarea } from "./area";
import { CatalogoServicio } from "./catalogo";
import { SLA } from "./sla";
import { Ticket } from "./ticket_ti";

export enum TipoIncidenciaRequerimiento {
  incidencia = "incidencia",
  requerimiento = "requerimiento",
}

export interface Categoria {
  id: number;
  nombre: string;

  incidencia_id: number;
  incidencia?: Incidencia;

  subarea_id: number;
  subarea?: Subarea;

  SLA?: SLA[];
}
export interface Incidencia {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: TipoIncidenciaRequerimiento;

  catalogo_servicio_id: number;
  catalogo_servicio?: CatalogoServicio;

  tickets?: Ticket[];
  categoria?: Categoria[];
}
