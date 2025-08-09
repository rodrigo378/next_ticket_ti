"use client";

import {
  Card,
  Descriptions,
  Tag,
  Typography,
  List,
  Input,
  Button,
  Alert,
  Rate,
  message, // 👈 agregado
} from "antd";
import {
  PaperClipOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  createCalificacion,
  createMensaje,
  getTicket,
} from "@/services/ticket_ti";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { Ticket } from "@/interface/ticket_ti";
import { CalificacionTicket } from "@/interface/calificacion";
dayjs.extend(relativeTime);
dayjs.locale("es");

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Page() {
  const params = useParams();
  const id = params.id as string;

  const [ticketTi, setTicketTi] = useState<Ticket | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loadingMensaje, setLoadingMensaje] = useState(false);

  // ✅ helpers
  const estaResuelto = ticketTi?.estado_id === 4;
  const yaCalifico = useMemo(
    () => Boolean(ticketTi?.CalificacionTicket),
    [ticketTi]
  );
  const valorCalificado = ticketTi?.CalificacionTicket?.calificacion ?? 0;

  const fetchTicketTi = async (idParam: string) => {
    try {
      const data = await getTicket(Number(idParam));
      setTicketTi(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;
    setLoadingMensaje(true);
    try {
      await createMensaje({
        ticket_id: Number(id),
        contenido: nuevoMensaje,
      });
      setNuevoMensaje("");
      const res = await getTicket(Number(id));
      setTicketTi(res);
    } catch (error) {
      console.log("error => ", error);
    } finally {
      setLoadingMensaje(false);
    }
  };

  const crearCalificacion = async (value: number) => {
    if (!ticketTi?.id) return;
    if (yaCalifico) {
      message.info("Este ticket ya fue calificado.");
      return;
    }

    const data: Partial<CalificacionTicket> = {
      ticket_id: ticketTi.id,
      calificacion: value, // soporta .5 si tu modelo es Float
      // tecnico_id: ticketTi.asignado_id, // 👈 descomenta si lo agregaste en el backend
    };

    try {
      await createCalificacion(data);
      message.success("Gracias por tu calificación.");
      // 🔄 refresca el ticket para que aparezca CalificacionTicket
      const res = await getTicket(ticketTi.id);
      setTicketTi(res);
    } catch (error) {
      console.log("error => ", error);
      message.error("No se pudo registrar la calificación.");
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith(".pdf"))
      return <FilePdfOutlined style={{ color: "red" }} />;
    if (filename.endsWith(".doc") || filename.endsWith(".docx"))
      return <FileWordOutlined style={{ color: "blue" }} />;
    if (filename.endsWith(".png") || filename.endsWith(".jpg"))
      return <FileImageOutlined style={{ color: "green" }} />;
    return <PaperClipOutlined />;
  };

  useEffect(() => {
    fetchTicketTi(id);
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4 bg-white rounded-xl shadow-sm">
      <Title level={3}>🎟️ Detalle del Ticket</Title>

      {/* Alerta y Calificación si el ticket está resuelto */}
      {estaResuelto && (
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
              {yaCalifico ? (
                <>
                  <Text strong>Tu calificación</Text>
                  <div className="my-3">
                    <Rate allowHalf disabled defaultValue={valorCalificado} />
                  </div>
                  {ticketTi?.CalificacionTicket?.comentario ? (
                    <Text type="secondary" italic>
                      “{ticketTi.CalificacionTicket.comentario}”
                    </Text>
                  ) : (
                    <Text type="secondary" italic>
                      Gracias por tu evaluación.
                    </Text>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {dayjs(ticketTi?.CalificacionTicket?.createdAt).fromNow()}
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
      )}

      {/* Información general del ticket */}
      <Card className="mb-6">
        <Descriptions column={1} size="middle" bordered>
          <Descriptions.Item label="Codigo">
            {ticketTi?.codigo}
          </Descriptions.Item>
          <Descriptions.Item label="Tipo">
            {ticketTi?.categoria?.incidencia?.tipo}
          </Descriptions.Item>
          <Descriptions.Item label={ticketTi?.categoria?.incidencia?.tipo}>
            {ticketTi?.categoria?.incidencia?.nombre}
          </Descriptions.Item>
          <Descriptions.Item label="Categoria">
            {ticketTi?.categoria?.nombre}
          </Descriptions.Item>
          <Descriptions.Item label="Descripción">
            {ticketTi?.descripcion}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color="blue">{ticketTi?.estado?.nombre}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Prioridad">
            <Tag color="red">{ticketTi?.prioridad?.nombre}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de creación">
            {dayjs(ticketTi?.createdAt).fromNow()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Archivos Adjuntos */}
      <Card title="📎 Archivos Adjuntos" className="mb-6">
        {ticketTi?.documentos?.length ? (
          <List
            dataSource={ticketTi.documentos}
            renderItem={(doc) => {
              const fileUrl = `http://localhost:4000${doc.url.replace(
                /\\/g,
                "/"
              )}`;
              return (
                <List.Item>
                  {getFileIcon(doc.nombre)}{" "}
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    {doc.nombre}
                  </a>
                </List.Item>
              );
            }}
          />
        ) : (
          <Text type="secondary">No hay archivos adjuntos</Text>
        )}
      </Card>

      {/* Conversación */}
      <Card title="💬 Conversación">
        <div className="mb-4 max-h-96 overflow-y-auto pr-2">
          {ticketTi?.mensajes?.map((mensaje) => (
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

        {estaResuelto ? (
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
        )}
      </Card>
    </div>
  );
}
