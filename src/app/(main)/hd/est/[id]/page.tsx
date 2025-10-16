// app/hd/est/[id]/page.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Skeleton,
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

const ESTADO_META: Record<
  TicketEstado,
  { label: string; color: string; emoji?: string }
> = {
  ABIERTO: { label: "Abierto", color: "blue", emoji: "🟦" },
  ASIGNADO: { label: "Asignado", color: "purple", emoji: "🟪" },
  EN_PROCESO: { label: "En proceso", color: "gold", emoji: "🟨" },
  RESUELTO: { label: "Resuelto", color: "green", emoji: "🟩" },
  CERRADO: { label: "Cerrado", color: "default", emoji: "⬜️" },
  OBSERVADO: { label: "Observado", color: "red", emoji: "🟥" },
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

/* ============  Hook XS/SM  =========== */
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [breakpoint]);
  return isMobile;
}

/* ===============  Tag con ellipsis real  ============== */
function EllipsisTag({ children }: { children?: React.ReactNode }) {
  return (
    <Tag className="max-w-full" title="">
      <Typography.Text
        ellipsis={{ tooltip: false }}
        style={{
          maxWidth: "100%",
          display: "inline-block",
          verticalAlign: "top",
        }}
      >
        {children}
      </Typography.Text>
    </Tag>
  );
}

/* =========================  Calificación (inline)  ======================== */
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
    <Card
      className="mb-6 rounded-2xl shadow-sm"
      title={
        <Space size={8} wrap>
          <span className="text-base sm:text-lg">
            📝 Califica tu experiencia
          </span>
          <Tooltip title="Tu evaluación impulsa la mejora continua (CBE - SUNEDU)">
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      }
    >
      {yaTiene ? (
        <div className="text-center">
          <Text strong>Tu calificación</Text>
          <div className="my-3">
            <Rate
              allowHalf
              disabled
              defaultValue={valorExistente}
              style={{ fontSize: 26 }}
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <Text strong>¿Cómo calificarías la atención recibida?</Text>
            <Rate
              allowClear
              allowHalf
              value={rating}
              onChange={setRating}
              style={{ fontSize: 30 }}
            />
          </div>
          <Input.TextArea
            rows={4}
            placeholder="Cuéntanos brevemente tu experiencia (opcional)…"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="my-3"
            maxLength={500}
            aria-label="Comentario de calificación"
            style={{ paddingBottom: 26, paddingRight: 28 }}
          />
          <div className="mt-2 flex justify-end">
            <Button
              type="primary"
              size="large"
              onClick={handleEnviar}
              disabled={rating === 0}
              loading={enviando}
              aria-label="Enviar calificación"
              className="w-full sm:w-auto"
            >
              Enviar calificación
            </Button>
          </div>
          <div className="mt-3">
            <Text type="secondary" italic>
              Tu opinión nos ayuda a mejorar el servicio de soporte (mejora
              continua).
            </Text>
          </div>
        </>
      )}
    </Card>
  );
}

/* =========================  Chat del Estudiante  ======================== */
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
  const listRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const code = toEstadoKey(ticket?.estado?.codigo);
  const nameKey = toEstadoKey(ticket?.estado?.nombre);

  const enProceso =
    ticket.estado_id === 3 || code === "EN_PROCESO" || nameKey === "EN_PROCESO";
  const esAsignado = code === "ASIGNADO" || nameKey === "ASIGNADO";
  const esCancelado = code === "CERRADO" || nameKey === "CERRADO";
  const esFinalizado =
    ticket.estado_id === 4 ||
    code === "RESUELTO" ||
    nameKey === "RESUELTO" ||
    code === "CERRADO" ||
    nameKey === "CERRADO";

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
      return m.emisor_id !== ticket.titular_id;
    },
    [ticket.titular_id]
  );

  const mensajesOrdenados = useMemo(() => {
    const arr = [...(mensajes || [])];
    return arr.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [mensajes]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [mensajesOrdenados.length]);

  const lastSupportIdx = useMemo(() => {
    for (let i = mensajesOrdenados.length - 1; i >= 0; i--) {
      if (esDeSoporte(mensajesOrdenados[i])) return i;
    }
    return -1;
  }, [mensajesOrdenados, esDeSoporte]);

  const soporteHaEscrito = lastSupportIdx !== -1;

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
      return "El ticket fue CERRADO; no se pueden enviar mensajes.";
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

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
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
        <Space wrap>
          <MessageOutlined />
          <span className="text-sm sm:text-base md:text-lg">Conversación</span>
          <Tag
            color={
              !soporteHaEscrito
                ? "default"
                : excedioCupoUsuario
                ? "red"
                : "blue"
            }
          >
            {(!soporteHaEscrito && "Esperando mensaje inicial de Soporte") ||
              (excedioCupoUsuario
                ? "Límite alcanzado"
                : `Te quedan ${mensajesRestantes} mensaje(s)`)}
          </Tag>
        </Space>
      }
    >
      <div
        className="mb-4 max-h-[60vh] sm:max-h-[28rem] overflow-y-auto pr-1 sm:pr-2 space-y-4"
        id="hilo-ticket-est"
        ref={listRef}
        role="log"
        aria-live="polite"
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
              <div
                key={m.id}
                className={`flex items-start gap-3 ${
                  deSoporte ? "" : "justify-end"
                }`}
              >
                {deSoporte && (
                  <Avatar
                    size="large"
                    icon={<TeamOutlined />}
                    className="bg-blue-100 text-blue-600 shrink-0"
                  />
                )}
                <div
                  className={`${
                    deSoporte ? "" : "text-right"
                  } max-w-[88%] xs:max-w-[86%] sm:max-w-[80%] md:max-w-[70%]`}
                >
                  <div
                    className={`mb-1 flex items-center justify-between ${
                      deSoporte ? "" : "flex-row-reverse"
                    }`}
                  >
                    <Typography.Text className="text-[13px] sm:text-sm" strong>
                      {nombre}
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      className="text-[10px] sm:text-[11px]"
                    >
                      {dayjs(String(m.createdAt)).format("DD/MM/YYYY HH:mm")}
                    </Typography.Text>
                  </div>
                  <div
                    className={`rounded-2xl border p-3 shadow-sm ${
                      deSoporte
                        ? "border-blue-50 bg-white"
                        : "border-emerald-50 bg-emerald-50"
                    }`}
                    style={{
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
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
                          aria-label={`Descargar adjunto ${
                            m.nombre ?? "archivo"
                          }`}
                          className="max-w-full truncate"
                        >
                          {m.nombre ?? "archivo"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {!deSoporte && (
                  <Avatar
                    size="large"
                    icon={<UserOutlined />}
                    className="bg-gray-100 text-gray-600 shrink-0"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      <Divider orientation="left" style={{ marginTop: 8 }}>
        Redactar respuesta
      </Divider>

      {inputsDisabled && (
        <div
          className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
          role="note"
          aria-live="polite"
        >
          <Space>
            <InfoCircleOutlined />
            <Text type="secondary" className="text-xs">
              {disabledReason}
            </Text>
          </Space>
        </div>
      )}

      {/* Redactor */}
      <div className="flex flex-col gap-2 sm:gap-3">
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
          showCount={!isMobile}
          disabled={inputsDisabled}
          aria-label="Caja de redacción de mensaje"
          onKeyDown={handleKeyDown}
          style={{
            paddingBottom: isMobile ? 12 : 26,
            paddingRight: isMobile ? 0 : 28,
          }}
        />
        {isMobile && (
          <div className="text-right text-[11px] text-gray-400">{`${nuevoMensaje.length} / 2000`}</div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sticky sm:static bottom-0 bg-white/80 backdrop-blur-md py-2">
          <Text type="secondary" className="text-[11px] sm:text-xs">
            * Adjuntar archivos no está disponible en esta vista.
          </Text>
          <Space wrap className="w-full sm:w-auto">
            <Button
              type="primary"
              onClick={handleSend}
              loading={sending}
              disabled={inputsDisabled || !nuevoMensaje.trim()}
              aria-label="Enviar mensaje"
              className="w-full sm:w-auto"
            >
              Enviar
            </Button>
          </Space>
        </div>
      </div>
    </Card>
  );
}

/* =========================  Página de Detalle (Estudiante)  ======================== */
export default function TicketDetailStudentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idNum = Number(params?.id);
  const { token } = theme.useToken();
  const isMobile = useIsMobile();

  const [ticket, setTicket] = useState<HD_Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

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
      setFirstLoad(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idNum]);

  const handleSend = async (texto: string) => {
    if (Number.isNaN(idNum) || !texto.trim()) return;
    await createMensaje({ ticket_id: idNum, contenido: texto.trim() });
    await fetchTicket();
  };

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
      <div className="mx-auto max-w-7xl px-3 sm:px-4 pt-4 sm:pt-8">
        <div className="rounded-2xl shadow-lg">
          <div
            className="rounded-2xl backdrop-blur-md px-3 sm:px-6 md:px-10 py-4 sm:py-6"
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            {/* mobile-first en 3 filas */}
            <div className="flex flex-col gap-3">
              {/* Botón */}
              <div className="flex">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push("/hd/est/mis-tickets")}
                  aria-label="Volver a mis tickets"
                  className="w-full sm:w-auto"
                >
                  Mis Tickets
                </Button>
              </div>

              {/* Título */}
              <div className="min-w-0">
                <Title
                  level={isMobile ? 4 : 3}
                  className="m-0 sm:!text-[22px]"
                  style={{ color: token.colorText }}
                >
                  📄 Detalle de Ticket
                </Title>
                <Text
                  style={{ color: token.colorTextSecondary }}
                  className="text-xs sm:text-sm"
                >
                  Revisa el estado y conversa con Soporte.
                </Text>
              </div>

              {/* Chips */}
              <Space size={8} wrap className="justify-start">
                <Tooltip title="Tus datos están protegidos">
                  <SafetyCertificateTwoTone twoToneColor={token.colorSuccess} />
                </Tooltip>
                <Tag color={estadoMeta.color} className="m-0">
                  {estadoMeta.label}
                </Tag>
                {/* Si deseas mostrar el área también aquí, descomenta: */}
                {/* <EllipsisTag>{ticket?.area?.nombre ?? "—"}</EllipsisTag> */}
              </Space>
            </div>

            <Alert
              className="mt-3 sm:mt-4"
              type="info"
              showIcon
              message={
                <span className="text-[12px] sm:text-[13px]">
                  <InfoCircleOutlined /> Te avisaremos por tu correo
                  institucional UMA ante cambios de estado.
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-5 sm:py-8">
        {firstLoad ? (
          <Card
            className="rounded-2xl shadow-sm"
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Skeleton active paragraph={{ rows: 3 }} />
          </Card>
        ) : !ticket ? (
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
              <Button
                onClick={() => router.push("/hd/est/mis-tickets")}
                className="w-full sm:w-auto"
              >
                Volver
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Detalles del ticket */}
            <Card
              className="rounded-2xl shadow-sm mb-6"
              loading={loading}
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
              bodyStyle={{ paddingTop: 16 }}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col min-w-0">
                  <Text type="secondary" className="text-[11px] sm:text-xs">
                    Código
                  </Text>
                  <Text className="text-sm sm:text-base font-semibold truncate">
                    {ticket.codigo || `T-${ticket.id}`}
                  </Text>
                </div>
                <Space wrap>
                  <Tag color={estadoMeta.color}>{estadoMeta.label}</Tag>
                  {/* Área como chip con ellipsis REAL (arriba) */}
                  <div className="max-w-[80vw] sm:max-w-none">
                    <EllipsisTag>{ticket.area?.nombre ?? "—"}</EllipsisTag>
                  </div>
                </Space>
              </div>

              {/* === Detalle responsive === */}
              {isMobile ? (
                // --- Móvil: ficha vertical, sin tabla ---
                <div className="rounded-xl border border-gray-100">
                  {/* Área */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-[11px] text-gray-500 mb-1">Área</div>
                    <Typography.Text style={{ display: "block" }}>
                      {ticket.area?.nombre ?? "—"}
                    </Typography.Text>
                  </div>
                  {/* Descripción */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-[11px] text-gray-500 mb-1">
                      Descripción
                    </div>
                    <Paragraph
                      className="!mb-0 whitespace-pre-wrap"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {ticket.descripcion ?? "—"}
                    </Paragraph>
                  </div>
                  {/* Creado */}
                  <div className="px-4 py-3">
                    <div className="text-[11px] text-gray-500 mb-1">Creado</div>
                    <Text>
                      <FieldTimeOutlined className="mr-1" />
                      {fmt(
                        ticket?.createdAt ? String(ticket.createdAt) : undefined
                      )}
                    </Text>
                  </div>
                </div>
              ) : (
                // --- Desktop: tabla Descriptions ---
                <Descriptions
                  bordered
                  size="middle"
                  column={{ xs: 1, sm: 1, md: 1 }}
                  labelStyle={{ width: 140, whiteSpace: "nowrap" }}
                  contentStyle={{
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  <Descriptions.Item label="Área">
                    <div className="max-w-full overflow-hidden">
                      <Typography.Text
                        ellipsis={{ tooltip: false }}
                        style={{ display: "block", maxWidth: "100%" }}
                      >
                        {ticket.area?.nombre ?? "—"}
                      </Typography.Text>
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Descripción">
                    <Paragraph
                      className="!mb-0 whitespace-pre-wrap"
                      style={{ overflowWrap: "anywhere" }}
                    >
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
              )}
            </Card>

            {/* Calificación si RESUELTO */}
            {(ticket.estado_id === 4 ||
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
