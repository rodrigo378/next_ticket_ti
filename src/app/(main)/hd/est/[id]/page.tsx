// app/hd/est/[id]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Upload,
  message,
  Rate,
  Input,
} from "antd";
import {
  ArrowLeftOutlined,
  SafetyCertificateTwoTone,
  InfoCircleOutlined,
  FieldTimeOutlined,
  UserOutlined,
  TeamOutlined,
  PaperClipOutlined,
  SendOutlined,
  DownloadOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import type { UploadFile } from "antd/es/upload/interface";
import { useParams, useRouter } from "next/navigation";

import { createCalificacion } from "@/features/hd/service/ticket_ti";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

dayjs.extend(relativeTime);
dayjs.locale("es");

const { Title, Text, Paragraph } = Typography;

// ====== Tipos mínimos (solo lo que usa estudiante) ======
type TicketEstado =
  | "ABIERTO"
  | "ASIGNADO"
  | "EN_PROCESO"
  | "RESUELTO"
  | "CERRADO"
  | "OBSERVADO";

type Rol = { nombre: string };
type Usuario = { nombre?: string; apellidos?: string; rol?: Rol };

type HD_MensajeTicket = {
  id: number;
  contenido?: string;
  url?: string;
  nombre?: string;
  createdAt: string; // ISO
  emisor?: Usuario;
};

type Area = { nombre?: string };
type Estado = { nombre?: string };

type CalificacionTicket = {
  calificacion: number | string;
  comentario?: string;
  createdAt?: string;
};

type HD_Ticket = {
  id: number;
  codigo?: string;
  estado?: Estado;
  estado_id?: number;
  area?: Area;
  descripcion?: string;
  createdAt?: string;
  mensajes?: HD_MensajeTicket[];
  chatBloqueado?: boolean;
  calificacionTicket?: CalificacionTicket | null;
};

// ====== Helpers UI ======
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

// ====== Calificación (inline) ======
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
          <div className="mt-2 text-xs text-gray-500">
            {ticket?.calificacionTicket?.createdAt
              ? dayjs(ticket.calificacionTicket.createdAt).fromNow()
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

// ====== Chat (estudiante) ======
function CardChatEstudiante({
  ticket,
  onSend,
}: {
  ticket: HD_Ticket;
  onSend: (texto: string, archivos: UploadFile[]) => Promise<void> | void;
}) {
  const mensajes = useMemo(() => ticket.mensajes ?? [], [ticket.mensajes]);
  const [nuevoMensaje, setNuevoMensaje] = useState<string>("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [sending, setSending] = useState(false);

  const estadoNom = (ticket?.estado?.nombre || "").toUpperCase() as
    | TicketEstado
    | string;
  const enProceso = estadoNom === "EN_PROCESO";
  const esAsignado = estadoNom === "ASIGNADO";
  const esCancelado = estadoNom === "CANCELADO";
  const esFinalizado =
    estadoNom === "FINALIZADO" ||
    estadoNom === "CERRADO" ||
    estadoNom === "RESUELTO";

  const soporteHaEscrito = useMemo(
    () =>
      (mensajes || []).some(
        (m) => m.emisor?.rol?.nombre?.toLowerCase() === "soporte"
      ),
    [mensajes]
  );

  const inputsDisabled =
    !ticket ||
    esCancelado ||
    esFinalizado ||
    esAsignado ||
    !enProceso ||
    !soporteHaEscrito ||
    ticket.chatBloqueado === true;

  const disabledReason = (() => {
    if (!ticket) return "El ticket no está disponible.";
    if (ticket.chatBloqueado) return "El chat está bloqueado por Soporte.";
    if (esAsignado)
      return "No puedes escribir: el ticket está ASIGNADO. Espera a que Soporte te contacte.";
    if (esCancelado)
      return "El ticket fue CANCELADO; no se pueden enviar mensajes.";
    if (esFinalizado)
      return "El ticket ha sido resuelto/cerrado; la conversación está cerrada.";
    if (!enProceso)
      return "La conversación se habilita cuando el ticket está EN PROCESO.";
    if (!soporteHaEscrito)
      return "Espera el primer mensaje de Soporte para continuar la conversación.";
    return null;
  })();

  const mensajesOrdenados = useMemo(() => {
    const arr = [...(mensajes || [])];
    return arr.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [mensajes]);

  const handleSend = async () => {
    if (inputsDisabled) return;
    if (!nuevoMensaje.trim() && fileList.length === 0) {
      message.info("Escribe un mensaje o adjunta un archivo.");
      return;
    }
    try {
      setSending(true);
      await onSend(nuevoMensaje.trim(), fileList);
      setNuevoMensaje("");
      setFileList([]);
      message.success("Mensaje enviado.");
    } catch {
      message.error("No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card
      className="mb-6 rounded-2xl border-slate-200 shadow-sm"
      title={
        <Space>
          <MessageOutlined />
          <span>Conversación</span>
        </Space>
      }
    >
      {/* Hilo */}
      <div
        className="mb-4 max-h-96 overflow-y-auto pr-2 space-y-4"
        id="hilo-ticket-est"
      >
        {mensajesOrdenados.length === 0 ? (
          <Empty description="Sin mensajes en este ticket" />
        ) : (
          mensajesOrdenados.map((m) => {
            const deSoporte =
              m.emisor?.rol?.nombre?.toLowerCase() === "soporte";
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
                      {dayjs(m.createdAt).format("DD/MM/YYYY HH:mm")}
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

      {/* Redactor */}
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

        <Upload.Dragger
          className="mb-3 mt-1"
          multiple
          fileList={fileList}
          onChange={(info) => setFileList(info.fileList)}
          beforeUpload={() => false}
          itemRender={(originNode) => originNode}
          disabled={inputsDisabled}
        >
          <p className="ant-upload-drag-icon">
            <PaperClipOutlined />
          </p>
          <p className="ant-upload-text">Adjuntar archivos</p>
          <p className="ant-upload-hint">PDF, imágenes, docs. Máx. 10MB c/u.</p>
        </Upload.Dragger>

        <div className="flex justify-end items-center">
          <Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={sending}
              disabled={
                inputsDisabled ||
                (!nuevoMensaje.trim() && fileList.length === 0)
              }
            >
              Enviar
            </Button>
          </Space>
        </div>

        <Text type="secondary" className="text-xs">
          Nota: evita compartir información sensible.
        </Text>
      </div>
    </Card>
  );
}

// ====== Página de Detalle (Estudiante) ======
export default function TicketDetailStudentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idNum = Number(params?.id);

  const [ticket, setTicket] = useState<HD_Ticket | null>(null);
  const [loading, setLoading] = useState(false);

  const estadoActual =
    ((ticket?.estado?.nombre || "ABIERTO").toUpperCase() as TicketEstado) ||
    "ABIERTO";
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
    } catch (e) {
      console.log("e => ", e);

      message.error("No se pudo cargar el ticket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idNum]);

  const handleSend = async (texto: string, archivos: UploadFile[]) => {
    if (Number.isNaN(idNum)) return;
    const fd = new FormData();
    if (texto) fd.append("contenido", texto);
    (archivos || []).forEach((f) => {
      if (f.originFileObj) fd.append("archivos", f.originFileObj as File);
    });

    const res = await fetch(`${API}/hd/ticket/${idNum}/mensaje`, {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al enviar mensaje");
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
    } catch (err) {
      console.error(err);
      message.error("Error al calificar");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-sky-50 via-white to-white">
      {/* HERO */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 p-[1px] shadow-lg">
          <div className="rounded-2xl bg-white/80 backdrop-blur-md px-6 py-6 md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push("/hd/est/mis-tickets")}
                >
                  Mis Tickets
                </Button>
                <div>
                  <Title level={3} className="m-0 !text-slate-900">
                    📄 Detalle de Ticket
                  </Title>
                  <Text type="secondary">
                    Revisa el estado y conversa con Soporte.
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip title="Tus datos están protegidos">
                  <SafetyCertificateTwoTone twoToneColor="#22c55e" />
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
            className="rounded-2xl border-slate-200 shadow-sm"
            loading={loading}
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
              className="rounded-2xl border-slate-200 shadow-sm mb-6"
              loading={loading}
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
                  <Tag
                    color={
                      ESTADO_META[
                        (ticket.estado?.nombre || "ABIERTO") as TicketEstado
                      ]?.color || "default"
                    }
                  >
                    {ESTADO_META[
                      (ticket.estado?.nombre || "ABIERTO") as TicketEstado
                    ]?.label ||
                      ticket.estado?.nombre ||
                      "—"}
                  </Tag>
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
                  {fmt(ticket.createdAt)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Calificación si RESUELTO (por nombre o id 4) */}
            {(ticket.estado?.nombre?.toUpperCase() === "RESUELTO" ||
              ticket.estado_id === 4) && (
              <CardCalificacionInline
                ticket={ticket}
                onCrear={crearCalificacion}
              />
            )}

            {/* Chat con reglas para estudiante */}
            <CardChatEstudiante ticket={ticket} onSend={handleSend} />
          </>
        )}
      </div>
    </div>
  );
}
