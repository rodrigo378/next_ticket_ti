import { HD_CalificacionTicket } from "../hd/hd_calificacionTicket";
import { HD_DerivacionTicket } from "../hd/hd_derivacionTicket";
import { HD_HorarioUsuario } from "../hd/hd_horarioUsuario";
import { HD_MensajeTicket } from "../hd/hd_mensajeTicket";
import { HD_Ticket } from "../hd/hd_ticket";
import { HD_UsuarioArea } from "../hd/hd_usuarioArea";
import { Core_LogAuditoria } from "./core_log";
import { Core_Permiso } from "./core_permiso";
import { Core_Rol } from "./core_rol";
import { Core_UsuarioModulo } from "./core_usuarioModulo";

export interface Core_Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  grado: string;
  estado: string;

  rol_id: number;
  rol?: Core_Rol;

  azure_oid?: string | null; // unique (nullable en BD)
  email: string; // unique
  lastLoginAt?: string | null; // ISO datetime

  perfil_global?: Record<string, unknown> | null;

  createdAt: string; // ISO
  updatedAt: string; // ISO

  // Relaciones (opcionales)
  permisos?: Core_Permiso[];
  logs?: Core_LogAuditoria[];
  // HD (help desk)
  hdTicketsCreados?: HD_Ticket[];
  hdTicketsAsignados?: HD_Ticket[];
  hdMensajesEmitidos?: HD_MensajeTicket[];
  hdUsuarioAreas?: HD_UsuarioArea[];
  hdCalificaciones?: HD_CalificacionTicket[];
  usuarioModulo?: Core_UsuarioModulo[];
  hd_derivacionTicket?: HD_DerivacionTicket[];
  HD_HorarioUsuario?: HD_HorarioUsuario[];
}
