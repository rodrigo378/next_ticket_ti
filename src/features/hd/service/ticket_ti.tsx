import { AxiosResponse } from "axios";
import { api } from "../../../services/api";
import { HD_Ticket } from "@/interface/hd/hd_ticket";
import { HD_CalificacionTicket } from "@/interface/hd/hd_calificacionTicket";

export const createTicketTi = async (formData: FormData): Promise<unknown> => {
  const token = localStorage.getItem("token");

  const response = await api.post("/hd/ticket", formData, {
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
}): Promise<HD_Ticket[]> => {
  const token = localStorage.getItem("token");
  // const params = new URLSearchParams();

  // if (filtros.me) params.append("me", filtros.me);
  // if (filtros.estado_id) params.append("estado_id", filtros.estado_id);

  const response: AxiosResponse<HD_Ticket[]> = await api.get(`/hd/ticket`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: filtros,
    paramsSerializer: {
      indexes: null,
    },
  });
  return response.data;
};

export const getTicketsMe = async (): Promise<HD_Ticket[]> => {
  const token = localStorage.getItem("token");

  const response = await api.get("/hd/ticket/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
  const token = localStorage.getItem("token");
  const response = await api.post("/hd/ticket/mensaje", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const derivarTicket = async (
  ticket_id: number,
  data: { a_area_id: number; motivo: string }
) => {
  const token = localStorage.getItem("token");
  const response = await api.post(`/hd/ticket/derivar/${ticket_id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const asignarTicket = async (
  ticket_id: number,
  data: Partial<HD_Ticket>
) => {
  const response = await api.put(`/hd/ticket/asignar/${ticket_id}`, data);
  return response.data;
};

export const createCalificacion = async (
  data: Partial<HD_CalificacionTicket>
) => {
  const token = localStorage.getItem("token");
  const response = await api.post("/hd/ticket/calificacion", data, {
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
  const response = await api.put(`/hd/ticket/estado/${ticket_id}`, data);
  return response.data;
};

export const getSoporte = async (area_id: number) => {
  const response = await api.get(`/hd/ticket/soporte/${area_id}`);
  return response.data;
};
