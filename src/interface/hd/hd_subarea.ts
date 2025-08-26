import { HD_Area } from "./hd_area";
import { HD_Categoria } from "./hd_categoria";

export interface HD_Subarea {
  id: number;
  nombre: string;

  area_id: number;
  area?: HD_Area;

  categoria?: HD_Categoria[];
}
