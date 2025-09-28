import { TP_InventarioLote } from "./tp_inventarioLote";

export interface TP_Ubicacion {
  id: number;
  nombre: string;
  descripcion?: string | null;
  direccion?: string | null;
  tipo?: string | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;

  TP_InventarioLote?: TP_InventarioLote[];
}
