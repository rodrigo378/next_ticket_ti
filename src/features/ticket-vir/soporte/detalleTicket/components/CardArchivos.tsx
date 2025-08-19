import { Ticket } from "@/interface/ticket_ti";
import { PaperClipOutlined } from "@ant-design/icons";
import { Card, List, Typography } from "antd";
const { Text } = Typography;

interface Props {
  ticket: Ticket;
}

export default function CardArchivos({ ticket }: Props) {
  return (
    <Card title="📎 Archivos Adjuntos" className="mb-6">
      {ticket?.documentos?.length ? (
        <List
          dataSource={ticket.documentos}
          renderItem={(doc) => {
            const fileUrl = `http://localhost:4000${doc.url.replace(
              /\\/g,
              "/"
            )}`;
            return (
              <List.Item>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  <PaperClipOutlined /> {doc.nombre}
                </a>
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
