export {
  getArea,
  getAreas,
  getSubareas,
  createHorario,
  updateHorario,
} from "./area";

export { getCatalogo, createCatalogo } from "./catalogo";

export { getEstados } from "./estado";

export { createHorarioUsuario, updateHorarioUsuario } from "./horario_usuario";

export {
  getIncidencias,
  createIncidencia,
  createCategoria,
  updateCategoria,
  getArbol,
} from "./incidencias";

export { getPrioridades } from "./prioridad";

export { getSla, updateSla } from "./sla";

export {
  createTicket,
  getTickets,
  getTicketsMe,
  getTicket,
  createMensaje,
  derivarTicket,
  asignarTicket,
  createCalificacion,
  cambiarEstado,
  getSoporte,
  createTicketEstudiante,
} from "./ticket";
