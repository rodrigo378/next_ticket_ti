// TabAdmin.tsx
import { Tabs } from "antd";
const items = [
  { key: "sin_asignar", label: "Sin asignar" },
  { key: "asignados", label: "Asignados" },
];

interface Props {
  tabKey: string;
  onChangeTabs: (key: string) => void;
}

export default function TabsAdmin({ tabKey, onChangeTabs }: Props) {
  return (
    <Tabs
      activeKey={tabKey}
      onChange={onChangeTabs}
      items={items}
      className="mb-4"
    />
  );
}
