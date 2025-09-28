import { Core_Usuario } from "@/interfaces/core";
import { TP_Atencion } from "./tp_atencion";

export interface TP_Consentimiento {
  id: number;

  atencion_id: number;
  atencion?: TP_Atencion;

  usuario_id?: number | null;
  usuario?: Core_Usuario | null;

  nombre: string;
  apellidos: string;
  dni: string;

  autorizoOral: boolean;
  autorizoProc: boolean;
  autorizoTraslado: boolean;

  firmaDigital?: string | null;

  createdAt?: Date | null;
}
