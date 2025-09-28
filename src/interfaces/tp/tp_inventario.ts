import { TP_AtencionDetalle } from "./tp_atencionDetalle";
import { TP_InventarioLote } from "./tp_inventarioLote";

export interface TP_Inventario {
  id: number;
  codigo: string;
  codigoBarras?: string | null;
  nombre: string;
  categoria?: string | null;
  unidadBase?: string | null;
  esPerecible: boolean;
  stockGlobal: number;
  stockMinimo?: number | null;
  ubicacion?: string | null;
  activo: boolean;

  createdAt?: Date | null;
  updatedAt?: Date | null;

  detalles?: TP_AtencionDetalle[];
  TP_InventarioLote?: TP_InventarioLote[];
}
