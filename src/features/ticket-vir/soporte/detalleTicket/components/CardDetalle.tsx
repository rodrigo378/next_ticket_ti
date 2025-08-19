import { Ticket } from "@/interface/ticket_ti";
import { Card, Descriptions, Tag } from "antd";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(relativeTime);
dayjs.locale("es");
dayjs.extend(isSameOrBefore);

interface Props {
  ticket: Ticket;
}

export default function CardDetalleTicket({ ticket }: Props) {
  return (
    <Card className="mb-6">
      <Descriptions column={1} size="middle" bordered>
        <Descriptions.Item label="Código">{ticket?.codigo}</Descriptions.Item>
        <Descriptions.Item label="Tipo">
          {ticket?.categoria?.incidencia?.tipo}
        </Descriptions.Item>
        <Descriptions.Item label={ticket?.categoria?.incidencia?.tipo}>
          {ticket?.categoria?.incidencia?.nombre}
        </Descriptions.Item>
        <Descriptions.Item label="Categoría">
          {ticket?.categoria?.nombre}
        </Descriptions.Item>
        <Descriptions.Item label="Descripción">
          {ticket?.descripcion}
        </Descriptions.Item>
        <Descriptions.Item label="Estado">
          <Tag color="blue">{ticket?.estado?.nombre}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Prioridad">
          <Tag color="red">{ticket?.prioridad?.nombre}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Fecha de asignación">
          {ticket?.asignadoAt
            ? dayjs(ticket.asignadoAt).format("DD/MM/YYYY HH:mm")
            : "—"}
        </Descriptions.Item>
        <Descriptions.Item label="Fecha de creación">
          {ticket?.createdAt
            ? dayjs(ticket.createdAt).format("DD/MM/YYYY HH:mm")
            : "—"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
