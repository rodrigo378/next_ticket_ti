import { Button, Card, message, Modal, Select, Space, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import ComponenteModal from "./modal";
import { HD_Ticket } from "@/interface/hd/hd_ticket";
import { HD_EstadoTicket } from "@/interface/hd/hd_estadoTicket";
import { getEstados } from "@/services/hd/estado";
import { cambiarEstado } from "@/services/hd/ticket_ti";

const { Title, Text } = Typography;

interface Props {
  ticket: HD_Ticket;
  onTicketUpdate: () => void;
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
  const abrirModal = () => modalRef.current?.openModal();

  const [estados, setEstados] = useState<HD_EstadoTicket[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);

  const fetchEstados = async () => {
    try {
      setLoadingEstados(true);
      const data = await getEstados();
      setEstados(data || []);
    } catch (error) {
      console.log("error => ", error);
      message.error("No se pudieron cargar los estados.");
    } finally {
      setLoadingEstados(false);
    }
  };

  useEffect(() => {
    fetchEstados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiarEstadoHandle = async (value: number) => {
    Modal.confirm({
      title: "¿Cambiar el estado del ticket?",
      content: "Esto actualizará el estado en el sistema.",
      okText: "Sí, cambiar",
      cancelText: "No, cancelar",
      onOk: async () => {
        try {
          await cambiarEstado(ticket.id, { estado_id: Number(value) });
          message.success("✅ Estado actualizado correctamente.");
          onTicketUpdate();
        } catch (error) {
          console.log("error => ", error);
          message.error("❌ Ocurrió un error al actualizar el estado.");
        }
      },
    });
  };

  // Estados permitidos (mismo o transiciones válidas)
  const opcionesEstados = estados
    .filter(
      (estado) =>
        estado.id === ticket.estado_id ||
        transiciones[ticket.estado_id!]?.includes(estado.id)
    )
    .map((e) => ({ label: e.nombre, value: e.id }));

  return (
    <>
      <Card
        size="small"
        className="rounded-xl shadow-sm"
        style={{
          position: "sticky",
          top: 16, // alineado con SLA
          zIndex: 10,
          background: "#fff",
        }}
        bodyStyle={{ padding: 16 }}
      >
        <Title level={5} style={{ marginBottom: 12 }}>
          ⚙️ Opciones rápidas
        </Title>

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div style={{ width: "100%" }}>
            <Text strong style={{ display: "block", marginBottom: 6 }}>
              Estado
            </Text>
            <Select
              style={{ width: "100%" }}
              value={ticket.estado_id}
              options={opcionesEstados}
              loading={loadingEstados}
              onChange={cambiarEstadoHandle}
              showSearch
              optionFilterProp="label"
              placeholder="Selecciona un estado"
              dropdownMatchSelectWidth
              getPopupContainer={(trigger) =>
                trigger.parentElement as HTMLElement
              }
              size="middle"
            />
          </div>

          <div style={{ width: "100%" }}>
            <Text strong style={{ display: "block", marginBottom: 6 }}>
              Derivar a área
            </Text>
            <Button type="primary" block onClick={abrirModal}>
              Derivar
            </Button>
          </div>
        </Space>
      </Card>

      <ComponenteModal ref={modalRef} ticket={ticket!} />
    </>
  );
};
