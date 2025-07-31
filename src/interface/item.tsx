import { Modulo } from "./modulo";
import { Permiso } from "./permisos";

export interface Item {
  id: number;
  modulo_id: number;
  modulo?: Modulo;
  nombre: string;
  codigo: string;
  permisos?: Permiso[];
}
