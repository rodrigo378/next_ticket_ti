// IMPORTS: deja los que ya tienes en tu CardMensaje actual
// OJO: no declares interfaces nuevas; usa tus tipos existentes
import type { Ticket } from "@/interface/ticket_ti";
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
} from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  PaperClipOutlined,
  SendOutlined,
  DownloadOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import type { UploadFile } from "antd/es/upload/interface";
import { MensajeTicket } from "@/interface/mensaje";
dayjs.extend(relativeTime);
dayjs.locale("es");

interface Props {
  ticket: Ticket | null;
  nuevoMensaje: string;
  loadingMensaje: boolean;
  setNuevoMensaje: React.Dispatch<React.SetStateAction<string>>;
  handleEnviarMensaje: (opts?: { archivos?: UploadFile[] }) => void;
}

export default function CardMensaje({
  ticket,
  nuevoMensaje,
  loadingMensaje,
  setNuevoMensaje,
  handleEnviarMensaje,
}: Props) {
  const mensajes = useMemo(() => ticket?.mensajes ?? [], [ticket?.mensajes]);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // ======= Reglas de habilitación por estado =======
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

  // aplicamos las 3 reglas:
  // - Abierto: deshabilitado
  // - En Proceso: habilitado
  // - Cancelado/Finalizado: deshabilitado
  const inputsDisabled =
    !ticket || esAbierto || esCancelado || esFinalizado ? true : !enProceso;

  const disabledReason = (() => {
    if (!ticket) return "El ticket no está disponible.";
    if (esAbierto)
      return "Este ticket está en estado Abierto; la conversación se habilitará cuando pase a En Proceso.";
    if (esCancelado)
      return "Este ticket fue Cancelado; no se pueden enviar nuevos mensajes.";
    if (esFinalizado)
      return "Este ticket fue Finalizado; la conversación está cerrada.";
    // si no está en ninguno de los anteriores y tampoco es En Proceso
    if (!enProceso) return "La conversación no está habilitada en este estado.";
    return null;
  })();

  // ======= Auto-scroll al final del hilo =======
  // const hiloRef = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   if (hiloRef.current) {
  //     hiloRef.current.scrollTop = hiloRef.current.scrollHeight;
  //   }
  // }, [mensajes.length]);

  const mensajesOrdenados = useMemo(() => {
    const arr = [...mensajes];
    return arr.sort(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [mensajes]);

  const puedeEnviar =
    !inputsDisabled && (nuevoMensaje.trim().length > 0 || fileList.length > 0);

  const onEnviar = async () => {
    await handleEnviarMensaje({ archivos: fileList });
    setNuevoMensaje("");
    setFileList([]);
  };

  return (
    <Card
      title="📨 Conversación"
      className="mb-6 shadow-sm rounded-xl"
      styles={{ body: { paddingTop: 16 } }}
    >
      <div
        // ref={hiloRef}
        className="mb-4 max-h-96 overflow-y-auto pr-2 space-y-4"
        id="hilo-ticket"
        // style={{ overflowAnchor: "none" }} // 👈 añade esto AQUÍ
      >
        {mensajesOrdenados.length === 0 ? (
          <Empty description="Sin mensajes en este ticket" />
        ) : (
          mensajesOrdenados.map((m: MensajeTicket) => (
            <div key={m.id} className="flex gap-3 items-start">
              <Avatar
                size="large"
                icon={
                  m?.emisor?.rol?.nombre.toLowerCase?.() === "soporte" ? (
                    <TeamOutlined />
                  ) : (
                    <UserOutlined />
                  )
                }
                className={
                  m?.emisor?.rol?.nombre.toLowerCase?.() === "soporte"
                    ? "bg-blue-100 text-blue-600 me-3"
                    : "bg-gray-100 text-gray-600 me-3"
                }
              />

              <div className="flex-1 " style={{ paddingLeft: "10px" }}>
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

      <Divider orientation="left">Redactar respuesta</Divider>

      {/* Aviso de deshabilitado (sin agregar nuevos imports) */}
      {inputsDisabled && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Typography.Text type="secondary" className="text-xs">
            {disabledReason}
          </Typography.Text>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <TextArea
          rows={5}
          autoSize={{ minRows: 5, maxRows: 5 }} // 👈 AÑADE ESTO
          placeholder={
            inputsDisabled
              ? "La redacción está deshabilitada para este estado del ticket."
              : "Estimado(a) equipo de soporte,\n\n[Describa su consulta o actualización].\n\nAtentamente,"
          }
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          maxLength={2000}
          showCount
          disabled={inputsDisabled}
        />

        <Upload.Dragger
          className="mb-4 mt-6"
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

        <div className="flex justify-end">
          <Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={onEnviar}
              loading={loadingMensaje}
              disabled={!puedeEnviar}
            >
              Enviar
            </Button>
          </Space>
        </div>

        <Typography.Text type="secondary" className="text-xs">
          Nota: evite compartir información sensible en este hilo. Todo lo que
          escriba aquí será enviado como copia al correo registrado, por favor
          revíselo.
        </Typography.Text>
      </div>
    </Card>
  );
}
