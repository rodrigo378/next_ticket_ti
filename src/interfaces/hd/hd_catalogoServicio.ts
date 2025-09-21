import { HD_Area } from "./hd_area";
import { HD_Incidencia } from "./hd_incidencia";

export interface HD_CatalogoServicio {
  id: number;
  nombre: string;

  area_id: number;
  area?: HD_Area;

  incidencias?: HD_Incidencia[];
}
