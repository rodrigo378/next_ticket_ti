/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Empty,
  Space,
  Typography,
  Upload,
  Avatar,
  Tag,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  PaperClipOutlined,
  SendOutlined,
  DownloadOutlined,
  UserOutlined,
  TeamOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { HD_Ticket } from "@/interface/hd/hd_ticket";
import { HD_MensajeTicket } from "@/interface/hd/hd_mensajeTicket";
import dayjs from "@shared/date/dayjs";

interface Props {
  ticket: HD_Ticket | null;
  nuevoMensaje: string;
  loadingMensaje: boolean;
  setNuevoMensaje: React.Dispatch<React.SetStateAction<string>>;
  handleEnviarMensaje: (opts?: { archivos?: UploadFile[] }) => void;
}

export default function CardMensajeUsuario({
  ticket,
  nuevoMensaje,
  loadingMensaje,
  setNuevoMensaje,
  handleEnviarMensaje,
}: Props) {
  const mensajes = useMemo(() => ticket?.mensajes ?? [], [ticket?.mensajes]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // ====== Estado/bloqueo ======
  const estadoNombre = (ticket?.estado?.nombre || "").toLowerCase();
  const estadoCodigo = (ticket?.estado?.nombre || "").toUpperCase();
  const esAbierto =
    estadoNombre.includes("abierto") || estadoCodigo === "ABIERTO";
  const enProceso =
    estadoNombre.includes("proceso") || estadoCodigo === "EN_PROCESO";
  const esCancelado =
    estadoNombre.includes("cancel") || estadoCodigo === "CANCELADO";
  const esFinalizado =
    estadoNombre.includes("finaliz") ||
    estadoNombre.includes("cerr") ||
    estadoCodigo === "FINALIZADO" ||
    estadoCodigo === "CERRADO";

  const chatBloqueado = Boolean((ticket as any)?.chatBloqueado ?? false);

  // ====== Regla: soporte debe escribir primero + usuario máx 2 ======
  const esMensajeDeSoporte = (m: HD_MensajeTicket) => {
    if (!ticket) return false;

    // Si el emisor es el creador del ticket, NO es soporte
    if (m.emisor_id === ticket.creado_id) return false;

    // Si trae rol, normalizamos y chequeamos contra lista conocida
    const rol = m?.emisor?.rol?.nombre?.toLowerCase?.() ?? "";
    const soporteTokens = [
      "soporte",
      "n1",
      "n2",
      "n3",
      "n4",
      "n5",
      "nivel_1",
      "nivel_2",
      "nivel_3",
      "nivel_4",
      "nivel_5",
      "admin",
      "superadmin",
    ];
    if (rol && soporteTokens.some((tok) => rol.includes(tok))) return true;

    // Fallback: cualquier NO-creador lo consideramos “soporte”
    return true;
  };

  const mensajesOrdenados = useMemo(() => {
    const arr = [...mensajes];
    return arr.sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [mensajes]);

  const lastSupportIdx = useMemo(() => {
    for (let i = mensajesOrdenados.length - 1; i >= 0; i--) {
      if (esMensajeDeSoporte(mensajesOrdenados[i])) return i;
    }
    return -1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mensajesOrdenados]);

  const userReplyCountSinceSupport = useMemo(() => {
    if (lastSupportIdx === -1) return 0;
    let c = 0;
    for (let i = lastSupportIdx + 1; i < mensajesOrdenados.length; i++) {
      if (!esMensajeDeSoporte(mensajesOrdenados[i])) c++;
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSupportIdx, mensajesOrdenados]);

  const LIMITE_REPLIES = 3;
  const excedioCupoUsuario =
    lastSupportIdx >= 0 && userReplyCountSinceSupport >= LIMITE_REPLIES;

  // ====== Habilitación ======
  const baseEstadoDisabled =
    !ticket || esAbierto || esCancelado || esFinalizado ? true : !enProceso;

  // Para el usuario: debe existir al menos un mensaje de soporte
  const requierePrimerMensajeSoporte = lastSupportIdx === -1;

  const inputsDisabled =
    baseEstadoDisabled ||
    chatBloqueado ||
    requierePrimerMensajeSoporte ||
    excedioCupoUsuario;

  const disabledReason = (() => {
    if (!ticket) return "El ticket no está disponible.";
    if (chatBloqueado) return "El soporte bloqueó temporalmente el chat.";
    if (requierePrimerMensajeSoporte)
      return "Esperando la primera respuesta del soporte para poder escribir.";
    if (excedioCupoUsuario)
      return `Has alcanzado el máximo de ${LIMITE_REPLIES} mensajes. Espera una respuesta del soporte para continuar.`;
    if (esAbierto)
      return "Este ticket está en estado Abierto; la conversación se habilitará cuando pase a En Proceso.";
    if (esCancelado)
      return "Este ticket fue Cancelado; no se pueden enviar nuevos mensajes.";
    if (esFinalizado)
      return "Este ticket fue Finalizado; la conversación está cerrada.";
    if (!enProceso) return "La conversación no está habilitada en este estado.";
    return null;
  })();

  // ====== Enviar ======
  // const puedeEnviar =
  // !inputsDisabled && (nuevoMensaje.trim().length > 0 || fileList.length > 0);

  const onEnviar = async () => {
    await handleEnviarMensaje({ archivos: fileList });
    setNuevoMensaje("");
    setFileList([]);
  };

  const mensajesRestantes =
    LIMITE_REPLIES -
    Math.min(
      lastSupportIdx === -1 ? 0 : userReplyCountSinceSupport,
      LIMITE_REPLIES
    );

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <span>📨 Conversación</span>
          <Tag
            color={
              requierePrimerMensajeSoporte
                ? "default"
                : excedioCupoUsuario
                ? "red"
                : "blue"
            }
          >
            {requierePrimerMensajeSoporte
              ? "Esperando respuesta del soporte"
              : excedioCupoUsuario
              ? "Límite alcanzado"
              : `Te quedan ${mensajesRestantes} mensaje(s)`}
          </Tag>
        </div>
      }
      className="mb-6 shadow-sm rounded-xl"
      styles={{ body: { paddingTop: 16 } }}
    >
      {/* Mensajes */}
      <div
        className="mb-4 max-h-96 overflow-y-auto pr-2 space-y-4"
        id="hilo-ticket"
      >
        {mensajesOrdenados.length === 0 ? (
          <Empty description="Sin mensajes en este ticket" />
        ) : (
          mensajesOrdenados.map((m: HD_MensajeTicket) => (
            <div key={m.id} className="flex gap-3 items-start">
              <Avatar
                size="large"
                icon={
                  esMensajeDeSoporte(m) ? <TeamOutlined /> : <UserOutlined />
                }
                className={
                  esMensajeDeSoporte(m)
                    ? "bg-blue-100 text-blue-600 me-3"
                    : "bg-gray-100 text-gray-600 me-3"
                }
              />
              <div className="flex-1" style={{ paddingLeft: 10 }}>
                <div className="flex items-center justify-between">
                  <Typography.Text strong>
                    {m?.emisor?.nombre ?? "—"}
                  </Typography.Text>
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
          ))
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

      {/* Redactor usuario */}
      <div className="flex flex-col gap-3">
        <TextArea
          rows={5}
          autoSize={{ minRows: 5, maxRows: 5 }}
          placeholder={
            inputsDisabled
              ? "La redacción está deshabilitada."
              : "Escribe tu mensaje para el soporte…"
          }
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          maxLength={2000}
          showCount
          disabled={inputsDisabled}
        />

        <Upload.Dragger
          className="mb-4 mt-2"
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
          <p className="ant-upload-hint">
            Formatos comunes (PDF, imágenes, docs). Máx. 10MB c/u.
          </p>
        </Upload.Dragger>

        <div className="flex justify-end items-center">
          <Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={onEnviar}
              loading={loadingMensaje}
              disabled={
                !(
                  !inputsDisabled &&
                  (nuevoMensaje.trim().length > 0 || fileList.length > 0)
                )
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
