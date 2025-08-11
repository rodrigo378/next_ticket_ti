"use client";

import {
  Card,
  Descriptions,
  Tag,
  Typography,
  List,
  Input,
  Button,
  Timeline,
  Alert,
  Rate,
  Progress,
  Row,
  Col,
} from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { createMensaje, getTicket } from "@/services/ticket_ti";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { Ticket } from "@/interface/ticket_ti";
import { CardOpcionesRapidas } from "@/components/ticket/card";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(relativeTime);
dayjs.locale("es");
dayjs.extend(isSameOrBefore);

const { Title, Text } = Typography;
const { TextArea } = Input;

type ProgressStatus = "success" | "exception" | "normal" | "active";
type EstadoBadge =
  | "En tiempo"
  | "Vencido"
  | "N/A"
  | "Cumplido"
  | "Fuera de tiempo";

export default function Page() {
  const params = useParams();
  const id = params.id as string;

  const [ticketData, setTicketData] = useState<Ticket | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");

  const fetchTicket = async (idStr: string) => {
    try {
      const data = await getTicket(Number(idStr));
      setTicketData(data);
    } catch (error) {
      console.error("Error al obtener ticket:", error);
    }
  };

  const handleEnviarMensaje = async () => {
    try {
      await createMensaje({
        ticket_id: Number(id),
        contenido: nuevoMensaje,
      });
      const res = await getTicket(Number(id));
      setTicketData(res);
      setNuevoMensaje("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  useEffect(() => {
    fetchTicket(id);
  }, [id]);

  // ---------- Helpers de SLA ----------
  const nowForRespuesta = (t?: Ticket | null) =>
    t?.respondidoAt ? dayjs(t.respondidoAt) : dayjs();

  const nowForResolucion = (t?: Ticket | null) =>
    t?.finalizadoAt ? dayjs(t.finalizadoAt) : dayjs();

  const calcPercent = (
    start?: string | Date,
    end?: string | Date,
    nowRef?: dayjs.Dayjs
  ): number => {
    if (!start || !end) return 0;
    const s = dayjs(start);
    const e = dayjs(end);
    const now = nowRef ?? dayjs();
    if (!s.isValid() || !e.isValid()) return 0;

    const total = e.diff(s); // ms
    if (total <= 0) return 100;

    const trans = Math.min(Math.max(now.diff(s), 0), total);
    return Math.floor((trans / total) * 100); // floor para estabilidad entre vistas
  };

  const humanRemaining = (
    end?: string | Date,
    nowRef?: dayjs.Dayjs
  ): string => {
    if (!end) return "—";
    const e = dayjs(end);
    const now = nowRef ?? dayjs();
    if (!e.isValid()) return "—";
    if (now.isAfter(e)) return "Vencido";
    return `Faltan ${e.toNow(true)}`;
  };

  // ---- Estado general ----
  const estaResuelto = ticketData?.estado_id === 4;

  // ---- Calificación (solo lectura) ----
  const yaTieneCalificacion = useMemo(
    () => Boolean(ticketData?.CalificacionTicket),
    [ticketData]
  );
  const valorCalificacion = Number(
    ticketData?.CalificacionTicket?.calificacion || 0
  );

  // ---- SLA de ESTE ticket (inicio = asignadoAt) ----
  const asignadoAt = ticketData?.asignadoAt
    ? dayjs(ticketData.asignadoAt)
    : null;

  const estimadoResp = ticketData?.slaTicket?.tiempo_estimado_respuesta
    ? dayjs(ticketData.slaTicket.tiempo_estimado_respuesta)
    : null;

  const estimadoRes = ticketData?.slaTicket?.tiempo_estimado_resolucion
    ? dayjs(ticketData.slaTicket.tiempo_estimado_resolucion)
    : null;

  // Congelar "ahora" por métrica:
  const respNow = nowForRespuesta(ticketData);
  const resoNow = nowForResolucion(ticketData);

  // ----- RESPUESTA: congelar al tener respondidoAt -----
  const responded = Boolean(ticketData?.respondidoAt);
  const respondedAt = ticketData?.respondidoAt
    ? dayjs(ticketData.respondidoAt)
    : null;

  const respCumplido =
    responded && estimadoResp
      ? respondedAt!.isSameOrBefore(estimadoResp)
      : undefined;

  const respPercentFinal = responded
    ? 100
    : calcPercent(
        ticketData?.asignadoAt,
        ticketData?.slaTicket?.tiempo_estimado_respuesta,
        respNow
      );

  const respStatus: ProgressStatus = responded
    ? respCumplido
      ? "success"
      : "exception"
    : humanRemaining(
        ticketData?.slaTicket?.tiempo_estimado_respuesta,
        respNow
      ) === "Vencido"
    ? "exception"
    : "active";

  const respBadgeText: EstadoBadge = responded
    ? respCumplido
      ? "Cumplido"
      : "Fuera de tiempo"
    : humanRemaining(
        ticketData?.slaTicket?.tiempo_estimado_respuesta,
        respNow
      ) === "Vencido"
    ? "Vencido"
    : estimadoResp && asignadoAt
    ? "En tiempo"
    : "N/A";

  const respRemaining = humanRemaining(
    ticketData?.slaTicket?.tiempo_estimado_respuesta,
    respNow
  );

  // ----- RESOLUCIÓN: congelar con finalizadoAt igual que respuesta -----
  const finalized = Boolean(ticketData?.finalizadoAt);
  const finalizedAt = ticketData?.finalizadoAt
    ? dayjs(ticketData.finalizadoAt)
    : null;

  const resCumplido =
    finalized && estimadoRes
      ? finalizedAt!.isSameOrBefore(estimadoRes)
      : undefined;

  const resPercentFinal = finalized
    ? 100
    : calcPercent(
        ticketData?.asignadoAt,
        ticketData?.slaTicket?.tiempo_estimado_resolucion,
        resoNow
      );

  const resStatus: ProgressStatus = finalized
    ? resCumplido
      ? "success"
      : "exception"
    : humanRemaining(
        ticketData?.slaTicket?.tiempo_estimado_resolucion,
        resoNow
      ) === "Vencido"
    ? "exception"
    : "active";

  const resBadgeText: EstadoBadge = finalized
    ? resCumplido
      ? "Cumplido"
      : "Fuera de tiempo"
    : humanRemaining(
        ticketData?.slaTicket?.tiempo_estimado_resolucion,
        resoNow
      ) === "Vencido"
    ? "Vencido"
    : estimadoRes && asignadoAt
    ? "En tiempo"
    : "N/A";

  const resoRemaining = humanRemaining(
    ticketData?.slaTicket?.tiempo_estimado_resolucion,
    resoNow
  );

  const colorBadge = (estado: EstadoBadge) =>
    estado === "En tiempo" || estado === "Cumplido"
      ? "green"
      : estado === "Vencido" || estado === "Fuera de tiempo"
      ? "red"
      : "default";

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4 bg-white rounded-xl shadow-sm">
      <CardOpcionesRapidas
        ticket={ticketData as Ticket}
        onTicketUpdate={() => fetchTicket(id)}
      />

      {/* Calificación (solo lectura si existe y está resuelto) */}
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
              {ticketData?.CalificacionTicket?.comentario ? (
                <Text type="secondary" italic>
                  “{ticketData.CalificacionTicket.comentario}”
                </Text>
              ) : (
                <Text type="secondary" italic>
                  Gracias por su evaluación.
                </Text>
              )}
              <div className="text-xs text-gray-500 mt-2">
                {dayjs(ticketData?.CalificacionTicket?.createdAt).fromNow()}
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

      {/* ⏱️ SLA SÓLO DE ESTE TICKET (inicio = asignadoAt) */}
      <Card title="⏱️ SLA del Ticket" className="mb-6">
        <Row gutter={[16, 16]}>
          {/* RESPUESTA */}
          <Col xs={24} md={12}>
            <Card size="small">
              <Text strong>Tiempo de RESPUESTA</Text>
              <div className="mt-2 text-sm text-gray-600">
                Inicio:{" "}
                {asignadoAt ? asignadoAt.format("DD/MM/YYYY HH:mm") : "—"}
                <br />
                Vence:{" "}
                {estimadoResp ? estimadoResp.format("DD/MM/YYYY HH:mm") : "—"}
                {respondedAt && (
                  <>
                    <br />
                    Respondido: {respondedAt.format("DD/MM/YYYY HH:mm")}
                  </>
                )}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <Progress
                  type="circle"
                  percent={respPercentFinal}
                  status={respStatus}
                />
                <Tag color={colorBadge(respBadgeText)}>{respBadgeText}</Tag>
              </div>

              <div className="text-xs text-gray-500">
                {respondedAt
                  ? respCumplido
                    ? "Respondido dentro del SLA"
                    : `Respondido ${respondedAt.to(
                        estimadoResp!,
                        true
                      )} después del límite`
                  : respRemaining}
              </div>
            </Card>
          </Col>

          {/* RESOLUCIÓN */}
          <Col xs={24} md={12}>
            <Card size="small">
              <Text strong>Tiempo de RESOLUCIÓN</Text>
              <div className="mt-2 text-sm text-gray-600">
                Inicio:{" "}
                {asignadoAt ? asignadoAt.format("DD/MM/YYYY HH:mm") : "—"}
                <br />
                Vence:{" "}
                {estimadoRes ? estimadoRes.format("DD/MM/YYYY HH:mm") : "—"}
                {finalizedAt && (
                  <>
                    <br />
                    Finalizado: {finalizedAt.format("DD/MM/YYYY HH:mm")}
                  </>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Progress
                  type="circle"
                  percent={resPercentFinal}
                  status={resStatus}
                />
                <Tag color={colorBadge(resBadgeText)}>{resBadgeText}</Tag>
              </div>
              <div className="text-xs text-gray-500">
                {finalizedAt
                  ? resCumplido
                    ? "Resuelto dentro del SLA"
                    : `Resuelto ${finalizedAt.to(
                        estimadoRes!,
                        true
                      )} después del límite`
                  : resoRemaining}
              </div>
            </Card>
          </Col>
        </Row>

        {typeof ticketData?.slaTicket?.cumplido === "boolean" && (
          <Alert
            className="mt-4"
            type={ticketData.slaTicket.cumplido ? "success" : "warning"}
            showIcon
            message={
              ticketData.slaTicket.cumplido
                ? "SLA global marcado como CUMPLIDO"
                : "SLA global NO cumplido"
            }
            description="Este estado viene del backend (slaTicket.cumplido)."
          />
        )}
      </Card>

      {/* Historial de derivación */}
      {ticketData?.DerivacionTicket &&
        ticketData.DerivacionTicket.length > 0 && (
          <Card title="🔁 Historial de Derivación" className="mb-6">
            <Timeline
              mode="left"
              items={ticketData.DerivacionTicket.map((derivacion) => ({
                label: dayjs(derivacion.createdAt).format("DD/MM/YYYY HH:mm"),
                children: (
                  <div className="pl-2">
                    <p>
                      <Tag color="gold">Derivado desde</Tag>{" "}
                      <strong>{derivacion.de_area?.nombre}</strong> →{" "}
                      <strong>
                        {ticketData?.categoria?.incidencia?.categoria?.[0]
                          ?.subarea?.area?.nombre ||
                          "Área destino no especificada"}
                      </strong>
                    </p>
                    <p>
                      <Tag color="cyan">Categoría</Tag>{" "}
                      <span className="text-gray-700">
                        {derivacion.categoria?.nombre}
                      </span>{" "}
                      →{" "}
                      <span className="text-gray-700">
                        {ticketData?.categoria?.nombre}
                      </span>
                    </p>
                    <p>
                      <Tag color="blue">Motivo</Tag>{" "}
                      <Text type="secondary" italic>
                        {derivacion.motivo || "No especificado"}
                      </Text>
                    </p>
                  </div>
                ),
              }))}
            />
          </Card>
        )}

      {/* Detalle del ticket */}
      <Title level={3}>🎟️ Detalle del Ticket</Title>
      <Card className="mb-6">
        <Descriptions column={1} size="middle" bordered>
          <Descriptions.Item label="Código">
            {ticketData?.codigo}
          </Descriptions.Item>
          <Descriptions.Item label="Tipo">
            {ticketData?.categoria?.incidencia?.tipo}
          </Descriptions.Item>
          <Descriptions.Item label={ticketData?.categoria?.incidencia?.tipo}>
            {ticketData?.categoria?.incidencia?.nombre}
          </Descriptions.Item>
          <Descriptions.Item label="Categoría">
            {ticketData?.categoria?.nombre}
          </Descriptions.Item>
          <Descriptions.Item label="Descripción">
            {ticketData?.descripcion}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color="blue">{ticketData?.estado?.nombre}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Prioridad">
            <Tag color="red">{ticketData?.prioridad?.nombre}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de asignación">
            {ticketData?.asignadoAt
              ? dayjs(ticketData.asignadoAt).format("DD/MM/YYYY HH:mm")
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de creación">
            {ticketData?.createdAt
              ? dayjs(ticketData.createdAt).format("DD/MM/YYYY HH:mm")
              : "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Archivos adjuntos */}
      <Card title="📎 Archivos Adjuntos" className="mb-6">
        {ticketData?.documentos?.length ? (
          <List
            dataSource={ticketData.documentos}
            renderItem={(doc) => {
              const fileUrl = `http://localhost:4000${doc.url.replace(
                /\\/g,
                "/"
              )}`;
              return (
                <List.Item>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    <PaperClipOutlined /> {doc.nombre}
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
          {ticketData?.mensajes?.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`mb-4 p-3 rounded-lg max-w-md ${
                mensaje.emisor?.nombre === "Técnico"
                  ? "bg-blue-50 text-right ml-auto"
                  : "bg-gray-100 text-left"
              }`}
            >
              <Text strong>{mensaje?.emisor?.nombre}</Text>
              <div className="text-gray-500 text-sm">
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
          <Button type="primary" className="mt-2" onClick={handleEnviarMensaje}>
            Enviar
          </Button>
        </div>
      </Card>
    </div>
  );
}
