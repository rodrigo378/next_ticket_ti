"use client";
import {
  Row,
  Col,
  Skeleton,
  Tag,
  Typography,
  Space,
  Card,
  Avatar,
  UploadFile,
} from "antd";
import CardDetalle from "../../usuario/detalleTicket/components/CardDetalle";
import { CardOpcionesRapidas } from "./components/card";
import CardArchivos from "./components/CardArchivos";
import CardCalificacion from "./components/CardCalificacion";
import CardSla from "./components/CardSla";
import useDetalleTicket from "./hooks/useDetalleTicket";
import CardTicketOrigen from "./components/CardDerivado";
import CardMensaje from "./components/CardMensaje";
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useCallback } from "react";
import { HD_Ticket } from "@/interface/hd/hd_ticket";

const { Text, Title } = Typography;

/* ========= SUBCOMPONENTES (fuera del render para no remontar) ========= */

function HeaderResumen({ ticket }: { ticket?: HD_Ticket }) {
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
}

function CardUsuarioCreador() {
  // Data estática como pediste
  return (
    <Card
      title="👤 Usuario que creó el ticket"
      className="mb-4 rounded-xl shadow-sm"
    >
      <div className="flex items-start gap-3">
        <Avatar size={56} icon={<UserOutlined />} />
        <div className="leading-6">
          <Text strong>Juan Pérez</Text>
          <div className="text-sm text-gray-500">Área: Académica</div>
          <div className="text-sm">
            <MailOutlined className="mr-1" />
            juan.perez@uma.edu.pe
          </div>
          <div className="text-sm">
            <PhoneOutlined className="mr-1" />
            +51 999 888 777
          </div>
        </div>
      </div>
    </Card>
  );
}

function Content({
  ticket,
  onTicketUpdate,
  nuevoMensaje,
  setNuevoMensaje,
  loadingMensaje,
  handleEnviarMensaje,
}: {
  ticket?: HD_Ticket;
  id: string;
  onTicketUpdate: () => void;
  nuevoMensaje: string;
  setNuevoMensaje: React.Dispatch<React.SetStateAction<string>>;
  loadingMensaje: boolean;
  handleEnviarMensaje: (opts?: { archivos?: UploadFile[] }) => void;
}) {
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
      {/* Izquierda (principal) */}
      <Col span={16}>
        <div className="space-y-6">
          {/* Chat */}
          <CardMensaje
            ticket={ticket}
            nuevoMensaje={nuevoMensaje}
            loadingMensaje={loadingMensaje}
            setNuevoMensaje={setNuevoMensaje}
            handleEnviarMensaje={handleEnviarMensaje}
          />

          {/* Detalle del ticket */}
          <CardDetalle ticket={ticket} />

          {/* Archivos */}
          <CardArchivos ticket={ticket} />

          {/* Origen / Derivado */}
          <CardTicketOrigen ticket={ticket} />

          {/* Calificación (cierre) */}
          <CardCalificacion ticket={ticket} />
        </div>
      </Col>

      {/* Derecha (sticky) */}
      <Col span={8}>
        <div style={{ position: "sticky", top: 16 }}>
          {/* Acciones rápidas (movido a la derecha) */}
          <div className="">
            <CardOpcionesRapidas
              ticket={ticket}
              onTicketUpdate={onTicketUpdate}
            />
          </div>

          {/* SLA */}
          <div className="mt-4">
            <CardSla ticket={ticket} />
          </div>

          {/* Usuario que creó el ticket */}
          <div className="mt-4">
            <CardUsuarioCreador />
          </div>
        </div>
      </Col>
    </Row>
  );
}

/* ===================== COMPONENTE PRINCIPAL ===================== */

export default function DetalleTicketView() {
  const {
    id,
    ticket,
    fetchTicket,
    // estos vienen del hook (versión con mensajes)
    nuevoMensaje,
    setNuevoMensaje,
    loadingMensaje,
    handleEnviarMensaje,
  } = useDetalleTicket();

  // Evita recrear la función en cada render
  const onTicketUpdate = useCallback(() => {
    fetchTicket(id);
  }, [fetchTicket, id]);

  return (
    <div className="mx-auto p-6" style={{ overflowAnchor: "none" }}>
      <HeaderResumen ticket={ticket} />
      <Content
        ticket={ticket}
        id={id}
        onTicketUpdate={onTicketUpdate}
        nuevoMensaje={nuevoMensaje}
        setNuevoMensaje={setNuevoMensaje}
        loadingMensaje={loadingMensaje}
        handleEnviarMensaje={handleEnviarMensaje}
      />
    </div>
  );
}
