import { Item } from "./item";

export interface Modulo {
  id: number;
  nombre: string;
  codigo: string;
  estado: string;
  items?: Item[];
}
