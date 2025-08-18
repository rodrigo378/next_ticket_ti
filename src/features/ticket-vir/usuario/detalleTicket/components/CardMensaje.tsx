import { Ticket } from "@/interface/ticket_ti";
import { Button, Card, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
const { Text } = Typography;

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("es");

interface Props {
  ticket: Ticket | null;
  nuevoMensaje: string;
  loadingMensaje: boolean;
  setNuevoMensaje: React.Dispatch<React.SetStateAction<string>>;
  handleEnviarMensaje: () => void;
  // setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>;
}

export default function CardMensaje({
  ticket,
  nuevoMensaje,
  loadingMensaje,
  setNuevoMensaje,
  handleEnviarMensaje,
}: Props) {
  return (
    <>
      <Card title="💬 Conversación 1">
        <div className="mb-4 max-h-96 overflow-y-auto pr-2">
          {ticket?.mensajes?.map((mensaje) => (
            <div key={mensaje.id} className={`mb-4 p-3 rounded-lg max-w-sm`}>
              <div className="flex items-center gap-2 mb-1">
                <Text strong>{mensaje?.emisor?.nombre}</Text>
              </div>
              <div className="text-gray-500 text-xs">
                {dayjs(mensaje.createdAt).fromNow()}
              </div>
              <div className="mt-1">{mensaje.contenido}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <TextArea
            rows={3}
            placeholder="Escribe un mensaje..."
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
          />
          <Button
            type="primary"
            className="mt-2"
            onClick={handleEnviarMensaje}
            loading={loadingMensaje}
          >
            Enviar
          </Button>
        </div>

        {/* {false ? (
          <Alert
            type="info"
            message="Este ticket ha sido cerrado. Si necesitas más ayuda, puede solicitar reabrirlo."
            showIcon
            className="mt-4"
          />
        ) : (
          <div className="mt-4">
            <TextArea
              rows={3}
              placeholder="Escribe un mensaje..."
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
            />
            <Button
              type="primary"
              className="mt-2"
              onClick={handleEnviarMensaje}
              loading={loadingMensaje}
            >
              Enviar
            </Button>
          </div>
        )} */}
      </Card>
    </>
  );
}
