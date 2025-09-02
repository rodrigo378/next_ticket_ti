export type DiaSemana =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO";

/** Entidad tal como la devuelve el backend */
export interface HD_HorarioUsuario {
  id: number;

  usuario_id: number;

  dia: DiaSemana;

  h_inicio: string;
  h_fin: string;

  activo: boolean;

  createdAt: string;
  updatedAt: string;
}
