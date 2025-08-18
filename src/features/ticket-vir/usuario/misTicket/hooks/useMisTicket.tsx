"use client";

import { Ticket } from "@/interface/ticket_ti";
import { getTicketsMe } from "@/services/ticket_ti";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetchTickets();
  }, []);

  return { tickets };
}
