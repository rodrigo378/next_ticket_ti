"use client";

import { Ticket } from "@/interface/ticket_ti";
import { getTicketsMe } from "@/services/ticket_ti";
import { useEffect, useMemo, useState } from "react";

export default function useMisTicket() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const fetchTickets = async () => {
    try {
      const data = await getTicketsMe();
      setTickets(data);
    } catch (error) {
      console.error("Error al obtener tickets:", error);
    }
  };

  const ticketActivos = useMemo(
    () => tickets.filter((t) => [1, 2, 3].includes(t.estado_id)),
    [tickets]
  );

  const ticketResueltos = useMemo(
    () => tickets.filter((t) => [4].includes(t.estado_id)),
    [tickets]
  );

  const pendientes = useMemo(
    () =>
      ticketResueltos.filter((t) => !t?.CalificacionTicket?.calificacion)
        .length,
    [ticketResueltos]
  );

  useEffect(() => {
    fetchTickets();
  }, []);

  return { ticketActivos, ticketResueltos, pendientes };
}
