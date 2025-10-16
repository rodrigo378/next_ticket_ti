import {
  Button,
  Card,
  message,
  Modal,
  Select,
  Space,
  Typography,
  theme,
  Tooltip,
} from "antd";
import { useEffect, useRef, useState } from "react";
import ComponenteModal from "./modal";
import { HD_Ticket, HD_EstadoTicket } from "@interfaces/hd";
import { cambiarEstado, getEstados } from "@services/hd";
import { useUsuario } from "@/context/UserContext";

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

  const { usuario } = useUsuario();

  const [estados, setEstados] = useState<HD_EstadoTicket[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);

  // ✅ Permiso: solo el asignado puede gestionar
  const puedeGestionar =
    String(usuario?.id ?? "") === String(ticket?.asignado_id ?? "");

  const abrirModal = () => {
    if (!puedeGestionar) {
      message.warning("No puedes derivar un ticket que no te pertenece.");
      return;
    }
    modalRef.current?.openModal();
  };

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
    if (!puedeGestionar) {
      message.warning(
        "No puedes cambiar el estado de un ticket que no te pertenece."
      );
      return;
    }
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

  const disableControles = loadingEstados || !puedeGestionar;

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
            <Tooltip
              title={!puedeGestionar ? "Este ticket no te pertenece." : ""}
            >
              <Select
                className="op-quick__select"
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
                disabled={disableControles}
              />
            </Tooltip>
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
            <Tooltip
              title={!puedeGestionar ? "Este ticket no te pertenece." : ""}
            >
              <Button
                type="primary"
                block
                onClick={abrirModal}
                className="op-quick__btn-primary"
                disabled={disableControles}
              >
                Derivar
              </Button>
            </Tooltip>
          </div>
        </Space>
      </Card>

      <ComponenteModal ref={modalRef} ticket={ticket!} />

      <style jsx global>{`
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
