import { Tabs } from "antd";
import TableTicketsAsignados from "./TablaMisTickets";
import { HD_Ticket } from "@/interfaces/hd";
import TableTicketsGrupo from "./TablaGrupo";
import TablaFinalizados from "./TableFinalizados";

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
  saveConfig: (data: {
    tabKey: string;
    config: Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) => Promise<any>;
}

export default function TabsSoporte({
  usuario,
  loading,
  tickets,
  hdRole,
  hdConfig,
  tabKey,
  saveConfig,
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
              hdConfig={hdConfig}
              saveConfig={saveConfig}
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
              hdRole={hdRole}
              hdConfig={hdConfig}
              saveConfig={saveConfig}
            ></TableTicketsGrupo>
          ),
        },

        {
          key: "finalizaods",
          label: "👥 Finalizados",
          children: (
            <TablaFinalizados
              usuario={usuario}
              loading={loading}
              tickets={tickets}
              hdRole={hdRole}
              hdConfig={hdConfig}
              saveConfig={saveConfig}
            ></TablaFinalizados>
          ),
        },
      ]}
    />
  );
}
