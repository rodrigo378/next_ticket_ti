import { Item } from "./item";
import { Usuario } from "./usuario";

export interface Permiso {
  id: number;
  usuario_id: number;
  item_id: number;
  estado: string;
  usuario?: Usuario;
  item?: Item;
}

export interface PermisoLayout {
  item: {
    codigo: string;
    modulo: {
      codigo: string;
    };
  };
}
