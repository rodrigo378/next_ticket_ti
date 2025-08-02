import { Modulo } from "./modulo";
import { Permiso } from "./permisos";

export interface Item {
  id: number;
  nombre: string;
  codigo: string;

  modulo_id: number;
  modulo?: Modulo;

  permisos?: Permiso[];
}
