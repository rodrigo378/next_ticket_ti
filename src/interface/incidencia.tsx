export interface Incidencia {
  id: number;
  nombre: string;
  descripcion: string;
  incidencia_area_id: number;
}

export interface IncidenciaArea {
  id: number;
  nombre: string;
  incidencias: Incidencia[];
}
