import { TicketTi } from "@/interface/ticket_ti";
import { api } from "./api";

export const createTicketTi = async (data: TicketTi): Promise<unknown> => {
  const token = localStorage.getItem("token");

  const response = await api.post("/ticket_ti", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getTicketsMe = async (): Promise<TicketTi[]> => {
  const token = localStorage.getItem("token");

  const response = await api.get("/ticket_ti/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getTicketMe = async (ticketId: string): Promise<TicketTi> => {
  const token = localStorage.getItem("token");

  const response = await api.get(`/ticket_ti/me/${ticketId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
