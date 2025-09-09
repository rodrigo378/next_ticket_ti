// app/hd/est/[id]/page.tsx
"use client";

import React, { useMemo, useState } from "react";
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
import dayjs from "dayjs";

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

type HD_Ticket = {
  id: number;
  codigo?: string;
  estado?: Estado; // estado.nombre
  area?: Area; // area.nombre
  descripcion?: string;
  createdAt?: string;
  mensajes?: HD_MensajeTicket[];
  chatBloqueado?: boolean;
};

// ====== DATA ESTÁTICA (demo) ======
const DATA_STATIC: Record<number, HD_Ticket> = {
  1: {
    id: 1,
    codigo: "TCK-2025-0001",
    estado: { nombre: "EN_PROCESO" },
    area: { nombre: "Mesa de Ayuda - TI" },
    descripcion:
      "No puedo acceder al aula virtual (error 403) desde anoche. Probé con Chrome y Edge.",
    createdAt: "2025-09-03T10:30:00Z",
    chatBloqueado: false,
    mensajes: [
      {
        id: 101,
        createdAt: "2025-09-03T10:31:00Z",
        contenido: "Hola, necesito ayuda. Me sale error 403.",
        emisor: {
          nombre: "Juan",
          apellidos: "Pérez",
          rol: { nombre: "Estudiante" },
        },
      },
      {
        id: 102,
        createdAt: "2025-09-03T11:10:00Z",
        contenido:
          "¡Hola Juan! Somos Soporte. ¿Podrías confirmar si te pasa en ventana de incógnito?",
        emisor: { nombre: "Soporte TI", rol: { nombre: "Soporte" } },
      },
      {
        id: 103,
        createdAt: "2025-09-03T11:20:00Z",
        contenido: "Sí, también me pasa en incógnito.",
        emisor: {
          nombre: "Juan",
          apellidos: "Pérez",
          rol: { nombre: "Estudiante" },
        },
      },
    ],
  },
  2: {
    id: 2,
    codigo: "TCK-2025-0002",
    estado: { nombre: "ASIGNADO" },
    area: { nombre: "OSAR" },
    descripcion: "Consulta sobre constancia de matrícula.",
    createdAt: "2025-09-05T09:10:00Z",
    chatBloqueado: false,
    mensajes: [
      {
        id: 201,
        createdAt: "2025-09-05T09:11:00Z",
        contenido: "Buenas, mi constancia muestra ciclo anterior.",
        emisor: {
          nombre: "Ana",
          apellidos: "Rojas",
          rol: { nombre: "Estudiante" },
        },
      },
      // Sin respuesta de soporte → estudiante NO puede escribir
    ],
  },
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

  // Estado del ticket
  const estadoNom = (ticket?.estado?.nombre || "").toUpperCase() as
    | TicketEstado
    | string;
  const enProceso = estadoNom === "EN_PROCESO";
  const esAsignado = estadoNom === "ASIGNADO";
  const esCancelado = estadoNom === "CANCELADO";
  const esFinalizado = estadoNom === "FINALIZADO" || estadoNom === "CERRADO";

  // ¿Soporte ya escribió?
  const soporteHaEscrito = useMemo(
    () =>
      (mensajes || []).some(
        (m) => m.emisor?.rol?.nombre?.toLowerCase() === "soporte"
      ),
    [mensajes]
  );

  // Reglas:
  // - NO escribir si ASIGNADO
  // - Solo escribir si EN_PROCESO y soporte ya escribió
  // - Bloqueos por cancelado/finalizado/bloqueado
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
      return "El ticket fue FINALIZADO/CERRADO; la conversación está cerrada.";
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
      className="mb-6 rounded-xl shadow-sm"
      title={
        <Space>
          <MessageOutlined />
          <span>Conversación</span>
        </Space>
      }
    >
      {/* Hilo de mensajes */}
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
                      <Typography.Paragraph
                        style={{ margin: 0, whiteSpace: "pre-wrap" }}
                      >
                        {m.contenido}
                      </Typography.Paragraph>
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
            <Typography.Text type="secondary" className="text-xs">
              {disabledReason}
            </Typography.Text>
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

        <Typography.Text type="secondary" className="text-xs">
          Nota: evita compartir información sensible.
        </Typography.Text>
      </div>
    </Card>
  );
}

// ====== Página de Detalle (Estudiante) ======
export default function TicketDetailStudentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const idNum = Number(params?.id);

  const ticket: HD_Ticket | undefined = !Number.isNaN(idNum)
    ? DATA_STATIC[idNum]
    : undefined;

  // handler demo (simula envío)
  const handleSend = async (texto: string, archivos: UploadFile[]) => {
    console.log("ENVIAR >>>", { texto, archivos });
    // Integración real: crear mensaje + subir adjuntos + refrescar hilo
    await new Promise((r) => setTimeout(r, 400));
  };

  const estadoActual = (
    ticket?.estado?.nombre || "ABIERTO"
  ).toUpperCase() as TicketEstado;
  const estadoMeta = ESTADO_META[estadoActual] || ESTADO_META.ABIERTO;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-sky-50 via-white to-white">
      {/* HERO */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 p-[1px] shadow-lg">
          <div className="rounded-2xl bg-white/80 backdrop-blur-md px-6 py-6 md:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items中心 gap-3">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push("/hd/est/mis-tickets")}
                >
                  Mis Tickets
                </Button>
                <div>
                  <Typography.Title level={3} className="m-0 !text-slate-900">
                    📄 Detalle de Ticket
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    Revisa el estado y conversa con Soporte.
                  </Typography.Text>
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
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <Empty description="No se encontró el ticket solicitado" />
            <div className="mt-4">
              <Button onClick={() => router.push("/hd/est/mis-tickets")}>
                Volver
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <Card className="rounded-2xl border-slate-200 shadow-sm mb-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col">
                  <Typography.Text type="secondary" className="text-xs">
                    Código
                  </Typography.Text>
                  <Typography.Text className="text-base font-semibold">
                    {ticket.codigo || `T-${ticket.id}`}
                  </Typography.Text>
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
                  <Typography.Paragraph className="!mb-0 whitespace-pre-wrap">
                    {ticket.descripcion ?? "—"}
                  </Typography.Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="Creado">
                  <FieldTimeOutlined className="mr-1" />
                  {fmt(ticket.createdAt)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Chat con reglas para estudiante */}
            <CardChatEstudiante ticket={ticket} onSend={handleSend} />
          </>
        )}
      </div>
    </div>
  );
}
