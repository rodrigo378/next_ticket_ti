import { HD_CalificacionTicket } from "@/interface/hd/hd_calificacionTicket";
import { HD_Ticket } from "@/interface/hd/hd_ticket";
import {
  createCalificacion,
  createMensaje,
  getTicket,
} from "@/features/hd/service/ticket_ti";
import { message } from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function useDetalleTicket() {
  const params = useParams();
  const id = params.id as string;

  const [ticket, setTicket] = useState<HD_Ticket | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loadingMensaje, setLoadingMensaje] = useState(false);

  useEffect(() => {
    fetchTicket(id);
  }, [id]);

  const fetchTicket = async (idParam: string) => {
    try {
      const data = await getTicket(Number(idParam));
      setTicket(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const handleEnviarMensaje = async () => {
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

  const crearCalificacion = async (value: number) => {
    if (!ticket?.id) return;

    const data: Partial<HD_CalificacionTicket> = {
      ticket_id: ticket.id,
      calificacion: value,
    };

    try {
      await createCalificacion(data);
      message.success("Gracias por tu calificación.");
      // 🔄 refresca el ticket para que aparezca CalificacionTicket
      const res = await getTicket(ticket.id);
      setTicket(res);
    } catch (error) {
      console.log("error => ", error);
      message.error("No se pudo registrar la calificación.");
    }
  };

  return {
    ticket,
    nuevoMensaje,
    setNuevoMensaje,
    loadingMensaje,
    handleEnviarMensaje,
    crearCalificacion,
  };
}
