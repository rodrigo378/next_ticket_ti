import { useMemo, useEffect, useState } from "react";
import { HD_Ticket, HD_DocumentoTicket } from "@interfaces/hd";
import {
  PaperClipOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileOutlined,
  FullscreenOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  Card,
  List,
  Typography,
  Image,
  Button,
  Tag,
  Tooltip,
  Space,
  Empty,
  Divider,
  Alert,
  Modal,
} from "antd";
import { Core_Archivo } from "@/interfaces/core";

const { Text } = Typography;

interface Props {
  ticket: HD_Ticket;
}

/** Helpers */
const formatBytes = (bytes?: number) => {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(2)} ${units[i]}`;
};

const hasExt = (name = "", exts: string[]) =>
  exts.some((e) => name.toLowerCase().endsWith(e));

export default function CardArchivos({ ticket }: Props) {
  const documentos = useMemo(
    () => (Array.isArray(ticket?.documentos) ? ticket.documentos : []),
    [ticket?.documentos]
  );

  return (
    <Card title="📎 Archivos Adjuntos" className="mb-6">
      {documentos.length === 0 ? (
        <Empty description="No hay archivos adjuntos" />
      ) : (
        <List
          itemLayout="vertical"
          dataSource={documentos}
          renderItem={(doc, index) => (
            <ArchivoItem
              key={doc.id ?? index}
              doc={doc as HD_DocumentoTicket}
            />
          )}
        />
      )}
    </Card>
  );
}

/** Item de archivo (preview seguro vía /preview-info + Modal con header sticky) */
function ArchivoItem({ doc }: { doc: HD_DocumentoTicket }) {
  const a: Core_Archivo | undefined = doc?.archivo;

  // Hooks
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  // Flags
  const ct = a?.contentType || "";
  const name = a?.nombre || "";

  const isImage =
    ct.startsWith("image/") ||
    hasExt(name, [".png", ".jpg", ".jpeg", ".gif", ".webp"]);
  const isPDF = ct === "application/pdf" || hasExt(name, [".pdf"]);
  const isWord = ct.includes("word") || hasExt(name, [".doc", ".docx"]);
  const isExcel = ct.includes("excel") || hasExt(name, [".xls", ".xlsx"]);
  const isPpt = ct.includes("powerpoint") || hasExt(name, [".ppt", ".pptx"]);
  const isOffice = isWord || isExcel || isPpt;

  // Cargar preview embebible desde /preview-info
  useEffect(() => {
    const fetchPreview = async () => {
      if (!a?.previewUrl || !a.previewUrl.includes("/preview-info") || isImage)
        return;
      try {
        const res = await fetch(a.previewUrl);
        const data = await res.json();
        setPreviewSrc(data.previewUrl || null);
      } catch {
        setPreviewSrc(null);
      }
    };
    fetchPreview();
  }, [a?.previewUrl, isImage]);

  if (!a) return null;

  const icon = isImage ? (
    <FileImageOutlined />
  ) : isPDF ? (
    <FilePdfOutlined />
  ) : isWord ? (
    <FileWordOutlined />
  ) : isExcel ? (
    <FileExcelOutlined />
  ) : isPpt ? (
    <FilePptOutlined />
  ) : (
    <FileOutlined />
  );

  const typeTag = (
    <Tag
      color={isImage ? "blue" : isPDF ? "red" : isOffice ? "green" : "default"}
    >
      {isImage
        ? "Imagen"
        : isPDF
        ? "PDF"
        : isWord
        ? "Word"
        : isExcel
        ? "Excel"
        : isPpt
        ? "PowerPoint"
        : "Archivo"}
    </Tag>
  );

  return (
    <>
      <Divider style={{ margin: "12px 0" }} />
      <Card
        size="small"
        hoverable
        style={{
          width: "100%",
          marginBottom: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          borderRadius: 10,
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Preview */}
          <div
            style={{
              position: "relative",
              flex: "0 0 200px",
              height: 160,
              background: "#fafafa",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              border: "1px solid #f0f0f0",
            }}
          >
            {isImage ? (
              <Image
                src={a.url}
                alt={name}
                height={160}
                width={200}
                style={{ objectFit: "cover" }}
                preview={{ src: a.url }}
                fallback=""
              />
            ) : previewSrc ? (
              <iframe
                src={previewSrc}
                title={name}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allow="fullscreen"
              />
            ) : isPDF ? (
              <object
                data={a.url}
                type="application/pdf"
                width="100%"
                height="100%"
              >
                <Alert
                  type="info"
                  showIcon
                  message="Vista previa no disponible"
                  description={
                    <a href={a.url} target="_blank" rel="noopener noreferrer">
                      Abrir PDF
                    </a>
                  }
                />
              </object>
            ) : (
              <Text type="secondary">Vista previa no disponible</Text>
            )}

            {/* Botón Maximizar (desplazado para no chocar con scroll) */}
            {(isImage || !!previewSrc) && (
              <Tooltip title="Maximizar">
                <Button
                  type="default"
                  shape="circle"
                  size="small"
                  icon={<FullscreenOutlined />}
                  onClick={() => setOpen(true)}
                  style={{
                    position: "absolute",
                    right: 12, // más margen
                    bottom: 12,
                    background: "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(2px)",
                    borderColor: "#e5e7eb",
                  }}
                />
              </Tooltip>
            )}
          </div>

          {/* Detalles */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Space direction="vertical" size={6} style={{ width: "100%" }}>
              <Space wrap>
                {icon}
                <a
                  href={a.openUrl || a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  style={{ fontWeight: 500 }}
                >
                  <PaperClipOutlined /> {name}
                </a>
              </Space>

              <Space align="center" wrap>
                {typeTag}
                {a.size ? (
                  <Text type="secondary">{formatBytes(a.size)}</Text>
                ) : null}
              </Space>

              <Space style={{ marginTop: 8 }}>
                <Tooltip title="Ver / Abrir">
                  <Button
                    icon={<EyeOutlined />}
                    href={a.openUrl || a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver
                  </Button>
                </Tooltip>
                <Tooltip title="Descargar">
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Descargar
                  </Button>
                </Tooltip>
              </Space>
            </Space>
          </div>
        </div>
      </Card>

      {/* Modal con header sticky y scroll solo en el cuerpo */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        closable={false} // oculto la X nativa para que no choque
        footer={null}
        width="90vw"
        centered
        destroyOnClose
        styles={{ body: { padding: 0 } }}
      >
        {/* Header propio (no se desplaza) */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "10px 12px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fff",
          }}
        >
          <Text
            strong
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "80%",
            }}
          >
            {name}
          </Text>
          <Button
            type="text"
            shape="circle"
            aria-label="Cerrar"
            icon={<CloseOutlined />}
            onClick={() => setOpen(false)}
          />
        </div>

        {/* Cuerpo con scroll propio */}
        <div
          style={{
            height: "80vh",
            overflow: "auto",
            background: "#fafafa",
          }}
        >
          {isImage ? (
            <Image
              src={a.url}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              preview={false}
            />
          ) : previewSrc ? (
            <iframe
              src={previewSrc}
              title={name}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allow="fullscreen"
            />
          ) : (
            <div
              style={{
                display: "grid",
                placeItems: "center",
                height: "100%",
                padding: 24,
              }}
            >
              <Text type="secondary">Vista previa no disponible</Text>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
