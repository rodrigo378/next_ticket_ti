"use client";

import { HD_Ticket } from "@interfaces/hd";
import { getTicketsMe } from "@services/hd";
import { useEffect, useMemo, useState } from "react";

export default function useMisTicket() {
  const [tickets, setTickets] = useState<HD_Ticket[]>([]);

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
      ticketResueltos.filter((t) => !t?.calificacionTicket?.calificacion)
        .length,
    [ticketResueltos]
  );

  useEffect(() => {
    fetchTickets();
  }, []);

  return { ticketActivos, ticketResueltos, pendientes };
}
