import { Ticket } from "@/interface/ticket_ti";
import { api } from "./api";
import { AxiosResponse } from "axios";
import { CalificacionTicket } from "@/interface/calificacion";

export const createTicketTi = async (formData: FormData): Promise<unknown> => {
  const token = localStorage.getItem("token");

  const response = await api.post("/ticket", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // 👇 NO pongas Content-Type aquí. Axios lo pone automáticamente con boundary
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getTickets = async (filtros?: {
  me?: string;
  estados_id?: string[];
}): Promise<Ticket[]> => {
  const token = localStorage.getItem("token");
  // const params = new URLSearchParams();

  // if (filtros.me) params.append("me", filtros.me);
  // if (filtros.estado_id) params.append("estado_id", filtros.estado_id);

  const response: AxiosResponse<Ticket[]> = await api.get(`/ticket`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: filtros,
    paramsSerializer: {
      indexes: null, // <- IMPORTANTE para que Axios genere estados_id=1&estados_id=2
    },
  });
  return response.data;
};

export const getTicketsMe = async (): Promise<Ticket[]> => {
  const token = localStorage.getItem("token");

  const response = await api.get("/ticket/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getTicket = async (ticket_id: number): Promise<Ticket> => {
  const response: AxiosResponse<Ticket> = await api.get(`/ticket/${ticket_id}`);

  return response.data;
};

export const createMensaje = async (data: {
  ticket_id: number;
  contenido: string;
}) => {
  const token = localStorage.getItem("token");
  const response = await api.post("/ticket/mensaje", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const derivarTicket = async (
  ticket_id: number,
  data: { a_area_id: number; nueva_categoria_id: number; motivo: string }
) => {
  const token = localStorage.getItem("token");
  const response = await api.post(`/ticket/derivar/${ticket_id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const asignarTicket = async (
  ticket_id: number,
  data: Partial<Ticket>
) => {
  const response = await api.put(`/ticket/asignar/${ticket_id}`, data);
  return response.data;
};

export const createCalificacion = async (data: Partial<CalificacionTicket>) => {
  const token = localStorage.getItem("token");
  const response = await api.post("/ticket/calificacion", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const cambiarEstado = async (
  ticket_id: number,
  data: { estado_id: number }
) => {
  const response = await api.put(`/ticket/estado/${ticket_id}`, data);
  return response.data;
};
