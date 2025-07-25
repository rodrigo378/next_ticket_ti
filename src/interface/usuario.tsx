import { Subarea, UsuarioArea } from "./area";
import { Rol } from "./rol";

export enum Genero {
  MASCULINO = "masculino",
  FEMENINO = "femenino",
}

export interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  grado: string;
  genero: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  estado: "A" | "I";

  subarea_id: number;
  subarea: Subarea;

  rol_id: number;
  rol: Rol;

  UsuarioArea: UsuarioArea[];
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
  genero: Genero;
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
