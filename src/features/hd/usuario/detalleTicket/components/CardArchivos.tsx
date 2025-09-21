import { HD_Ticket } from "@interfaces/hd";
import {
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { Card, List, Typography } from "antd";
import dayjs from "@shared/date/dayjs";

const { Text } = Typography;

interface Props {
  ticket: HD_Ticket | null;
}

const API = process.env.NEXT_PUBLIC_API_URL!;

const getFileIcon = (filename: string) => {
  const f = (filename || "").toLowerCase();
  if (f.endsWith(".pdf")) return <FilePdfOutlined style={{ color: "red" }} />;
  if (f.endsWith(".doc") || f.endsWith(".docx"))
    return <FileWordOutlined style={{ color: "blue" }} />;
  if (
    f.endsWith(".png") ||
    f.endsWith(".jpg") ||
    f.endsWith(".jpeg") ||
    f.endsWith(".webp")
  )
    return <FileImageOutlined style={{ color: "green" }} />;
  return <PaperClipOutlined />;
};

const toAbsUrl = (u: string) => {
  if (!u) return "#";
  const normalized = u.replace(/\\/g, "/");
  const isAbs = /^https?:\/\//i.test(normalized);
  return isAbs
    ? normalized
    : `${API}${normalized.startsWith("/") ? "" : "/"}${normalized}`;
};

export default function CardArchivos({ ticket }: Props) {
  const archivos = ticket?.documentos ?? [];

  return (
    <Card title="📎 Archivos Adjuntos" className="mb-6 rounded-xl shadow-sm">
      {archivos.length ? (
        <List
          dataSource={archivos}
          renderItem={(doc) => {
            const fileUrl = encodeURI(toAbsUrl(doc.url));
            return (
              <List.Item className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon(doc.nombre)}
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    {doc.nombre}
                  </a>
                </div>
                <Text type="secondary" className="text-xs">
                  {doc.createdAt
                    ? dayjs(doc.createdAt).format("DD/MM/YYYY HH:mm")
                    : ""}
                </Text>
              </List.Item>
            );
          }}
        />
      ) : (
        <Text type="secondary">No hay archivos adjuntos</Text>
      )}
    </Card>
  );
}
