import { TP_Atencion } from "./tp_atencion";
import { TP_Inventario } from "./tp_inventario";
import { TP_InventarioLote } from "./tp_inventarioLote";

export interface TP_AtencionDetalle {
  id: number;

  atencionId: number;
  atencion?: TP_Atencion;

  inventarioId: number;
  inventario?: TP_Inventario;

  lote_id?: number | null;
  lote?: TP_InventarioLote | null;

  cantidad: number;
  via?: string | null;
  observacion?: string | null;

  createdAt?: Date | null;
}
