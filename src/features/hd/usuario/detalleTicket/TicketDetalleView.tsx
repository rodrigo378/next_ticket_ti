"use client";

import { Flex, Typography } from "antd";
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

  const valorCalificado = ticket?.calificacionTicket?.calificacion ?? 0;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <Flex justify="space-between" align="center">
        <div className="mb-4">
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

      <CardDetalle ticket={ticket}></CardDetalle>

      <CardArchivos ticket={ticket}></CardArchivos>

      <CardMensaje
        ticket={ticket}
        nuevoMensaje={nuevoMensaje}
        loadingMensaje={loadingMensaje}
        setNuevoMensaje={setNuevoMensaje}
        handleEnviarMensaje={() => handleEnviarMensaje()}
      ></CardMensaje>
    </div>
  );
}
