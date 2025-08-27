import { Card, Rate, Tag, Typography } from "antd";
const { Text } = Typography;

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useMemo } from "react";
import { HD_Ticket } from "@/interface/hd/hd_ticket";
dayjs.extend(relativeTime);
dayjs.locale("es");
dayjs.extend(isSameOrBefore);

interface Props {
  ticket: HD_Ticket;
}

export default function CardCalificacion({ ticket }: Props) {
  const estaResuelto = ticket?.estado_id === 4;

  const yaTieneCalificacion = useMemo(
    () => Boolean(ticket?.calificacionTicket),
    [ticket]
  );

  const valorCalificacion = Number(
    ticket?.calificacionTicket?.calificacion || 0
  );

  return (
    <Card
      className="mb-6"
      title="📝 Calificación del Ticket"
      extra={
        estaResuelto ? (
          <Tag color="green">Resuelto</Tag>
        ) : (
          <Tag color="blue">En atención</Tag>
        )
      }
    >
      {estaResuelto ? (
        yaTieneCalificacion ? (
          <div className="text-center">
            <Text strong>Calificación del usuario</Text>
            <div className="my-3">
              <Rate allowHalf disabled defaultValue={valorCalificacion} />
            </div>
            {ticket?.calificacionTicket?.comentario ? (
              <Text type="secondary" italic>
                “{ticket.calificacionTicket.comentario}”
              </Text>
            ) : (
              <Text type="secondary" italic>
                Gracias por su evaluación.
              </Text>
            )}
            <div className="text-xs text-gray-500 mt-2">
              {dayjs(ticket?.calificacionTicket?.createdAt).fromNow()}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Text type="secondary">
              Este ticket aún no tiene calificación registrada.
            </Text>
          </div>
        )
      ) : (
        <Text type="secondary">
          La calificación se habilita cuando el ticket está resuelto.
        </Text>
      )}
    </Card>
  );
}
