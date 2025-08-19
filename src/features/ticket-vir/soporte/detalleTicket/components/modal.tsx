"use client";
import { Area } from "@/interface/area";
import { Ticket } from "@/interface/ticket_ti";
import { getAreas } from "@/services/area"; // ✅ Faltaba importar esto
import { derivarTicket } from "@/services/ticket_ti";
import { Button, Form, message, Modal, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useRouter } from "next/navigation";
import { forwardRef, useImperativeHandle, useState } from "react";

interface Props {
  ticket: Ticket;
}

interface ModalHandle {
  openModal: () => void;
}

const ComponenteModal = forwardRef<ModalHandle, Props>(({ ticket }, ref) => {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form] = Form.useForm();
  const [areas, setAreas] = useState<Area[]>([]);

  useImperativeHandle(ref, () => ({
    openModal: () => {
      setIsModalOpen(true);
      fetchAreas();
    },
  }));

  const fetchAreas = async () => {
    try {
      const data = await getAreas();
      setAreas(data);
    } catch (error) {
      console.error("Error al obtener áreas:", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleFinish = async (values: {
    area_id: number;
    categoria_id: number;
    motivo: string;
  }) => {
    const data = {
      a_area_id: values.area_id,
      nueva_categoria_id: values.categoria_id,
      motivo: values.motivo,
    };

    try {
      await derivarTicket(ticket.id, data);
      message.success("Solicitud enviada correctamente");
      form.resetFields();
      setIsModalOpen(false);
      router.push("/ticket/soporte");
    } catch (error) {
      console.error("error =>", error);
      message.error("No se pudo derivar el ticket");
    }
  };

  const handleAreaChange = async () => {
    form.setFieldsValue({
      catalogo_servicio_id: undefined,
      tipo: undefined,
      incidencia_id: undefined,
      categoria_id: undefined,
    });
  };

  return (
    <Modal
      title="Derivar Ticket"
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        autoComplete="off"
      >
        <Form.Item label="Área" name="area_id" rules={[{ required: true }]}>
          <Select placeholder="Seleccione un área" onChange={handleAreaChange}>
            {areas
              .filter((area) => area.id !== ticket?.area_id)
              .map((area) => (
                <Select.Option key={area.id} value={area.id}>
                  {area.nombre}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Motivo"
          name="motivo"
          rules={[{ required: true, message: "Ingrese el motivo" }]}
        >
          <TextArea rows={4} placeholder="Describa el motivo" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Enviar Solicitud
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
});

ComponenteModal.displayName = "ComponenteModal";
export default ComponenteModal;
