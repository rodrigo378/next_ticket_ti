"use client";
import { Ticket } from "@/interface/ticket_ti";
import { Card, Descriptions, Tag, Space, Typography } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
dayjs.extend(relativeTime);
dayjs.locale("es");

const { Text } = Typography;

interface Props {
  ticket: Ticket;
}

export default function CardTicketOrigen({ ticket }: Props) {
  const derivaciones = ticket.DerivacionesComoDestino ?? [];
  if (!derivaciones.length) return null;

  const fmt = (d?: Date | string) =>
    d ? `${dayjs(d).format("DD/MM/YYYY HH:mm")} · ${dayjs(d).fromNow()}` : "—";

  return (
    <Card
      title={
        <Space>
          <span>Ticket origen</span>
          <Tag color="warning">Derivado</Tag>
        </Space>
      }
      className="rounded-xl shadow-sm mb-3"
    >
      {derivaciones
        .slice()
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
        .map((d) => {
          const deArea = d.de_area?.nombre ?? "—";
          const aArea = d.a_area?.nombre ?? "—";
          const usuario = d.usuario
            ? [d.usuario.nombre, d.usuario.apellidos].filter(Boolean).join(" ")
            : "—";
          const fecha = fmt(d.createdAt);
          const motivo = d.motivo ?? "—";

          return (
            <Descriptions
              key={d.id}
              bordered
              column={1}
              size="middle"
              styles={{ label: { fontWeight: 500 } }}
              className="mb-3"
            >
              <Descriptions.Item label="De área">{deArea}</Descriptions.Item>
              <Descriptions.Item label="A área">{aArea}</Descriptions.Item>
              <Descriptions.Item label="Usuario que derivó">
                {usuario}
              </Descriptions.Item>
              <Descriptions.Item label="Motivo">
                <Text>{motivo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha de derivación">
                {fecha}
              </Descriptions.Item>
            </Descriptions>
          );
        })}
    </Card>
  );
}
