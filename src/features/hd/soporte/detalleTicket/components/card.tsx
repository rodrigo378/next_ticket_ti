import {
  Button,
  Card,
  message,
  Modal,
  Select,
  Space,
  Typography,
  theme,
} from "antd";
import { useEffect, useRef, useState } from "react";
import ComponenteModal from "./modal";
import { HD_Ticket, HD_EstadoTicket } from "@interfaces/hd";
import { getEstados } from "@/features/hd/service/estado";
import { cambiarEstado } from "@/features/hd/service/ticket_ti";

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
};

interface ModalHandle {
  openModal: () => void;
}

export const CardOpcionesRapidas = ({ ticket, onTicketUpdate }: Props) => {
  const { token } = theme.useToken();
  const modalRef = useRef<ModalHandle>(null);
  const abrirModal = () => modalRef.current?.openModal();

  const [estados, setEstados] = useState<HD_EstadoTicket[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingEstados(true);
        const data = await getEstados();
        setEstados(data || []);
      } catch {
        message.error("No se pudieron cargar los estados.");
      } finally {
        setLoadingEstados(false);
      }
    })();
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
        } catch {
          message.error("❌ Ocurrió un error al actualizar el estado.");
        }
      },
    });
  };

  const opcionesEstados = estados
    .filter(
      (e) =>
        e.id === ticket.estado_id ||
        transiciones[ticket.estado_id!]?.includes(e.id)
    )
    .map((e) => ({ label: e.nombre, value: e.id }));

  return (
    <>
      <Card
        size="small"
        className="rounded-xl shadow-sm"
        style={{
          position: "sticky",
          top: 16,
          zIndex: 10,
          background: token.colorBgContainer,
          borderColor: token.colorBorderSecondary,
          boxShadow: token.boxShadowTertiary,
        }}
      >
        <Title
          level={5}
          style={{ marginBottom: 12, color: token.colorTextHeading }}
        >
          ⚙️ Opciones rápidas
        </Title>

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div style={{ width: "100%" }}>
            <Text
              strong
              style={{
                display: "block",
                marginBottom: 6,
                color: token.colorText,
              }}
            >
              Estado
            </Text>
            <Select
              className="op-quick__select"
              /* ✅ en Select v5: usar popupClassName */
              style={{ width: "100%" }}
              value={ticket.estado_id}
              options={opcionesEstados}
              loading={loadingEstados}
              onChange={cambiarEstadoHandle}
              showSearch
              optionFilterProp="label"
              placeholder="Selecciona un estado"
              getPopupContainer={(trigger) =>
                trigger.parentElement as HTMLElement
              }
              size="middle"
            />
          </div>

          <div style={{ width: "100%" }}>
            <Text
              strong
              style={{
                display: "block",
                marginBottom: 6,
                color: token.colorText,
              }}
            >
              Derivar a área
            </Text>
            <Button
              type="primary"
              block
              onClick={abrirModal}
              className="op-quick__btn-primary"
            >
              Derivar
            </Button>
          </div>
        </Space>
      </Card>

      <ComponenteModal ref={modalRef} ticket={ticket!} />

      {/* Overrides para que el overlay no se vea blanco */}
      <style jsx global>{`
        /* Botón primary sin borde blanco */
        .op-quick__btn-primary,
        .op-quick__btn-primary:hover,
        .op-quick__btn-primary:focus,
        .op-quick__btn-primary:active {
          border-color: transparent !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
};
