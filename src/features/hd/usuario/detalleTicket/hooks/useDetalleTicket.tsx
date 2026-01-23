import { HD_CalificacionTicket, HD_Ticket } from "@interfaces/hd";
import { createCalificacion, createMensaje, getTicket } from "@services/hd";
import { message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTicket = async (idParam: string) => {
    try {
      const data = await getTicket(Number(idParam));
      setTicket(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const toFiles = (list?: UploadFile[]): File[] => {
    const out: File[] = [];
    for (const f of list ?? []) {
      const real = f?.originFileObj;
      if (real instanceof File) out.push(real);
    }
    return out;
  };

  // ✅ Ahora acepta archivos desde Upload.Dragger (UploadFile[])
  const handleEnviarMensaje = async (opts?: { archivos?: UploadFile[] }) => {
    const texto = nuevoMensaje.trim();
    const archivos = toFiles(opts?.archivos);

    // ✅ permite: solo texto, solo archivos, o ambos
    if (!texto && archivos.length === 0) return;

    setLoadingMensaje(true);
    try {
      const fd = new FormData();
      fd.append("ticket_id", String(Number(id)));

      // si tu backend necesita "tipo" sí o sí, déjalo
      fd.append("tipo", "texto");

      if (texto) fd.append("contenido", texto);

      for (const file of archivos) {
        fd.append("archivos", file);
      }

      await createMensaje(fd);

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
