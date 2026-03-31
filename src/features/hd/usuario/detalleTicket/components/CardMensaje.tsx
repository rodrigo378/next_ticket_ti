/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
import { HD_Ticket, HD_MensajeTicket } from "@interfaces/hd";
import dayjs from "@shared/date/dayjs";

interface Props {
  ticket: HD_Ticket | null;
  nuevoMensaje: string;
  loadingMensaje: boolean;
  setNuevoMensaje: React.Dispatch<React.SetStateAction<string>>;
  handleEnviarMensaje: (opts?: {
    archivos?: UploadFile[];
  }) => void | Promise<void>;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveDownloadUrl(m: HD_MensajeTicket) {
  const id = m?.archivo_id ?? (m as any)?.archivo?.id;
  if (!id) return "";
  const base = API.replace(/\/+$/, "");
  return `${base}/core/onedrive/onedrive/${encodeURIComponent(String(id))}/download`;
}

function openDownload(url: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
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

  const chatBloqueado = Boolean((ticket as any)?.chatBloqueado ?? false);

  const esMensajeDeSoporte = (m: HD_MensajeTicket) => {
    if (!ticket) return false;

    if (m.emisor_id === ticket.titular_id) return false;

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
      "administrativo",
      "mesa",
      "ti",
      "operador",
      "analista",
      "especialista",
    ];

    if (rol && soporteTokens.some((tok) => rol.includes(tok))) return true;

    return true;
  };

  const mensajesOrdenados = useMemo(() => {
    const arr = [...mensajes];
    return arr.sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [mensajes]);

  const lastSupportIdx = useMemo(() => {
    for (let i = mensajesOrdenados.length - 1; i >= 0; i--) {
      if (esMensajeDeSoporte(mensajesOrdenados[i])) return i;
    }
    return -1;
  }, [mensajesOrdenados]);

  const userReplyCountSinceSupport = useMemo(() => {
    if (lastSupportIdx === -1) return 0;
    let c = 0;
    for (let i = lastSupportIdx + 1; i < mensajesOrdenados.length; i++) {
      if (!esMensajeDeSoporte(mensajesOrdenados[i])) c++;
    }
    return c;
  }, [lastSupportIdx, mensajesOrdenados]);

  const LIMITE_REPLIES = 3;
  const excedioCupoUsuario =
    lastSupportIdx >= 0 && userReplyCountSinceSupport >= LIMITE_REPLIES;

  const baseEstadoDisabled =
    !ticket || esAbierto || esCancelado || esFinalizado ? true : !enProceso;

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

  const onEnviar = async () => {
    await handleEnviarMensaje({ archivos: fileList });
    setNuevoMensaje("");
    setFileList([]);
  };

  const mensajesRestantes =
    LIMITE_REPLIES -
    Math.min(
      lastSupportIdx === -1 ? 0 : userReplyCountSinceSupport,
      LIMITE_REPLIES,
    );

  const canSend =
    !inputsDisabled && (nuevoMensaje.trim().length > 0 || fileList.length > 0);

  const bubbleStyle: React.CSSProperties = {
    background: "#f3f4f6",
    border: "1px solid #d1d5db",
    borderRadius: 14,
    padding: 12,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  };

  const avatarSoporteStyle: React.CSSProperties = {
    backgroundColor: "#e5e7eb",
    color: "#374151",
  };

  const avatarUsuarioStyle: React.CSSProperties = {
    backgroundColor: "#d1d5db",
    color: "#374151",
  };

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
      <div
        className="mb-4 max-h-96 overflow-y-auto pr-2 space-y-4"
        id="hilo-ticket"
      >
        {mensajesOrdenados.length === 0 ? (
          <Empty description="Sin mensajes en este ticket" />
        ) : (
          mensajesOrdenados.map((m: HD_MensajeTicket) => {
            const deSoporte = esMensajeDeSoporte(m);

            const isDocumento =
              String((m as any)?.tipo ?? "").toLowerCase() === "documento" &&
              (!!(m as any)?.archivo_id || !!(m as any)?.archivo?.id);

            const downloadUrl = isDocumento ? resolveDownloadUrl(m) : "";

            const nombreMostrar = deSoporte
              ? "Soporte"
              : `${m?.emisor?.nombre ?? ""} ${m?.emisor?.apellidos ?? ""}`.trim() ||
                "Usuario";

            return (
              <div
                key={m.id}
                className={`flex gap-3 items-start ${
                  deSoporte ? "justify-end" : "justify-start"
                }`}
              >
                {deSoporte && (
                  <Avatar
                    size="large"
                    icon={<TeamOutlined />}
                    style={avatarSoporteStyle}
                  />
                )}

                <div
                  className="max-w-[75%]"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: deSoporte ? "flex-start" : "flex-end",
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
                      {nombreMostrar}
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
                    {m.contenido ? (
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
                          {(m as any)?.nombre ??
                            (m as any)?.archivo?.nombre ??
                            "archivo"}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {!deSoporte && (
                  <Avatar
                    size="large"
                    icon={<UserOutlined />}
                    style={avatarUsuarioStyle}
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
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Space>
            <InfoCircleOutlined />
            <Typography.Text type="secondary" className="text-xs">
              {disabledReason}
            </Typography.Text>
          </Space>
        </div>
      )}

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
