import { Core_Item } from "./core_item";
import { Core_Modulo } from "./core_modulo";

export interface Core_Submodulo {
  id: number;
  modulo_id: number;
  nombre: string;
  codigo: string;
  estado: string;
  modulo?: Core_Modulo;
  items?: Core_Item[];
}
