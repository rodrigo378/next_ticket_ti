"use client";

import {
  Card,
  Descriptions,
  Tag,
  Typography,
  List,
  Input,
  Button,
  Select,
  Modal,
  Row,
  Col,
  Space,
} from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createMensaje, getTicket, updateTicket } from "@/services/ticket_ti";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { getEstados } from "@/services/estado";
import { Ticket } from "@/interface/ticket_ti";
import { EstadoTicket } from "@/interface/estado";
import ComponenteModal from "@/components/ticket/modal";
import { CardOpcionesRapidas } from "@/components/ticket/card";
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

dayjs.extend(relativeTime);
dayjs.locale("es");

const transiciones: Record<number, number[]> = {
  1: [2],
  2: [3, 6],
  3: [4, 5],
  4: [5],
};
interface ModalHandle {
  openModal: () => void;
}

export default function Page() {
  const params = useParams();

  const modalRef = useRef<ModalHandle>(null);
  const abrirModal = () => {
    console.log("click");
    modalRef.current?.openModal();
  };

  const id = params.id as string;
  const [Ticket, setTicket] = useState<Ticket | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [estados, setEstados] = useState<EstadoTicket[]>([]);

  const fetchTicket = async (id: string) => {
    try {
      const data = await getTicket(Number(id));
      setTicket(data);
    } catch (error) {
      console.error("Error al obtener ticket:", error);
    }
  };

  const fechEstados = async () => {
    try {
      const data = await getEstados();
      setEstados(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  const handleEnviarMensaje = async () => {
    try {
      await createMensaje({
        ticket_id: Number(id),
        contenido: nuevoMensaje,
      });
      const res = await getTicket(Number(id));
      setTicket(res);
      setNuevoMensaje("");
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  const cambiarEstado = async (values: number) => {
    Modal.confirm({
      title: "¿Está seguro de cambiar el estado del ticket?",
      content: "Esto actualizará el estado del ticket en el sistema.",
      okText: "Sí, cambiar",
      cancelText: "No, cancelar",
      onOk: async () => {
        try {
          await updateTicket(Number(id), { estado_id: Number(values) });
          fetchTicket(id);
        } catch (error) {
          console.log("error => ", error);
        }
      },
    });
  };

  useEffect(() => {
    fechEstados();
    fetchTicket(id);
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4 bg-white rounded-xl shadow-sm">
      {/* Opciones rápidas */}
      {/* <Card
        className="mb-6"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
        }}
      >
        <Title level={4}>⚙️ Opciones Rápidas</Title>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Text strong>Estado</Text>
              {Ticket && (
                <Select
                  style={{ width: "100%" }}
                  value={Ticket.estado_id}
                  onChange={cambiarEstado}
                >
                  {estados
                    .filter(
                      (estado) =>
                        estado.id === Ticket.estado_id ||
                        transiciones[Ticket.estado_id!]?.includes(estado.id)
                    )
                    .map((estado) => (
                      <Option key={estado.id} value={estado.id}>
                        {estado.nombre}
                      </Option>
                    ))}
                </Select>
              )}
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Text strong>Derivar a área</Text>
              <Button type="primary" block onClick={abrirModal}>
                Derivar
              </Button>
            </Space>
          </Col>
        </Row>
      </Card> */}
      <CardOpcionesRapidas
        ticket={Ticket!}
        estados={estados!}
      ></CardOpcionesRapidas>

      {/* Detalle del ticket */}
      <Title level={3}>🎟️ Detalle del Ticket</Title>
      <Card className="mb-6">
        <Descriptions column={1} size="middle" bordered>
          <Descriptions.Item label="Código">{Ticket?.codigo}</Descriptions.Item>
          <Descriptions.Item label="Tipo">
            {Ticket?.categoria?.incidencia?.tipo}
          </Descriptions.Item>
          <Descriptions.Item label={Ticket?.categoria?.incidencia?.tipo}>
            {Ticket?.categoria?.incidencia?.nombre}
          </Descriptions.Item>
          <Descriptions.Item label="Categoría">
            {Ticket?.categoria?.nombre}
          </Descriptions.Item>
          <Descriptions.Item label="Descripción">
            {Ticket?.descripcion}
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color="blue">{Ticket?.estado?.nombre}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Prioridad">
            <Tag color="red">{Ticket?.prioridad?.nombre}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de creación">
            {dayjs(Ticket?.createdAt).fromNow()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Archivos adjuntos */}
      <Card title="📎 Archivos Adjuntos" className="mb-6">
        {Ticket?.documentos?.length ? (
          <List
            dataSource={Ticket.documentos}
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

      {/* Conversación */}
      <Card title="💬 Conversación">
        <div className="mb-4 max-h-96 overflow-y-auto pr-2">
          {Ticket?.mensajes?.map((mensaje) => (
            <div key={mensaje.id} className="mb-4">
              <Text strong>{mensaje?.emisor?.nombre}</Text>
              <div className="text-gray-500 text-sm">
                {dayjs(mensaje.createdAt).fromNow()}
              </div>
              <div className="mt-1">{mensaje.contenido}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <TextArea
            rows={3}
            placeholder="Escribe un mensaje..."
            value={nuevoMensaje}
            onChange={(e) => setNuevoMensaje(e.target.value)}
          />
          <Button type="primary" className="mt-2" onClick={handleEnviarMensaje}>
            Enviar
          </Button>
        </div>
      </Card>

      {/* Modal de derivación */}
      <ComponenteModal ref={modalRef} ticket={Ticket!} />
    </div>
  );
}
