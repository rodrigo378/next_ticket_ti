import { Ticket } from "@/interface/ticket_ti";
import { Card, Descriptions, Tag } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("es");

interface Props {
  ticket: Ticket | null;
}

export default function CardDetalle({ ticket }: Props) {
  const estadoNombre = (ticket?.estado?.nombre || "").toLowerCase();
  const estadoColor = estadoNombre.includes("abierto")
    ? "green"
    : estadoNombre.includes("progreso")
    ? "blue"
    : "default";

  const asigNombre = ticket?.asignado
    ? [ticket.asignado.nombre, ticket.asignado.apellidos]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <Card title="🎟️ Detalle del Ticket" className="mb-6 rounded-xl shadow-sm">
      <Descriptions
        column={1}
        size="middle"
        bordered
        labelStyle={{ width: 220 }}
      >
        <Descriptions.Item label="Código">
          {ticket?.codigo ?? "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Estado">
          <Tag color={estadoColor}>{ticket?.estado?.nombre ?? "—"}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tipo">
          {ticket?.categoria?.incidencia?.tipo ?? "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Incidencia">
          {ticket?.categoria?.incidencia?.nombre ?? "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Categoría">
          {ticket?.categoria?.nombre ?? "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Área responsable">
          {ticket?.area?.nombre ?? "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Agente asignado">
          {asigNombre ?? "Pendiente"}
        </Descriptions.Item>
        <Descriptions.Item label="Descripción">
          {ticket?.descripcion ?? "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Fecha de creación">
          {ticket?.createdAt
            ? `${dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")} · ${dayjs(
                ticket.createdAt
              ).fromNow()}`
            : "—"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
