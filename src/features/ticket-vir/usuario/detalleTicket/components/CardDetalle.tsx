import { Ticket } from "@/interface/ticket_ti";
import { Card, Descriptions, Tag } from "antd";
import Title from "antd/es/typography/Title";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("es");

interface Props {
  ticket: Ticket | null;
}

export default function CardDetalle({ ticket }: Props) {
  return (
    <>
      <Title level={3}>🎟️ Detalle del Ticket</Title>

      <Card className="mb-6">
        <Descriptions column={1} size="middle" bordered>
          <Descriptions.Item label="Codigo">{ticket?.codigo}</Descriptions.Item>
          <Descriptions.Item label="Tipo">
            {ticket?.categoria?.incidencia?.tipo}
          </Descriptions.Item>
          <Descriptions.Item label={ticket?.categoria?.incidencia?.tipo}>
            {ticket?.categoria?.incidencia?.nombre}
          </Descriptions.Item>
          <Descriptions.Item label="Categoria">
            {ticket?.categoria?.nombre}
          </Descriptions.Item>
          <Descriptions.Item label="Descripción">
            {ticket?.descripcion}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color="blue">{ticket?.estado?.nombre}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de creación">
            {dayjs(ticket?.createdAt).fromNow()}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </>
  );
}
