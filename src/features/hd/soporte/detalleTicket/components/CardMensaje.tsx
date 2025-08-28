import { useMemo, useState } from "react";
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
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import type { UploadFile } from "antd/es/upload/interface";
import { HD_Ticket } from "@/interface/hd/hd_ticket";
import { HD_MensajeTicket } from "@/interface/hd/hd_mensajeTicket";
dayjs.extend(relativeTime);
dayjs.locale("es");

interface Props {
  ticket: HD_Ticket | null;
  nuevoMensaje: string;
  loadingMensaje: boolean;
  setNuevoMensaje: React.Dispatch<React.SetStateAction<string>>;
  handleEnviarMensaje: (opts?: { archivos?: UploadFile[] }) => void;

  /** Persistir bloqueo en backend (opcional) */
  onToggleBloqueo?: (blocked: boolean) => void;
}

export default function CardMensajeSoporte({
  ticket,
  nuevoMensaje,
  loadingMensaje,
  setNuevoMensaje,
  handleEnviarMensaje,
  onToggleBloqueo,
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

  const [bloquearUsuario, setBloquearUsuario] = useState<boolean>(
    Boolean((ticket as any)?.chatBloqueado ?? false)
  );

  const baseEstadoDisabled =
    !ticket || esAbierto || esCancelado || esFinalizado ? true : !enProceso;

  // Soporte NUNCA está limitado por la regla de 2; solo por estado
  const inputsDisabled = baseEstadoDisabled;

  const disabledReason = (() => {
    if (!ticket) return "El ticket no está disponible.";
    if (esAbierto)
      return "Este ticket está en estado Abierto; la conversación se habilitará cuando pase a En Proceso.";
    if (esCancelado)
      return "Este ticket fue Cancelado; no se pueden enviar nuevos mensajes.";
    if (esFinalizado)
      return "Este ticket fue Finalizado; la conversación está cerrada.";
    if (!enProceso) return "La conversación no está habilitada en este estado.";
    return null;
  })();

  // ====== Regla de 2 mensajes (solo para visualización en soporte) ======
  const esMensajeDeSoporte = (m: HD_MensajeTicket) => {
    const rol = m?.emisor?.rol?.nombre?.toLowerCase?.() ?? "";
    return rol.includes("soporte");
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
  }, [mensajesOrdenados]);

  const userReplyCountSinceSupport = useMemo(() => {
    if (lastSupportIdx === -1) return 0;
    let c = 0;
    for (let i = lastSupportIdx + 1; i < mensajesOrdenados.length; i++) {
      if (!esMensajeDeSoporte(mensajesOrdenados[i])) c++;
    }
    return c;
  }, [lastSupportIdx, mensajesOrdenados]);

  const LIMITE_REPLIES = 2;
  const tagColor =
    lastSupportIdx === -1
      ? "default"
      : userReplyCountSinceSupport >= LIMITE_REPLIES
      ? "red"
      : "blue";

  // ====== Enviar ======
  const puedeEnviar =
    !inputsDisabled && (nuevoMensaje.trim().length > 0 || fileList.length > 0);

  const onEnviar = async () => {
    await handleEnviarMensaje({ archivos: fileList });
    setNuevoMensaje("");
    setFileList([]);
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <span>📨 Conversación (Soporte)</span>
          <Tag color={tagColor}>
            {lastSupportIdx === -1
              ? "Aún no has enviado el primer mensaje"
              : `Usuario: ${userReplyCountSinceSupport}/${LIMITE_REPLIES} desde tu último mensaje`}
          </Tag>
        </div>
      }
      extra={
        <Space>
          <Tooltip title="Si está marcado, el usuario no podrá escribir.">
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

      {/* Redactor soporte */}
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
