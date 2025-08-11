import { Subarea, UsuarioArea } from "./area";
import { CalificacionTicket } from "./calificacion";
import { DerivacionTicket } from "./derivacionTicket";
import { LogAuditoria } from "./log";
import { MensajeTicket } from "./mensaje";
import { Permiso } from "./permisos";
import { Rol } from "./rol";
import { Ticket } from "./ticket_ti";

export enum Generos {
  MASCULINO = "masculino",
  FEMENINO = "femenino",
}

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  grado: string;
  genero: Generos;
  email: string;
  password: string;
  estado: string;

  rol_id: number;
  rol?: Rol;

  subarea_id?: number;
  subarea?: Subarea;

  createdAt?: string;
  updatedAt?: string;

  permisos?: Permiso[];
  ticketsCreados?: Ticket[];
  ticketsAsignados?: Ticket[];
  mensajesEmitidos?: MensajeTicket[];
  logs?: LogAuditoria[];
  UsuarioArea?: UsuarioArea[];
  DerivacionTicket: DerivacionTicket[];
  CalificacionTicket: CalificacionTicket[];
}

export interface SignIn {
  email: string;
  password: string;
}

export interface CreateUsuario {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  grado: string;
  genero: Generos;
  estado: string;
  rol_id: number;
  subarea_id?: number;
  areas_id?: number[];
}

export interface UpdateUsuario {
  password?: string;
  nombre?: string;
  apellidos?: string;
  grado?: string;
  genero?: "masculino" | "femenino";
  estado?: string;
  rol_id?: number;
  subarea_id?: number;
  areas_id?: number[];
}
