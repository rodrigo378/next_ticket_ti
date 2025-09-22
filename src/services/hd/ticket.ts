import { AxiosResponse } from "axios";
import { api } from "../api";
import { HD_Ticket, HD_CalificacionTicket } from "@interfaces/hd";

export const createTicket = async (formData: FormData): Promise<unknown> => {
  const response = await api.post("/hd/ticket", formData);
  return response.data;
};

export const getTickets = async (filtros?: {
  me?: string;
  estados_id?: string[];
}): Promise<HD_Ticket[]> => {
  const response: AxiosResponse<HD_Ticket[]> = await api.get(`/hd/ticket`, {
    params: filtros,
    paramsSerializer: {
      indexes: null,
    },
  });
  return response.data;
};

export const getTicketsMe = async (filtros?: {
  estados_id?: string[];
}): Promise<HD_Ticket[]> => {
  const response = await api.get("/hd/ticket/me", {
    params: filtros,
    paramsSerializer: { indexes: null },
  });
  return response.data;
};

export const getTicket = async (ticket_id: number): Promise<HD_Ticket> => {
  const response: AxiosResponse<HD_Ticket> = await api.get(
    `/hd/ticket/${ticket_id}`
  );

  return response.data;
};

export const createMensaje = async (data: {
  ticket_id: number;
  contenido: string;
}) => {
  const response = await api.post("/hd/ticket/mensaje", data);
  return response.data;
};

export const derivarTicket = async (
  ticket_id: number,
  data: { a_area_id: number; motivo: string }
) => {
  const response = await api.post(`/hd/ticket/derivar/${ticket_id}`, data);

  return response.data;
};

export const asignarTicket = async (
  ticket_id: number,
  data: { asignado_id: number; prioridad_id: number; categoria_id?: number }
) => {
  const response = await api.put(`/hd/ticket/asignar/${ticket_id}`, data);
  return response.data;
};

export const createCalificacion = async (
  data: Partial<HD_CalificacionTicket>
) => {
  const response = await api.post("/hd/ticket/calificacion", data);

  return response.data;
};

export const cambiarEstado = async (
  ticket_id: number,
  data: { estado_id: number }
) => {
  const response = await api.put(`/hd/ticket/estado/${ticket_id}`, data);
  return response.data;
};

export const getSoporte = async (area_id: number) => {
  const response = await api.get(`/hd/ticket/soporte/${area_id}`);
  return response.data;
};

export const createTicketEstudiante = async (
  formData: FormData
): Promise<unknown> => {
  const response = await api.post("/hd/ticket/est", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
