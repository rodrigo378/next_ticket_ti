import { Ticket } from "@/interface/ticket_ti";
import { Alert, Card, Rate, Typography } from "antd";
const { Text } = Typography;

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("es");

interface Props {
  ticket: Ticket | null;
  valorCalificado: number;
  crearCalificacion: (value: number) => void;
}

export default function CardCalificacion({
  ticket,
  valorCalificado,
  crearCalificacion,
}: Props) {
  return (
    <>
      <Alert
        message="✅ Este ticket ha sido resuelto"
        description="Gracias por utilizar la mesa de ayuda. Puede reabrir el ticket si necesita más asistencia."
        type="success"
        showIcon
        className="mb-4"
      />

      <Card className="mb-6" title="📝 Califica tu experiencia">
        <div className="text-center">
          {true ? (
            <>
              <Text strong>Tu calificación</Text>
              <div className="my-3">
                <Rate allowHalf disabled defaultValue={valorCalificado} />
              </div>
              {ticket?.CalificacionTicket?.comentario ? (
                <Text type="secondary" italic>
                  “{ticket.CalificacionTicket.comentario}”
                </Text>
              ) : (
                <Text type="secondary" italic>
                  Gracias por tu evaluación.
                </Text>
              )}
              <div className="text-xs text-gray-500 mt-2">
                {dayjs(ticket?.CalificacionTicket?.createdAt).fromNow()}
              </div>
            </>
          ) : (
            <>
              <Text strong>¿Cómo calificarías la atención recibida?</Text>
              <div className="my-3">
                <Rate
                  allowClear
                  allowHalf
                  defaultValue={0}
                  onChange={(value) => crearCalificacion(value)}
                />
              </div>
              <Text type="secondary" italic>
                Tu opinión nos ayuda a mejorar nuestro servicio de soporte.
              </Text>
            </>
          )}
        </div>
      </Card>
    </>
  );
}
