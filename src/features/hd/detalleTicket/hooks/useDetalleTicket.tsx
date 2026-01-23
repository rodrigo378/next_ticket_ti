import { createMensaje, getTicket } from "@services/hd";
import { HD_Ticket } from "@interfaces/hd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { UploadFile } from "antd/es/upload/interface";
import type { RcFile } from "antd/es/upload";

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

  const handleEnviarMensaje = async (opts?: { archivos?: UploadFile[] }) => {
    const texto = (nuevoMensaje ?? "").trim();

    // ✅ originFileObj es RcFile | undefined
    const archivosRc: RcFile[] = (opts?.archivos ?? [])
      .map((f) => f.originFileObj)
      .filter((f): f is RcFile => !!f); // ✅ type guard correcto (NO File)

    // ✅ si no hay texto ni archivos, no envía
    if (!texto && archivosRc.length === 0) return;

    setLoadingMensaje(true);
    try {
      const fd = new FormData();
      fd.append("ticket_id", String(id));
      fd.append("tipo", texto ? "texto" : "documento");
      if (texto) fd.append("contenido", texto);

      // ✅ append recibe Blob; RcFile extiende File -> OK
      for (const f of archivosRc) {
        fd.append("archivos", f, f.name); // ✅ filename explícito
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
