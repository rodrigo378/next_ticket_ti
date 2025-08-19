import { EstadoTicket } from "@/interface/estado";
import { Ticket } from "@/interface/ticket_ti";
import { getEstados } from "@/services/estado";
import {
  Button,
  Card,
  Col,
  message,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import { useEffect, useRef, useState } from "react";
import ComponenteModal from "./modal";
import { cambiarEstado } from "@/services/ticket_ti";
const { Title, Text } = Typography;

interface Props {
  ticket: Ticket;
  onTicketUpdate: () => void; // nueva prop para actualizar ticket
}

const transiciones: Record<number, number[]> = {
  1: [2],
  2: [3, 6],
  3: [4, 6],
  4: [5],
  // 5: [3],
};

interface ModalHandle {
  openModal: () => void;
}

export const CardOpcionesRapidas = ({ ticket, onTicketUpdate }: Props) => {
  const modalRef = useRef<ModalHandle>(null);
  const abrirModal = () => {
    console.log("click");
    modalRef.current?.openModal();
  };

  const [estados, setEstados] = useState<EstadoTicket[]>([]);

  const fechEstados = async () => {
    try {
      const data = await getEstados();
      setEstados(data);
    } catch (error) {
      console.log("error => ", error);
    }
  };

  useEffect(() => {
    fechEstados();
  }, []);

  const cambiarEstadoHandle = async (values: number) => {
    Modal.confirm({
      title: "¿Está seguro de cambiar el estado del ticket?",
      content: "Esto actualizará el estado del ticket en el sistema.",
      okText: "Sí, cambiar",
      cancelText: "No, cancelar",
      onOk: async () => {
        try {
          await cambiarEstado(ticket.id, { estado_id: Number(values) });
          message.success("✅ Estado del ticket actualizado correctamente."); // 🎉 mensaje de éxito
          onTicketUpdate();
        } catch (error) {
          console.log("error => ", error);
          message.error("❌ Ocurrió un error al actualizar el estado."); // mensaje de error opcional
        }
      },
    });
  };

  return (
    <>
      <Card
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
              {ticket && (
                <Select
                  style={{ width: "100%" }}
                  value={ticket.estado_id}
                  onChange={cambiarEstadoHandle}
                >
                  {estados
                    .filter(
                      (estado) =>
                        estado.id === ticket.estado_id ||
                        transiciones[ticket.estado_id!]?.includes(estado.id)
                    )
                    .map((estado) => (
                      <option key={estado.id} value={estado.id}>
                        {estado.nombre}
                      </option>
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
      </Card>
      <ComponenteModal ref={modalRef} ticket={ticket!} />
    </>
  );
};
