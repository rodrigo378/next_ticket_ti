export interface TicketTi {
  id?: number;
  titulo: string;
  descripcion: string;
  incidencia_id: number;
  prioridad_id: number;
  estado_id?: number;
  nivel?: number;
  creado_id?: number;
  asignado_id?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// {
//     "titulo": "titulo ticket",
//     "descripcion": "descripcion Ticket",
//     "incidencia_id": 1,
//     "prioridad_id": 1
// }
