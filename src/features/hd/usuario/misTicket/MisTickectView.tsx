"use client";
import { Flex, Space, Typography } from "antd";
import TicketTabs from "./components/TicketTabs";
import useMisTicket from "./hooks/useMisTicket";

const { Title, Text } = Typography;

export default function MisTicketView() {
  const { ticketActivos, ticketResueltos, pendientes } = useMisTicket();

  return (
    <>
      <div className="mx-auto p-6 rounded-xl shadow-sm">
        <Flex justify="space-between" align="center">
          <div className=" mb-4">
            <Title level={3} style={{ margin: 0 }}>
              Mis tickets
            </Title>
            <Text type="secondary">Revisa tus incidencias y solicitudes</Text>
          </div>
        </Flex>

        <Space direction="vertical" style={{ width: "100%" }}></Space>

        <TicketTabs
          ticketsActivos={ticketActivos}
          ticketsResueltos={ticketResueltos}
          pendientes={pendientes}
        />
      </div>
    </>
  );
}
