import { HD_CatalogoServicio } from "./hd_catalogoServicio";
import { HD_Categoria } from "./hd_categoria";

export enum TipoIncidenciaRequerimiento {
  incidencia = "incidencia",
  requerimiento = "requerimiento",
}

export interface HD_Incidencia {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: TipoIncidenciaRequerimiento;

  catalogo_servicio_id: number;
  catalogo_servicio?: HD_CatalogoServicio;

  categoria?: HD_Categoria[];
}
