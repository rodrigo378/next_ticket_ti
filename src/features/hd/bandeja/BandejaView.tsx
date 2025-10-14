"use client";
import { Flex, Typography, theme } from "antd";
import TabsSoporte from "./components/Tabs";
import useBandeja from "./hooks/useBandaja";
import Title from "antd/es/typography/Title";

const { Text } = Typography;

export default function BandejaView() {
  const { tabKey, loading, tickets, onChangeTabs, usuario, hdRole, hdConfig } =
    useBandeja();
  const { token } = theme.useToken();

  return (
    <div className="mx-auto p-6 rounded-xl">
      <Flex justify="space-between" align="center">
        <div className="mb-4">
          <Title level={3} style={{ margin: 0, color: token.colorText }}>
            Bandeja de Tickets
          </Title>
          <Text type="secondary" style={{ color: token.colorTextSecondary }}>
            Gestiona, asigna y da seguimiento a los tickets del sistema.
          </Text>
        </div>
      </Flex>

      <TabsSoporte
        usuario={usuario}
        loading={loading}
        tickets={tickets}
        tabKey={tabKey}
        onChangeTabs={onChangeTabs}
        hdRole={hdRole}
        hdConfig={hdConfig}
      />
    </div>
  );
}
