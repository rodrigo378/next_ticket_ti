import { Usuario } from "./usuario";

export interface LogAuditoria {
  id: number;
  entidad: string;
  entidad_id: number;
  accion: string;
  usuario_id: number;
  usuario?: Usuario;
  createdAt?: string;
}
