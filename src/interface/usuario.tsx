import { Area } from "./area";
import { Rol } from "./rol";

export interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  grado: string;
  genero: string;
  email: string;
  area_id: number;
  createdAt: string;
  updatedAt: string;
  estado: "A" | "I";
  roles: UsuarioRol[];
  area: Area;
}

export interface UsuarioRol {
  usuario_id: number;
  rol_id: number;
  rol: Rol;
}

export interface SignIn {
  email: string;
  password: string;
}

export interface CreateUsuario {
  email: string;
  password: string;
  nombre: string;
  estado: "A" | "I";
  area_id: number;
  apellidos: string;
  grado: string;
  genero: string;
}

export interface UpdateUsuario {
  password?: string;
  nombre?: string;
  apellidos?: string;
  grado?: string;
  genero?: string;
  estado?: string;
  area_id?: number;
}
