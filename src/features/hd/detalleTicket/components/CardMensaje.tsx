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
  handleEnviarMensaje: (opts?: { archivos?: UploadFile[] }) => void;
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
  const { token } = theme.useToken();

  const mensajes = useMemo(() => ticket?.mensajes ?? [], [ticket?.mensajes]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // ====== Estado general del ticket ======
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

  const [bloquearUsuario, setBloquearUsuario] = useState<boolean>(false);

  const baseEstadoDisabled =
    !ticket || esAbierto || esCancelado || esFinalizado ? true : !enProceso;

  // Soporte no está limitado por la regla de 2; solo por estado
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

  // ====== ¿Mensaje del EQUIPO o del SOLICITANTE? ======
  const esMensajeDelEquipo = useCallback(
    (m: HD_MensajeTicket) => {
      if (!ticket) return false;
      if (m.emisor_id === ticket.creado_id) return false; // solicitante
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
      return true; // fallback: cualquier NO-creador → equipo
    },
    [ticket]
  );

  // Orden cronológico
  const mensajesOrdenados = useMemo(() => {
    const arr = [...mensajes];
    return arr.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [mensajes]);

  // Último mensaje del equipo
  const lastEquipoIdx = useMemo(() => {
    for (let i = mensajesOrdenados.length - 1; i >= 0; i--) {
      if (esMensajeDelEquipo(mensajesOrdenados[i])) return i;
    }
    return -1;
  }, [mensajesOrdenados, esMensajeDelEquipo]);

  // Respuestas del solicitante DESPUÉS del último mensaje del equipo
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
      ? "red"
      : "blue";

  // ====== Enviar ======
  const onEnviar = async () => {
    await handleEnviarMensaje({ archivos: fileList });
    setNuevoMensaje("");
    setFileList([]);
  };

  // ====== estilos acordes a tema ======
  const bubbleEquipoStyle: React.CSSProperties = {
    background: token.colorPrimaryBg,
    border: `1px solid ${token.colorPrimaryBorder}`,
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };
  const bubbleSolicitanteStyle: React.CSSProperties = {
    background: token.colorFillQuaternary,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    padding: 12,
  };
  const avatarEquipoStyle: React.CSSProperties = {
    backgroundColor: token.colorPrimaryBg,
    color: token.colorPrimaryText,
  };
  const avatarSolicitanteStyle: React.CSSProperties = {
    backgroundColor: token.colorFillQuaternary,
    color: token.colorTextTertiary,
  };

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
      {/* Mensajes */}
      <div
        className="mb-4 max-h-96 overflow-y-auto pr-2 space-y-4"
        id="hilo-ticket"
      >
        {mensajesOrdenados.length === 0 ? (
          <Empty description="Sin mensajes en este ticket" />
        ) : (
          mensajesOrdenados.map((m: HD_MensajeTicket) => {
            const delEquipo = esMensajeDelEquipo(m);
            return (
              <div key={m.id} className="flex gap-3 items-start">
                <Avatar
                  size="large"
                  icon={delEquipo ? <TeamOutlined /> : <UserOutlined />}
                  style={delEquipo ? avatarEquipoStyle : avatarSolicitanteStyle}
                />
                <div className="flex-1" style={{ paddingLeft: 10 }}>
                  <div className="flex items-center justify-between">
                    <Typography.Text strong style={{ color: token.colorText }}>
                      {m?.emisor?.nombre ?? "—"}
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      className="text-xs"
                      style={{ color: token.colorTextTertiary }}
                    >
                      {dayjs(m.createdAt).format("DD/MM/YYYY HH:mm")}
                    </Typography.Text>
                  </div>

                  <div
                    style={
                      delEquipo ? bubbleEquipoStyle : bubbleSolicitanteStyle
                    }
                  >
                    {m.contenido && (
                      <Typography.Paragraph
                        style={{
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          color: token.colorText,
                        }}
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
