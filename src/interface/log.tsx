import { Usuario } from "./usuario";

export interface LogAuditoria {
  id: number;
  accion: string;

  entidad: string;
  entidad_id: number;

  usuario_id: number;
  usuario?: Usuario;

  createdAt?: string;
}
