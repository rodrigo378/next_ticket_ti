import { Core_Item } from "./core_item";
import { Core_Usuario } from "./core_usuario";

export interface Core_Permiso {
  id: number;
  usuario_id: number;
  item_id: number;
  estado: string;
  usuario?: Core_Usuario;
  item?: Core_Item;
}
