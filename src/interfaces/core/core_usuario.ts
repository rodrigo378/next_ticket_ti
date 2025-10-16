import { HD_CalificacionTicket } from "../hd/hd_calificacionTicket";
import { HD_DerivacionTicket } from "../hd/hd_derivacionTicket";
import { HD_HorarioUsuario } from "../hd/hd_horarioUsuario";
import { HD_MensajeTicket } from "../hd/hd_mensajeTicket";
import { HD_Ticket } from "../hd/hd_ticket";
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

  azure_oid?: string | null;
  email: string;
  lastLoginAt?: string | null;

  perfil_global?: Record<string, unknown> | null;

  createdAt: string;
  updatedAt: string;

  permisos?: Core_Permiso[];
  logs?: Core_LogAuditoria[];

  Core_Permiso: Core_Permiso[];
  Core_LogAuditoria: Core_LogAuditoria[];
  Core_UsuarioModulo: Core_UsuarioModulo[];

  HD_TicketsTitular: HD_Ticket[];
  HD_TicketsRegistrados: HD_Ticket[];
  HD_TicketsAsignados: HD_Ticket[];
  HD_MensajesEmitidos: HD_MensajeTicket[];
  HD_Calificaciones: HD_CalificacionTicket[];
  HD_derivacionTicket: HD_DerivacionTicket[];
  HD_HorarioUsuario: HD_HorarioUsuario[];
}
