import { EstadoTicket } from "@/interface/estado";
import { Ticket } from "@/interface/ticket_ti";
import { Button, Card, Col, Modal, Row, Select, Space, Typography } from "antd";
import { useRef, useState } from "react";
const { Title, Text } = Typography;

interface Props {
  ticket: Ticket;
  estados: EstadoTicket;
}

const transiciones: Record<number, number[]> = {
  1: [2],
  2: [3, 6],
  3: [4, 5],
  4: [5],
};

interface ModalHandle {
  openModal: () => void;
}

export const CardOpcionesRapidas = ({ ticket, estados }: Props) => {
  const modalRef = useRef<ModalHandle>(null);
  const abrirModal = () => {
    console.log("click");

    modalRef.current?.openModal();
  };

  const [estados, setEstados] = useState<EstadoTicket[]>([]);

  const cambiarEstado = async (values: number) => {
    Modal.confirm({
      title: "¿Está seguro de cambiar el estado del ticket?",
      content: "Esto actualizará el estado del ticket en el sistema.",
      okText: "Sí, cambiar",
      cancelText: "No, cancelar",
      // onOk: async () => {
      //   try {
      //     await updateTicket(Number(id), { estado_id: Number(values) });
      //     fetchTicket(id);
      //   } catch (error) {
      //     console.log("error => ", error);
      //   }
      // },
    });
  };

  return (
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
                onChange={cambiarEstado}
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
  );
};
