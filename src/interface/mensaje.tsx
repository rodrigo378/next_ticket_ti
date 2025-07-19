import { Usuario } from "./usuario";

export interface Mensaje {
  id: number;
  ticket_id: number;
  contenido?: string;
  tipo?: string; // 'imagen', 'archivo', etc.
  nombre?: string; // nombre del archivo
  url?: string; // ruta del archivo
  emisor_id: number;
  createdAt: string;
  emisor: Partial<Usuario>;
}
