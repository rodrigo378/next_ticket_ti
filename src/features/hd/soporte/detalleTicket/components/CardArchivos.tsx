import { HD_Ticket } from "@/interface/hd/hd_ticket";
import { PaperClipOutlined } from "@ant-design/icons";
import { Card, List, Typography } from "antd";
const { Text } = Typography;

// Base pública tomada del .env (se compila en build)
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

// Resuelve la URL del archivo: normaliza y soporta rutas absolutas/relativas
const toFileUrl = (rawUrl?: string) => {
  if (!rawUrl) return "#";
  const path = rawUrl.replace(/\\/g, "/"); // windows -> web

  // Si la API ya devuelve una URL absoluta, úsala tal cual
  if (/^https?:\/\//i.test(path)) return path;

  // Si es relativa, préfix con el host de tu API
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

interface Props {
  ticket: HD_Ticket;
}

export default function CardArchivos({ ticket }: Props) {
  return (
    <Card title="📎 Archivos Adjuntos" className="mb-6">
      {ticket?.documentos?.length ? (
        <List
          dataSource={ticket.documentos}
          renderItem={(doc) => (
            <List.Item>
              <a
                href={toFileUrl(doc.url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PaperClipOutlined /> {doc.nombre}
              </a>
            </List.Item>
          )}
        />
      ) : (
        <Text type="secondary">No hay archivos adjuntos</Text>
      )}
    </Card>
  );
}
