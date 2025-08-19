// IMPORTS: deja los que ya tienes en tu CardMensaje actual
// OJO: no declares interfaces nuevas; usa tus tipos existentes
import type { Ticket } from "@/interface/ticket_ti";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const mensajes = ticket?.mensajes ?? [];
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Auto-scroll al final del hilo
  const hiloRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (hiloRef.current) {
      hiloRef.current.scrollTop = hiloRef.current.scrollHeight;
    }
  }, [mensajes.length]);

  const mensajesOrdenados = useMemo(() => {
    const arr = [...mensajes];
    return arr.sort(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [mensajes]);

  const puedeEnviar = nuevoMensaje.trim().length > 0 || fileList.length > 0;

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
        ref={hiloRef}
        className="mb-4 max-h-96 overflow-y-auto pr-2 space-y-4"
        id="hilo-ticket"
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
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600"
                }
              />
              <div className="flex-1">
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

      <div className="flex flex-col gap-3">
        <TextArea
          rows={5}
          placeholder={
            "Estimado(a) equipo de soporte,\n\n[Describa su consulta o actualización].\n\nAtentamente,"
          }
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          maxLength={2000}
          showCount
        />

        <Upload.Dragger
          className="mt-4"
          multiple
          fileList={fileList}
          onChange={(info) => setFileList(info.fileList)}
          beforeUpload={() => false}
          itemRender={(originNode) => originNode}
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
          Nota: evite compartir datos sensibles en este hilo.
        </Typography.Text>
      </div>
    </Card>
  );
}
