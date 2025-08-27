import { Tabs } from "antd";

interface Props {
  tabKey: string;
  onChangeTabs: (key: string) => void;
}

const items = [
  { key: "mis_tickets", label: "🎧 Asignados a mí" },
  { key: "grupo", label: "👥 Del grupo" },
  { key: "finalizados", label: "✅ Finalizados" },
];

export default function TabsSoporte({ tabKey, onChangeTabs }: Props) {
  return (
    <Tabs
      activeKey={tabKey}
      onChange={onChangeTabs}
      items={items}
      className="mb-4"
    />
  );
}
