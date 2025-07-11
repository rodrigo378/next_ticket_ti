export interface Permiso {
  id: number;
  usuario_id: number;
  item_id: number;
  estado: string;
}

export interface PermisoLayout {
  item: {
    codigo: string;
    modulo: {
      codigo: string;
    };
  };
}
