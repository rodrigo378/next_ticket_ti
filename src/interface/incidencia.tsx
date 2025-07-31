import { Subarea } from "./area";
import { CatalogoServicio } from "./catalogo";
import { SLA } from "./interfaces";
import { Ticket } from "./ticket_ti";
export enum TipoIncidenciaRequerimiento {
  incidencia = "incidencia",
  requerimiento = "requerimiento",
}

export interface Categoria {
  id: number;
  nombre: string;
  incidencia_id: number;
}
export interface Incidencia {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: TipoIncidenciaRequerimiento;
  catalogo_servicio_id: number;
  catalogo_servicio?: CatalogoServicio;
  subarea_id: number;
  subarea?: Subarea;
  tickets?: Ticket[];
  categoria?: Categoria[];
}

export interface Categoria {
  id: number;
  nombre: string;
  incidencia_id: number;
  incidencia?: Incidencia;
  SLA?: SLA[];
}
