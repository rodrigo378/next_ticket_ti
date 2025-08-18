import { Ticket } from "@/interface/ticket_ti";
import {
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { Card, List, Typography } from "antd";
const { Text } = Typography;

interface Props {
  ticket: Ticket | null;
}

export default function CardArchivos({ ticket }: Props) {
  const getFileIcon = (filename: string) => {
    if (filename.endsWith(".pdf"))
      return <FilePdfOutlined style={{ color: "red" }} />;
    if (filename.endsWith(".doc") || filename.endsWith(".docx"))
      return <FileWordOutlined style={{ color: "blue" }} />;
    if (filename.endsWith(".png") || filename.endsWith(".jpg"))
      return <FileImageOutlined style={{ color: "green" }} />;
    return <PaperClipOutlined />;
  };

  return (
    <>
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
                  {getFileIcon(doc.nombre)}{" "}
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                    {doc.nombre}
                  </a>
                </List.Item>
              );
            }}
          />
        ) : (
          <Text type="secondary">No hay archivos adjuntos</Text>
        )}
      </Card>
    </>
  );
}
