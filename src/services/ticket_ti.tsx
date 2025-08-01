import { Ticket } from "@/interface/ticket_ti";
import { api } from "./api";
import { AxiosResponse } from "axios";

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

export const updateTicket = async (
  ticket_id: number,
  data: Partial<Ticket>
) => {
  const response = await api.put(`/ticket/${ticket_id}`, data);
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

// export const createMensaje = async (data: {
//   ticket_id: number;
//   contenido?: string;
//   archivo?: File;
// }) => {
//   const token = localStorage.getItem("token");
//   const formData = new FormData();

//   formData.append("ticket_id", data.ticket_id.toString());

//   if (data.contenido) {
//     formData.append("contenido", data.contenido);
//   }

//   if (data.archivo) {
//     formData.append("archivo", data.archivo);
//   }

//   const response = await api.post("/ticket/mensaje", formData, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "multipart/form-data",
//     },
//   });

//   return response.data;
// };

// export const asignarSoporte = async (
//   ticket_id: number,
//   asignado_id: number
// ) => {
//   const response = await api.put("/ticket", { ticket_id, asignado_id });
//   return response.data;
// };

// export const getTicketMe = async (ticketId: string): Promise<Ticket> => {
//   const token = localStorage.getItem("token");

//   const response = await api.get(`/ticket_ti/me/${ticketId}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   return response.data;
// };

// export const getTicketsTi = async (): Promise<Ticket[]> => {
//   const response = await api.get("/ticket_ti/tickets");
//   return response.data;
// };

// export const updateTicketTi = async (
//   ticketTi_id: number,
//   data: { asignado_id?: number; prioridad_id?: number }
// ) => {
//   const response = await api.patch(`/ticket_ti/${ticketTi_id}`, data);
//   return response;
// };

// export const getTicketSoporte = async (): Promise<Ticket[]> => {
//   const token = localStorage.getItem("token");

//   const response = await api.get(`/ticket_ti/soporte`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   return response.data;
// };
