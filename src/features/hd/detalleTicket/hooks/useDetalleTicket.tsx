import { createMensaje, getTicket } from "@services/hd";
import { HD_Ticket } from "@interfaces/hd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { UploadFile } from "antd/es/upload/interface";
import type { RcFile } from "antd/es/upload";

export default function useDetalleTicket() {
  const params = useParams();
  const id = params.id as string;

  const [ticket, setTicket] = useState<HD_Ticket>();
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loadingMensaje, setLoadingMensaje] = useState(false);

  useEffect(() => {
    fetchTicket(id);
  }, [id]);

  const fetchTicket = async (id: string) => {
    try {
      const data = await getTicket(Number(id));
      setTicket(data);
    } catch (error) {
      console.error("Error al obtener ticket:", error);
    }
  };

  const handleEnviarMensaje = async (opts?: { archivos?: UploadFile[] }) => {
    const texto = (nuevoMensaje ?? "").trim();

    const archivosRc: RcFile[] = (opts?.archivos ?? [])
      .map((f) => f.originFileObj)
      .filter((f): f is RcFile => !!f);

    if (!texto && archivosRc.length === 0) return;

    setLoadingMensaje(true);
    try {
      const fd = new FormData();
      fd.append("ticket_id", String(id));
      fd.append("tipo", texto ? "texto" : "documento");
      if (texto) fd.append("contenido", texto);

      for (const f of archivosRc) {
        fd.append("archivos", f, f.name);
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
