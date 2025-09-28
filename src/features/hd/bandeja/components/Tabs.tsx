import { Tabs, theme } from "antd";

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
  const { token } = theme.useToken();

  return (
    <Tabs
      activeKey={tabKey}
      onChange={onChangeTabs}
      items={items}
      tabBarGutter={20}
      tabBarStyle={{
        background: token.colorBgContainer,
        // borderRadius: 8,
        padding: "6px 8px",
        // border: `1px solid ${token.colorBorderSecondary}`,
      }}
      className="mb-4"
    />
  );
}
