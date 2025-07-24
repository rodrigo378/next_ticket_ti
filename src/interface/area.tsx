export interface Area {
  id: number;
  nombre: string;
  Subarea: Subarea[];
}

export interface Subarea {
  id: number;
  nombre: string;
  area_id: number;
  area: Area;
}

export interface UsuarioArea {
  usuario_id: number;
  area_id: number;
  area: Area;
}
