import { createMensaje, getTicket } from "@services/hd";
import { HD_Ticket } from "@interfaces/hd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// interface Props {
//   ticket: Ticket;
// }

export default function useDetalleTicket() {
  const params = useParams();
  const id = params.id as string;

  // STATE =====================
  const [ticket, setTicket] = useState<HD_Ticket>();
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loadingMensaje, setLoadingMensaje] = useState(false);

  // USEEFECT ==================
  useEffect(() => {
    console.log("se ejeuctro 2");
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

  const handleEnviarMensaje = async () => {
    console.log("se ejeuctro");

    if (!nuevoMensaje.trim()) return;
    setLoadingMensaje(true);
    try {
      await createMensaje({
        ticket_id: Number(id),
        contenido: nuevoMensaje,
      });
      setNuevoMensaje("");
      const res = await getTicket(Number(id));
      setTicket(res);
    } catch (error) {
      console.log("error => ", error);
    } finally {
      setLoadingMensaje(false);
    }
  };

  return {
    id,
    ticket,
    fetchTicket,
    nuevoMensaje,
    setNuevoMensaje,
    loadingMensaje,
    handleEnviarMensaje,
  };
}
