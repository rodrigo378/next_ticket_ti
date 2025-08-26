"use client";
import { Alert, Card, Rate, Typography, Input, Button } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { HD_Ticket } from "@/interface/hd/hd_ticket";
dayjs.extend(relativeTime);
dayjs.locale("es");

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  ticket: HD_Ticket | null;
  valorCalificado: number;
  crearCalificacion: (value: number, comentario?: string) => void;
}

export default function CardCalificacion({ ticket, crearCalificacion }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [comentario, setComentario] = useState<string>("");
  const [enviado, setEnviado] = useState<boolean>(false);

  const yaTieneCalificacion = Boolean(ticket?.calificacionTicket);

  const handleRateChange = (value: number) => {
    setRating(value);
  };

  const handleComentarioChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setComentario(e.target.value);
  };

  const handleEnviar = async () => {
    try {
      crearCalificacion(rating, comentario);
      setEnviado(true); // 👈 Cambiamos el estado a "enviado"
    } catch (err) {
      console.error(err);
    }
  };

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
          {yaTieneCalificacion ? (
            <>
              <Text strong>Tu calificación</Text>
              <div className="my-3">
                <Rate
                  allowHalf
                  disabled
                  defaultValue={Number(
                    ticket?.calificacionTicket?.calificacion || 0
                  )}
                  style={{ fontSize: 28 }}
                />
              </div>
              {ticket?.calificacionTicket?.comentario ? (
                <Text type="secondary" italic>
                  “{ticket.calificacionTicket.comentario}”
                </Text>
              ) : (
                <Text type="secondary" italic>
                  Gracias por tu evaluación.
                </Text>
              )}
              <div className="mt-2 text-xs text-gray-500">
                {dayjs(ticket?.calificacionTicket?.createdAt).fromNow()}
              </div>
            </>
          ) : enviado ? (
            // 👇 Vista de agradecimiento más notoria
            <div className="py-6">
              <Text strong className="text-lg block mb-2">
                🎉 ¡Gracias por tu opinión!
              </Text>
              <Text type="secondary">
                Tu calificación fue registrada con éxito y nos ayudará a mejorar
                nuestro servicio.
              </Text>
            </div>
          ) : (
            <>
              <Text strong>¿Cómo calificarías la atención recibida?</Text>

              <div className="my-4 flex justify-center">
                <Rate
                  allowClear
                  allowHalf
                  value={rating}
                  onChange={handleRateChange}
                  style={{ fontSize: 34 }}
                />
              </div>

              <TextArea
                rows={4}
                placeholder="Cuéntanos brevemente tu experiencia (opcional)…"
                value={comentario}
                onChange={handleComentarioChange}
                className="my-3"
              />

              <div className="mt-2 flex justify-center">
                <Button
                  type="primary"
                  size="large"
                  onClick={handleEnviar}
                  disabled={rating === 0}
                >
                  Enviar calificación
                </Button>
              </div>

              <div className="mt-3">
                <Text type="secondary" italic>
                  Tu opinión nos ayuda a mejorar nuestro servicio de soporte.
                </Text>
              </div>
            </>
          )}
        </div>
      </Card>
    </>
  );
}
