import { Core_Usuario } from "./core_usuario";

export interface Core_LogAuditoria {
  id: number;
  entidad: string; // ej: "HD_Ticket"
  entidad_id: number;
  accion: string;
  usuario_id: number;
  usuario?: Core_Usuario;
  createdAt: string; // ISO
}
