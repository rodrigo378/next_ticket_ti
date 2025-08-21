import { Badge, Tabs } from "antd";
import TicketTable from "./TicketTable";
import { Ticket } from "@/interface/ticket_ti";
import TicketTableResueltos from "./TicketTableResueltos";

interface Props {
  ticketsActivos: Ticket[];
  ticketsResueltos: Ticket[];
  pendientes: number;
}

export default function TicketTabs({
  ticketsActivos,
  ticketsResueltos,
  pendientes,
}: Props) {
  return (
    <>
      <Tabs
        defaultActiveKey="activos"
        items={[
          {
            key: "activos",
            label: "Activos",
            children: <TicketTable ticket={ticketsActivos}></TicketTable>,
          },
          {
            key: "resueltos",
            label: (
              <>
                Resueltos
                {pendientes > 0 && (
                  <Badge count={pendientes} style={{ marginLeft: 8 }} />
                )}
              </>
            ),
            children: (
              <TicketTableResueltos
                ticket={ticketsResueltos}
              ></TicketTableResueltos>
            ),
          },
        ]}
      />
    </>
  );
}
