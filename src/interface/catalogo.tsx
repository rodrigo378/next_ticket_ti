import { Area } from "./area";

export interface CatalogoServicio {
  id: number;
  nombre: string;
  area_id: number;
  area?: Area;
  incidencias?: Incidencia[];
}
