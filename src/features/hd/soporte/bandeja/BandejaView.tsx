"use client";
import { Flex, Typography } from "antd";
import TableTickets from "./components/TableTickets";
import TabsSoporte from "./components/Tabs";
import useBandeja from "./hooks/useBandaja";
import Title from "antd/es/typography/Title";
const { Text } = Typography;

export default function BandejaView() {
  const { tabKey, loading, tickets, onChangeTabs, usuario } = useBandeja();

  return (
    <div className="mx-auto p-6 bg-white rounded-xl shadow-sm">
      <Flex justify="space-between" align="center">
        <div className="mb-4">
          <Title level={3} style={{ margin: 0 }}>
            Bandeja de Tickets
          </Title>
          <Text type="secondary">
            Gestiona, asigna y da seguimiento a los tickets del sistema.
          </Text>
        </div>
      </Flex>

      <TabsSoporte tabKey={tabKey} onChangeTabs={onChangeTabs}></TabsSoporte>

      <TableTickets
        usuario={usuario!}
        tickets={tickets}
        loading={loading}
      ></TableTickets>
    </div>
  );
}
