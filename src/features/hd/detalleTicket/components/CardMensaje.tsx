"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Space,
  Typography,
  Upload,
  Avatar,
  Tooltip,
  Tag,
  theme,
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
import { HD_MensajeTicket, HD_Ticket } from "@interfaces/hd";
import dayjs from "@shared/date/dayjs";

interface Props {
  ticket: HD_Ticket | null;
  nuevoMensaje: string;
  loadingMensaje: boolean;
  setNuevoMensaje: React.Dispatch<React.SetStateAction<string>>;
  handleEnviarMensaje: (opts?: {
    archivos?: UploadFile[];
  }) => void | Promise<void>;
  onToggleBloqueo?: (blocked: boolean) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

// Descargar por archivo_id
function resolveDownloadUrl(m: HD_MensajeTicket) {
  const id = m?.archivo_id ?? m?.archivo?.id;
  if (!id) return "";
  const base = API.replace(/\/+$/, "");
  return `${base}/core/onedrive/onedrive/${encodeURIComponent(String(id))}/download`;
}

function openDownload(url: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function CardMensajeSoporte({
  ticket,
  nuevoMensaje,
  loadingMensaje,
  setNuevoMensaje,
  handleEnviarMensaje,
  onToggleBloqueo,
}: Props) {
  const { token } = theme.useToken();

  const mensajes = useMemo(() => ticket?.mensajes ?? [], [ticket?.mensajes]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [bloquearUsuario, setBloquearUsuario] = useState<boolean>(false);

  // ====== Estado del ticket ======
  const estadoNombre = (ticket?.estado?.nombre || "").toLowerCase();
  const estadoCodigo = (ticket?.estado?.codigo || "").toUpperCase();

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

  const inputsDisabled =
    !ticket || esAbierto || esCancelado || esFinalizado ? true : !enProceso;

  const disabledReason = (() => {
    if (!ticket) return "El ticket no está disponible.";
    if (esAbierto) {
      return "Este ticket está en estado Abierto; la conversación se habilitará cuando pase a En Proceso.";
    }
    if (esCancelado) {
      return "Este ticket fue Cancelado; no se pueden enviar nuevos mensajes.";
    }
    if (esFinalizado) {
      return "Este ticket fue Finalizado; la conversación está cerrada.";
    }
    if (!enProceso) {
      return "La conversación no está habilitada en este estado.";
    }
    return null;
  })();

  // ====== Determinar si el mensaje es del equipo ======
  const esMensajeDelEquipo = useCallback(
    (m: HD_MensajeTicket) => {
      if (!ticket) return false;
      if (m.emisor_id === ticket.titular_id) return false;
      if (ticket.asignado_id && m.emisor_id === ticket.asignado_id) return true;

      const rol = m?.emisor?.rol?.nombre?.toLowerCase?.() ?? "";
      const tokens = [
        "soporte",
        "administrativo",
        "ti",
        "mesa",
        "operador",
        "analista",
        "especialista",
      ];

      if (tokens.some((t) => rol.includes(t))) return true;

      return true;
    },
    [ticket],
  );

  const mensajesOrdenados = useMemo(() => {
    const arr = [...mensajes];
    return arr.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [mensajes]);

  const lastEquipoIdx = useMemo(() => {
    for (let i = mensajesOrdenados.length - 1; i >= 0; i--) {
      if (esMensajeDelEquipo(mensajesOrdenados[i])) return i;
    }
    return -1;
  }, [mensajesOrdenados, esMensajeDelEquipo]);

  const repliesSolicitanteDesdeUltimoEquipo = useMemo(() => {
    if (lastEquipoIdx === -1) return 0;
    let c = 0;
    for (let i = lastEquipoIdx + 1; i < mensajesOrdenados.length; i++) {
      const m = mensajesOrdenados[i];
      if (!esMensajeDelEquipo(m)) c++;
    }
    return c;
  }, [lastEquipoIdx, mensajesOrdenados, esMensajeDelEquipo]);

  const LIMITE_REPLIES = 3;
  const tagColor =
    lastEquipoIdx === -1
      ? "default"
      : repliesSolicitanteDesdeUltimoEquipo >= LIMITE_REPLIES
        ? "green"
        : "blue";

  const onEnviar = async () => {
    await handleEnviarMensaje({ archivos: fileList });
    setNuevoMensaje("");
    setFileList([]);
  };

  // ====== Estilos grises para todos ======
  const bubbleStyle: React.CSSProperties = {
    background: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRadius: 14,
    padding: 12,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  };

  const avatarEquipoStyle: React.CSSProperties = {
    backgroundColor: "#e5e7eb",
    color: "#374151",
  };

  const avatarSolicitanteStyle: React.CSSProperties = {
    backgroundColor: "#d1d5db",
    color: "#374151",
  };

  const canSend =
    !inputsDisabled && (nuevoMensaje.trim().length > 0 || fileList.length > 0);

  return (
    <Card
      className="mb-6 shadow-sm rounded-xl"
      styles={{
        header: { borderBottomColor: token.colorSplit },
        body: { paddingTop: 16, background: token.colorBgContainer },
      }}
      title={
        <div className="flex items-center gap-2">
          <span>📨 Conversación (Soporte)</span>
          <Tag color={tagColor}>
            {lastEquipoIdx === -1
              ? "Aún no has enviado el primer mensaje"
              : `Solicitante: ${repliesSolicitanteDesdeUltimoEquipo}/${LIMITE_REPLIES} desde tu último mensaje`}
          </Tag>
        </div>
      }
      extra={
        <Space>
          <Tooltip title="Si está marcado, el solicitante no podrá escribir.">
            <Checkbox
              checked={bloquearUsuario}
              onChange={(e) => {
                setBloquearUsuario(e.target.checked);
                onToggleBloqueo?.(e.target.checked);
              }}
            >
              Bloquear chat al usuario
            </Checkbox>
          </Tooltip>
        </Space>
      }
    >
      <div
        className="mb-4 max-h-96 overflow-y-auto pr-2 space-y-4"
        id="hilo-ticket"
      >
        {mensajesOrdenados.length === 0 ? (
          <Empty description="Sin mensajes en este ticket" />
        ) : (
          mensajesOrdenados.map((m: HD_MensajeTicket) => {
            const delEquipo = esMensajeDelEquipo(m);

            const isDocumento =
              String(m?.tipo ?? "").toLowerCase() === "documento" &&
              (!!m?.archivo_id || !!m?.archivo?.id);

            const downloadUrl = isDocumento ? resolveDownloadUrl(m) : "";

            return (
              <div
                key={m.id}
                className={`flex gap-3 items-start ${
                  delEquipo ? "justify-start" : "justify-end"
                }`}
              >
                {delEquipo && (
                  <Avatar
                    size="large"
                    icon={<TeamOutlined />}
                    style={avatarEquipoStyle}
                  />
                )}

                <div
                  className="max-w-[75%]"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: delEquipo ? "flex-start" : "flex-end",
                  }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Typography.Text
                      strong
                      style={{
                        color: "#374151",
                        fontSize: 13,
                      }}
                    >
                      {m?.emisor?.nombre
                        ? `${m.emisor.nombre} ${m?.emisor?.apellidos ?? ""}`.trim()
                        : delEquipo
                          ? "Soporte"
                          : "Usuario"}
                    </Typography.Text>

                    <Typography.Text
                      type="secondary"
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                      }}
                    >
                      {dayjs(m.createdAt).format("DD/MM/YYYY HH:mm")}
                    </Typography.Text>
                  </div>

                  <div style={bubbleStyle}>
                    {m?.contenido ? (
                      <Typography.Paragraph
                        style={{
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          color: "#111827",
                        }}
                      >
                        {m.contenido}
                      </Typography.Paragraph>
                    ) : null}

                    {isDocumento ? (
                      <div style={{ marginTop: m?.contenido ? 10 : 0 }}>
                        <Button
                          size="small"
                          type="link"
                          icon={<DownloadOutlined />}
                          disabled={!downloadUrl}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openDownload(downloadUrl);
                          }}
                          style={{ paddingInline: 0 }}
                        >
                          {m?.nombre ?? m?.archivo?.nombre ?? "archivo"}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {!delEquipo && (
                  <Avatar
                    size="large"
                    icon={<UserOutlined />}
                    style={avatarSolicitanteStyle}
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

      {inputsDisabled ? (
        <div
          className="mb-3 rounded-lg p-3"
          style={{
            background: token.colorWarningBg,
            border: `1px solid ${token.colorWarning}`,
          }}
        >
          <Space>
            <InfoCircleOutlined style={{ color: token.colorWarning }} />
            <Typography.Text
              type="secondary"
              className="text-xs"
              style={{ color: token.colorText }}
            >
              {disabledReason}
            </Typography.Text>
          </Space>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <TextArea
          rows={5}
          autoSize={{ minRows: 5, maxRows: 5 }}
          placeholder={
            inputsDisabled
              ? "La redacción está deshabilitada."
              : "Respuesta al usuario..."
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
          style={{
            background: token.colorFillQuaternary,
            borderColor: token.colorBorder,
          }}
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
              disabled={!canSend}
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
