"use client";
import { Row, Col, Affix, Skeleton, Tag, Typography, Space } from "antd";
import CardDetalle from "../../usuario/detalleTicket/components/CardDetalle";
import { CardOpcionesRapidas } from "./components/card";
import CardArchivos from "./components/CardArchivos";
import CardCalificacion from "./components/CardCalificacion";
import CardSla from "./components/CardSla";
import useDetalleTicket from "./hooks/useDetalleTicket";

const { Text, Title } = Typography;

export default function DetalleTicketView() {
  const { id, ticket, fetchTicket } = useDetalleTicket();

  // Encabezado-resumen (solo si hay ticket)
  const HeaderResumen = () => {
    if (!ticket) return null;
    const estadoNombre = (ticket?.estado?.nombre || "").toLowerCase();
    const estadoColor = estadoNombre.includes("abierto")
      ? "green"
      : estadoNombre.includes("progreso")
      ? "blue"
      : "default";

    const asignadoNombre = ticket?.asignado
      ? [ticket.asignado.nombre, ticket.asignado.apellidos]
          .filter(Boolean)
          .join(" ")
      : "Pendiente";

    return (
      <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Title level={4} style={{ margin: 0 }}>
            Ticket #{ticket?.codigo ?? ticket?.id}
          </Title>
          <Tag color={estadoColor}>{ticket?.estado?.nombre ?? "—"}</Tag>
        </div>
        <Space size="middle" wrap>
          <Text type="secondary">Área: {ticket?.area?.nombre ?? "—"}</Text>
          <Text type="secondary">Asignado: {asignadoNombre}</Text>
        </Space>
      </div>
    );
  };

  const Content = () => {
    if (!ticket) {
      return (
        <>
          <Skeleton active title paragraph={{ rows: 2 }} />
          <Skeleton active title paragraph={{ rows: 6 }} />
          <Skeleton active title paragraph={{ rows: 4 }} />
        </>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {/* Izquierda: 24 en móvil, 16/24 en desktop */}
        <Col xs={24} lg={16}>
          <div className="space-y-6">
            <CardOpcionesRapidas
              ticket={ticket}
              onTicketUpdate={() => fetchTicket(id)}
            />
            <CardCalificacion ticket={ticket} />
            <CardDetalle ticket={ticket} />
            <CardArchivos ticket={ticket} />
          </div>
        </Col>

        {/* Derecha: 24 en móvil, 8/24 en desktop */}
        <Col xs={24} lg={8}>
          {/* En desktop: Affix (fijo) */}
          <div className="hidden lg:block">
            <Affix offsetTop={24}>
              <CardSla ticket={ticket} />
            </Affix>
          </div>
          {/* En móvil: inline (sin Affix para evitar solapes) */}
          <div className="lg:hidden">
            <CardSla ticket={ticket} />
          </div>
        </Col>
      </Row>
    );
  };

  return (
    <div className="mx-auto p-6">
      <HeaderResumen />
      <Content />
    </div>
  );
}
