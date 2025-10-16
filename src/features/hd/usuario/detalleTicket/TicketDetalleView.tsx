"use client";

import { Flex, Typography, theme } from "antd";
import useDetalleTicket from "./hooks/useDetalleTicket";
import CardCalificacion from "./components/CardCalificacion";
import CardDetalle from "./components/CardDetalle";
import CardArchivos from "./components/CardArchivos";
import CardMensaje from "./components/CardMensaje";

const { Title, Text } = Typography;

export default function TicketDetalleView() {
  const {
    ticket,
    nuevoMensaje,
    setNuevoMensaje,
    loadingMensaje,
    handleEnviarMensaje,
    crearCalificacion,
  } = useDetalleTicket();

  // 👇 Trae los tokens del tema actual (light/dark + overrides)
  const { token } = theme.useToken();

  const valorCalificado = ticket?.calificacionTicket?.calificacion ?? 0;

  return (
    <div
      style={{
        maxWidth: 1080, // ≈ max-w-5xl
        margin: "0 auto",
        padding: token.paddingLG, // p-6 -> padding grande del tema
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      <Flex justify="space-between" align="center">
        <div style={{ marginBottom: token.marginSM }}>
          <Title level={3} style={{ margin: 0 }}>
            Detalle del Ticket
          </Title>
          <Text type="secondary">Revisa el detalle de tu ticket</Text>
        </div>
      </Flex>

      {ticket?.estado_id === 4 && (
        <CardCalificacion
          ticket={ticket}
          valorCalificado={valorCalificado}
          crearCalificacion={crearCalificacion}
        />
      )}

      <CardDetalle ticket={ticket} />

      <CardMensaje
        ticket={ticket}
        nuevoMensaje={nuevoMensaje}
        loadingMensaje={loadingMensaje}
        setNuevoMensaje={setNuevoMensaje}
        handleEnviarMensaje={handleEnviarMensaje}
      />

      <CardArchivos ticket={ticket} />
    </div>
  );
}
