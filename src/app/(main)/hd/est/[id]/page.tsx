// app/hd/est/[id]/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Typography,
  Tag,
  Tooltip,
  Alert,
  Button,
  Descriptions,
  Avatar,
  Empty,
  Space,
  Divider,
  message,
  Rate,
  Input,
  theme,
} from "antd";
import {
  ArrowLeftOutlined,
  SafetyCertificateTwoTone,
  InfoCircleOutlined,
  FieldTimeOutlined,
  UserOutlined,
  TeamOutlined,
  DownloadOutlined,
  MessageOutlined,
} from "@ant-design/icons";

import TextArea from "antd/es/input/TextArea";
import { useParams, useRouter } from "next/navigation";
import dayjs from "@shared/date/dayjs";
import { HD_MensajeTicket, HD_Ticket } from "@interfaces/hd";
import { createCalificacion, createMensaje } from "@services/hd";

const { Title, Text, Paragraph } = Typography;

type TicketEstado =
  | "ABIERTO"
  | "ASIGNADO"
  | "EN_PROCESO"
  | "RESUELTO"
  | "CERRADO"
  | "OBSERVADO";

const ESTADO_META: Record<TicketEstado, { label: string; color: string }> = {
  ABIERTO: { label: "Abierto", color: "blue" },
  ASIGNADO: { label: "Asignado", color: "purple" },
  EN_PROCESO: { label: "En proceso", color: "gold" },
  RESUELTO: { label: "Resuelto", color: "green" },
  CERRADO: { label: "Cerrado", color: "default" },
  OBSERVADO: { label: "Observado", color: "red" },
};

const fmt = (iso?: string) =>
  iso ? dayjs(iso).format("DD/MM/YYYY HH:mm") : "—";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

// Normaliza claves de estado ("EN PROCESO" -> "EN_PROCESO")
const toEstadoKey = (v?: string): TicketEstado => {
  const key = (v || "ABIERTO").toUpperCase().replace(/\s+/g, "_");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (ESTADO_META as any)[key] ? (key as TicketEstado) : "ABIERTO";
};

/* =========================
   Calificación (inline)
========================= */
function CardCalificacionInline({
  ticket,
  onCrear,
}: {
  ticket: HD_Ticket;
  onCrear: (value: number, comentario?: string) => Promise<void>;
}) {
  const yaTiene = Boolean(ticket?.calificacionTicket);
  const [rating, setRating] = useState<number>(0);
  const [comentario, setComentario] = useState<string>("");
  const [enviando, setEnviando] = useState(false);

  const valorExistente = ticket?.calificacionTicket?.calificacion
    ? Number(ticket.calificacionTicket.calificacion)
    : 0;

  const handleEnviar = async () => {
    if (rating <= 0) return;
    try {
      setEnviando(true);
      await onCrear(rating, comentario.trim() || undefined);
      message.success("¡Gracias por tu calificación!");
      setRating(0);
      setComentario("");
    } catch {
      message.error("No se pudo registrar la calificación.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Card className="mb-6" title="📝 Califica tu experiencia">
      {yaTiene ? (
        <div className="text-center">
          <Text strong>Tu calificación</Text>
          <div className="my-3">
            <Rate
              allowHalf
              disabled
              defaultValue={valorExistente}
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
          <div className="mt-2 text-xs" style={{ color: "#64748b" }}>
            {ticket?.calificacionTicket?.createdAt
              ? dayjs(String(ticket.calificacionTicket.createdAt)).fromNow()
              : ""}
          </div>
        </div>
      ) : (
        <>
          <Text strong>¿Cómo calificarías la atención recibida?</Text>
          <div className="my-4 flex justify-center">
            <Rate
              allowClear
              allowHalf
              value={rating}
              onChange={setRating}
              style={{ fontSize: 34 }}
            />
          </div>
          <Input.TextArea
            rows={4}
            placeholder="Cuéntanos brevemente tu experiencia (opcional)…"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="my-3"
          />
          <div className="mt-2 flex justify-center">
            <Button
              type="primary"
              size="large"
              onClick={handleEnviar}
              disabled={rating === 0}
              loading={enviando}
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
    </Card>
  );
}

/* =========================
   Chat del Estudiante
   - Solo EN_PROCESO
   - Debe existir un mensaje previo de Soporte/Administrativo
   - Máx 3 respuestas del alumno desde el último mensaje de soporte
========================= */
function CardChatEstudiante({
  ticket,
  onSend,
}: {
  ticket: HD_Ticket;
  onSend: (texto: string) => Promise<void> | void;
}) {
  const mensajes = useMemo(() => ticket.mensajes ?? [], [ticket.mensajes]);
  const [nuevoMensaje, setNuevoMensaje] = useState<string>("");
  const [sending, setSending] = useState(false);

  const code = toEstadoKey(ticket?.estado?.codigo);
  const nameKey = toEstadoKey(ticket?.estado?.nombre);

  const enProceso =
    ticket.estado_id === 3 || code === "EN_PROCESO" || nameKey === "EN_PROCESO";
  const esAsignado = code === "ASIGNADO" || nameKey === "ASIGNADO";
  const esCancelado = code === "CERRADO" || nameKey === "CERRADO"; // si además tienes CANCELADO por id/código, ajusta aquí
  const esFinalizado =
    ticket.estado_id === 4 ||
    code === "RESUELTO" ||
    nameKey === "RESUELTO" ||
    code === "CERRADO" ||
    nameKey === "CERRADO";

  // Detectar si un mensaje es de Soporte/Administrativo (no estudiante)
  const esDeSoporte = useCallback(
    (m: HD_MensajeTicket) => {
      const rol = m?.emisor?.rol?.nombre?.toLowerCase?.() ?? "";
      const soporteTokens = [
        "soporte",
        "administrativo",
        "admin",
        "mesa",
        "ti",
        "n1",
        "n2",
        "n3",
        "n4",
        "n5",
        "operador",
      ];
      if (rol && soporteTokens.some((tok) => rol.includes(tok))) return true;
      // fallback: cualquier emisor distinto del creador del ticket se considera "soporte"
      return m.emisor_id !== ticket.creado_id;
    },
    [ticket.creado_id]
  );

  // Orden cronológico
  const mensajesOrdenados = useMemo(() => {
    const arr = [...(mensajes || [])];
    return arr.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [mensajes]);

  // Índice del último mensaje de soporte
  const lastSupportIdx = useMemo(() => {
    for (let i = mensajesOrdenados.length - 1; i >= 0; i--) {
      if (esDeSoporte(mensajesOrdenados[i])) return i;
    }
    return -1;
  }, [mensajesOrdenados, esDeSoporte]);

  const soporteHaEscrito = lastSupportIdx !== -1;

  // Contar respuestas del alumno desde el último soporte
  const userReplyCountSinceSupport = useMemo(() => {
    if (lastSupportIdx === -1) return 0;
    let c = 0;
    for (let i = lastSupportIdx + 1; i < mensajesOrdenados.length; i++) {
      if (!esDeSoporte(mensajesOrdenados[i])) c++;
    }
    return c;
  }, [lastSupportIdx, mensajesOrdenados, esDeSoporte]);

  const LIMITE_REPLIES = 3;
  const excedioCupoUsuario =
    lastSupportIdx >= 0 && userReplyCountSinceSupport >= LIMITE_REPLIES;

  const inputsDisabled =
    !ticket ||
    esCancelado ||
    esFinalizado ||
    esAsignado ||
    !enProceso ||
    !soporteHaEscrito ||
    excedioCupoUsuario;

  const disabledReason = (() => {
    if (!ticket) return "El ticket no está disponible.";
    if (esAsignado)
      return "No puedes escribir: el ticket está ASIGNADO. Espera a que Soporte te contacte.";
    if (esCancelado)
      return "El ticket fue CANCELADO; no se pueden enviar mensajes.";
    if (esFinalizado)
      return "El ticket ha sido resuelto/cerrado; la conversación está cerrada.";
    if (!enProceso)
      return "La conversación se habilita cuando el ticket está EN PROCESO.";
    if (!soporteHaEscrito)
      return "Espera el primer mensaje de Soporte para poder escribir.";
    if (excedioCupoUsuario)
      return `Has alcanzado el máximo de ${LIMITE_REPLIES} respuestas. Espera una respuesta del Soporte para continuar.`;
    return null;
  })();

  const handleSend = async () => {
    if (inputsDisabled) return;
    if (!nuevoMensaje.trim()) {
      message.info("Escribe un mensaje.");
      return;
    }
    try {
      setSending(true);
      await onSend(nuevoMensaje.trim());
      setNuevoMensaje("");
      message.success("Mensaje enviado.");
    } catch {
      message.error("No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  };

  const mensajesRestantes =
    LIMITE_REPLIES -
    Math.min(
      lastSupportIdx === -1 ? 0 : userReplyCountSinceSupport,
      LIMITE_REPLIES
    );

  return (
    <Card
      className="mb-6 rounded-2xl shadow-sm"
      title={
        <Space>
          <MessageOutlined />
          <span>Conversación</span>
          <Tag
            color={
              !soporteHaEscrito
                ? "default"
                : excedioCupoUsuario
                ? "red"
                : "blue"
            }
          >
            {(!soporteHaEscrito && "Esperando respuesta de Soporte") ||
              (excedioCupoUsuario
                ? "Límite alcanzado"
                : `Te quedan ${mensajesRestantes} mensaje(s)`)}
          </Tag>
        </Space>
      }
    >
      <div
        className="mb-4 max-h-96 overflow-y-auto pr-2 space-y-4"
        id="hilo-ticket-est"
      >
        {mensajesOrdenados.length === 0 ? (
          <Empty description="Sin mensajes en este ticket" />
        ) : (
          mensajesOrdenados.map((m) => {
            const deSoporte = esDeSoporte(m);
            const nombre =
              [m.emisor?.nombre, m.emisor?.apellidos]
                .filter(Boolean)
                .join(" ") || (deSoporte ? "Soporte" : "Usuario");
            return (
              <div key={m.id} className="flex gap-3 items-start">
                <Avatar
                  size="large"
                  icon={deSoporte ? <TeamOutlined /> : <UserOutlined />}
                  className={
                    deSoporte
                      ? "bg-blue-100 text-blue-600 me-3"
                      : "bg-gray-100 text-gray-600 me-3"
                  }
                />
                <div className="flex-1" style={{ paddingLeft: 10 }}>
                  <div className="flex items-center justify-between">
                    <Typography.Text strong>{nombre}</Typography.Text>
                    <Typography.Text type="secondary" className="text-xs">
                      {dayjs(String(m.createdAt)).format("DD/MM/YYYY HH:mm")}
                    </Typography.Text>
                  </div>
                  <div className="mt-1 rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                    {m.contenido && (
                      <Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                        {m.contenido}
                      </Paragraph>
                    )}
                    {m.url && (
                      <div className="mt-2">
                        <Button
                          size="small"
                          type="link"
                          icon={<DownloadOutlined />}
                          href={m.url}
                          target="_blank"
                        >
                          {m.nombre ?? "archivo"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Divider orientation="left" style={{ marginTop: 8 }}>
        Redactar respuesta
      </Divider>

      {inputsDisabled && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Space>
            <InfoCircleOutlined />
            <Text type="secondary" className="text-xs">
              {disabledReason}
            </Text>
          </Space>
        </div>
      )}

      {/* Redactor (solo texto; adjuntos no soportados en createMensaje) */}
      <div className="flex flex-col gap-3">
        <TextArea
          rows={4}
          autoSize={{ minRows: 4, maxRows: 6 }}
          placeholder={
            inputsDisabled
              ? "La redacción está deshabilitada."
              : "Escribe tu mensaje..."
          }
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          maxLength={2000}
          showCount
          disabled={inputsDisabled}
        />

        <div className="flex justify-between items-center">
          <Text type="secondary" className="text-xs">
            * Adjuntar archivos no está disponible en esta vista.
          </Text>
          <Space>
            <Button
              type="primary"
              onClick={handleSend}
              loading={sending}
              disabled={inputsDisabled || !nuevoMensaje.trim()}
            >
              Enviar
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
}

/* =========================
   Página de Detalle (Estudiante)
========================= */
export default function TicketDetailStudentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idNum = Number(params?.id);
  const { token } = theme.useToken();

  const [ticket, setTicket] = useState<HD_Ticket | null>(null);
  const [loading, setLoading] = useState(false);

  const estadoActual = toEstadoKey(
    ticket?.estado?.codigo || ticket?.estado?.nombre || "ABIERTO"
  );
  const estadoMeta = ESTADO_META[estadoActual] || ESTADO_META.ABIERTO;

  const fetchTicket = async () => {
    if (Number.isNaN(idNum)) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/hd/ticket/${idNum}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al cargar ticket");
      const data = (await res.json()) as HD_Ticket;
      setTicket(data);
    } catch {
      message.error("No se pudo cargar el ticket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idNum]);

  // Enviar mensaje usando el servicio createMensaje (solo texto)
  const handleSend = async (texto: string) => {
    if (Number.isNaN(idNum) || !texto.trim()) return;
    await createMensaje({ ticket_id: idNum, contenido: texto.trim() });
    await fetchTicket();
  };

  // Crear calificación usando el servicio createCalificacion
  const crearCalificacion = async (value: number, comentario?: string) => {
    if (Number.isNaN(idNum)) return;
    try {
      await createCalificacion({
        ticket_id: idNum,
        calificacion: value,
        comentario,
      });
      await fetchTicket();
      message.success("¡Gracias por tu calificación!");
    } catch {
      message.error("Error al calificar");
    }
  };

  return (
    <div
      className="min-h-[100dvh]"
      style={{
        background: `linear-gradient(to bottom, ${token.colorFillTertiary}, ${token.colorBgLayout})`,
      }}
    >
      {/* HERO */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div
          className="rounded-2xl p-[1px] shadow-lg"
          style={
            {
              // background: `linear-gradient(135deg, ${token.colorPrimary}CC, ${token.colorPrimaryHover}CC 60%, ${token.colorPrimaryActive}CC)`,
            }
          }
        >
          <div
            className="rounded-2xl backdrop-blur-md px-6 py-6 md:px-10"
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push("/hd/est/mis-tickets")}
                >
                  Mis Tickets
                </Button>
                <div>
                  <Title
                    level={3}
                    className="m-0"
                    style={{ color: token.colorText }}
                  >
                    📄 Detalle de Ticket
                  </Title>
                  <Text style={{ color: token.colorTextSecondary }}>
                    Revisa el estado y conversa con Soporte.
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip title="Tus datos están protegidos">
                  <SafetyCertificateTwoTone twoToneColor={token.colorSuccess} />
                </Tooltip>
                <Tag color={estadoMeta.color}>{estadoMeta.label}</Tag>
                <Tag color="blue">{ticket?.area?.nombre ?? "—"}</Tag>
              </div>
            </div>

            <Alert
              className="mt-4"
              type="info"
              showIcon
              message={
                <span className="text-[13px]">
                  <InfoCircleOutlined /> Te avisaremos por tu correo
                  institucional UMA ante cambios de estado.
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {!ticket ? (
          <Card
            className="rounded-2xl shadow-sm"
            loading={loading}
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Empty description="No se encontró el ticket solicitado" />
            <div className="mt-4">
              <Button onClick={() => router.push("/hd/est/mis-tickets")}>
                Volver
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <Card
              className="rounded-2xl shadow-sm mb-6"
              loading={loading}
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col">
                  <Text type="secondary" className="text-xs">
                    Código
                  </Text>
                  <Text className="text-base font-semibold">
                    {ticket.codigo || `T-${ticket.id}`}
                  </Text>
                </div>
                <Space>
                  <Tag color={estadoMeta.color}>{estadoMeta.label}</Tag>
                  <Tag>{ticket.area?.nombre ?? "—"}</Tag>
                </Space>
              </div>

              <Descriptions
                bordered
                size="middle"
                column={1}
                labelStyle={{ width: 220 }}
              >
                <Descriptions.Item label="Área">
                  <Tag>{ticket.area?.nombre ?? "—"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Descripción">
                  <Paragraph className="!mb-0 whitespace-pre-wrap">
                    {ticket.descripcion ?? "—"}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="Creado">
                  <FieldTimeOutlined className="mr-1" />
                  {fmt(
                    ticket?.createdAt ? String(ticket.createdAt) : undefined
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Calificación si RESUELTO */}
            {ticket &&
              (ticket.estado_id === 4 ||
                toEstadoKey(ticket.estado?.codigo) === "RESUELTO" ||
                toEstadoKey(ticket.estado?.nombre) === "RESUELTO") && (
                <CardCalificacionInline
                  ticket={ticket}
                  onCrear={crearCalificacion}
                />
              )}

            {/* Chat */}
            <CardChatEstudiante ticket={ticket} onSend={handleSend} />
          </>
        )}
      </div>
    </div>
  );
}
