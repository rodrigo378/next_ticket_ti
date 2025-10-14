import { useUsuario } from "@/context/UserContext";
import { HD_Ticket } from "@interfaces/hd";
import { getTickets } from "@services/hd";
import { message } from "antd";
import { useEffect, useState } from "react";
import type { HdModule } from "@/interfaces/hd/config.modulo";

export default function useBandeja() {
  // USESTATE ========================
  const [tabKey, setTabKey] = useState("mis_tickets");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<HD_Ticket[]>([]);
  const { usuario, modulesByCode } = useUsuario();

  const hdModule = modulesByCode["HD"] as HdModule | undefined;
  const hdConfig = hdModule?.perfil ?? null;
  const hdRole = hdModule?.role ?? null;

  // USEEFFECT ======================
  useEffect(() => {
    fetchTickets("true", ["2", "3"]);
    // console.log("=======================");
    // console.log("hdModule => ", hdModule);
    // console.log("=======================");
  }, []);

  // FETCHS =========================
  const fetchTickets = async (me?: string, estados_id?: string[]) => {
    try {
      setLoading(true);
      const data = await getTickets({ me, estados_id });
      setTickets(data);
    } catch (error) {
      console.error("error => ", error);
      message.error("Error al cargar los tickets");
    } finally {
      setLoading(false);
    }
  };

  // ONCHANGE ========================
  const onChangeTabs = (key: string) => {
    setTabKey(key);
    if (key === "mis_tickets") fetchTickets("true", ["2", "3"]);
    else if (key === "grupo") fetchTickets(undefined, ["2", "3", "5"]);
    else if (key === "finalizados") fetchTickets(undefined, ["4", "7"]);
  };

  return {
    tabKey,
    loading,
    tickets,
    onChangeTabs,
    usuario,
    hdModule,
    hdRole,
    hdConfig,
  };
}
