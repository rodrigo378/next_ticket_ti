import { Item } from "./item";
import { Usuario } from "./usuario";

export interface Permiso {
  id: number;
  estado: string;

  usuario_id: number;
  usuario?: Usuario;

  item_id: number;
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
