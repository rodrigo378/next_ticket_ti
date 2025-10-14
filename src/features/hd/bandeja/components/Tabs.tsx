import { Tabs } from "antd";
import TableTicketsAsignados from "./TablaMisTickets";
import { HD_Ticket } from "@/interfaces/hd";
import TableTicketsGrupo from "./TablaGrupo";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  usuario: any;
  loading: boolean;
  tickets: HD_Ticket[];
  hdRole: string | null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hdConfig: any;

  tabKey: string;
  onChangeTabs: (key: string) => void;
}

// const items = [
//   { key: "mis_tickets", label: "🎧 Asignados a mí" },
//   { key: "grupo", label: "👥 Del grupo" },
//   { key: "finalizados", label: "✅ Finalizados" },
//   { key: "Cancelados", label: "✅ Cancelados" },
// ];

export default function TabsSoporte({
  usuario,
  loading,
  tickets,
  hdRole,
  hdConfig,
  tabKey,
  onChangeTabs,
}: Props) {
  return (
    <Tabs
      activeKey={tabKey}
      onChange={onChangeTabs}
      items={[
        {
          key: "mis_tickets",
          label: "🎧 Asignados a mí",
          children: (
            <TableTicketsAsignados
              usuario={usuario}
              loading={loading}
              tickets={tickets}
              hdRole={hdRole}
              hdConfig={hdConfig} // ⬅️ pasar config
            ></TableTicketsAsignados>
          ),
        },

        {
          key: "grupo",
          label: "👥 Del grupo",
          children: (
            <TableTicketsGrupo
              usuario={usuario}
              loading={loading}
              tickets={tickets}
            ></TableTicketsGrupo>
          ),
        },
      ]}
    />
  );
}
