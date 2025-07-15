export interface Area {
  id: number;
  nombre: string;
}

export interface UsuarioArea {
  usuario_id: number;
  area_id: number;
  area: Area;
}
