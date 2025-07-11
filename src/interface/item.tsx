import { Modulo } from "./modulo";

export interface Item {
  id: number;
  modulo_id: number;
  nombre: string;
  codigo: string;

  modulo: Modulo;
}
