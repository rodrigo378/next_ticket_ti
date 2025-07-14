import { Area } from "./area";

export interface Categoria {
  id: number;
  nombre: string;
  incidencia_id: number;
}
export interface Incidencia {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  area_id: number;
  area: Area;
  categorias: Categoria[];
}
