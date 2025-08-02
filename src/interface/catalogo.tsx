import { Area } from "./area";
import { Incidencia } from "./incidencia";

export interface CatalogoServicio {
  id: number;
  nombre: string;

  area_id: number;
  area?: Area;

  incidencias?: Incidencia[];
}
