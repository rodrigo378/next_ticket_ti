import { Ticket } from "@/interface/ticket_ti";
import { getTicket } from "@/services/ticket_ti";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// interface Props {
//   ticket: Ticket;
// }

export default function useDetalleTicket() {
  const params = useParams();
  const id = params.id as string;

  // STATE =====================
  const [ticket, setTicket] = useState<Ticket>();

  // USEEFECT ==================
  useEffect(() => {
    fetchTicket(id);
  }, [id]);

  // FETCHS ====================
  const fetchTicket = async (id: string) => {
    try {
      const data = await getTicket(Number(id));
      setTicket(data);
    } catch (error) {
      console.error("Error al obtener ticket:", error);
    }
  };

  return {
    id,
    ticket,
    fetchTicket,
  };
}
