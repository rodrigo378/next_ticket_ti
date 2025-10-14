import { useMemo } from "react";
import { HD_Ticket } from "@interfaces/hd";
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
} from "antd";

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
          itemLayout="vertical" // filas, uno debajo del otro
          dataSource={documentos}
          renderItem={(doc, index) => {
            const a = doc?.archivo;
            if (!a) return null;

            const ct = a.contentType || "";
            const name = a.nombre || "";

            const isImage =
              ct.startsWith("image/") ||
              hasExt(name, [".png", ".jpg", ".jpeg", ".gif", ".webp"]);
            const isPDF = ct === "application/pdf" || hasExt(name, [".pdf"]);
            const isWord =
              ct.includes("word") || hasExt(name, [".doc", ".docx"]);
            const isExcel =
              ct.includes("excel") || hasExt(name, [".xls", ".xlsx"]);
            const isPpt =
              ct.includes("powerpoint") || hasExt(name, [".ppt", ".pptx"]);
            const isOffice = isWord || isExcel || isPpt;

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
                color={
                  isImage
                    ? "blue"
                    : isPDF
                    ? "red"
                    : isOffice
                    ? "green"
                    : "default"
                }
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
                {index > 0 && <Divider style={{ margin: "12px 0" }} />}
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
                    {/* Vista previa */}
                    <div
                      style={{
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
                          src={a.url} // si prefieres thumbnail de Graph, cámbialo por a.thumbnailUrl
                          alt={name}
                          height={160}
                          width={200}
                          style={{ objectFit: "cover" }}
                          preview={{ src: a.url }}
                          fallback=""
                        />
                      ) : a.previewUrl ? (
                        // URL firmada devuelta por tu backend desde Graph /preview
                        <iframe
                          src={a.previewUrl}
                          title={name}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allow="fullscreen"
                        />
                      ) : isPDF ? (
                        // Fallback local si por alguna razón no llegó previewUrl
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
                              <a
                                href={a.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Abrir PDF
                              </a>
                            }
                          />
                        </object>
                      ) : (
                        <Text type="secondary">Vista previa no disponible</Text>
                      )}
                    </div>

                    {/* Detalles */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Space
                        direction="vertical"
                        size={6}
                        style={{ width: "100%" }}
                      >
                        <Space wrap>
                          {icon}
                          <a
                            href={a.previewUrl || a.url}
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
                              href={a.previewUrl || a.url}
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
              </>
            );
          }}
        />
      )}
    </Card>
  );
}
