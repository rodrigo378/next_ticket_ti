"use client";
import { Flex, Typography, theme } from "antd";
import Title from "antd/es/typography/Title";
import TabsSoporte from "./components/Tabs";
import useTickets from "./hooks/useTickets";
import { useHdConfig, useHdSaveConfig } from "./hooks/useHdConfig";
import useBandejaTabs from "./hooks/useBandaja";

const { Text } = Typography;

export default function BandejaView() {
  const { tabKey, filtros, onChangeTabs } = useBandejaTabs();
  const { data: tickets, isLoading } = useTickets(filtros);
  const { usuario, hdRole, hdConfig } = useHdConfig();
  const { saveConfig } = useHdSaveConfig();
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
        loading={isLoading}
        tickets={tickets ?? []}
        tabKey={tabKey}
        onChangeTabs={onChangeTabs}
        hdRole={hdRole}
        hdConfig={hdConfig}
        saveConfig={saveConfig}
      />
    </div>
  );
}
