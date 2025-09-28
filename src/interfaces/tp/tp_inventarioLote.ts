import { TP_AtencionDetalle } from "./tp_atencionDetalle";
import { TP_Inventario } from "./tp_inventario";
import { TP_Ubicacion } from "./tp_ubicacion";

export interface TP_InventarioLote {
  id: number;

  inventario_id: number;
  inventario?: TP_Inventario;

  codigoLote: string;
  codigoBarras?: string | null;
  fechaVencimiento?: Date | null;
  cantidad: number;
  estado: string;

  ubicacion_id?: number | null;
  ubicacion?: TP_Ubicacion | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;

  TP_AtencionDetalle?: TP_AtencionDetalle[];
}
