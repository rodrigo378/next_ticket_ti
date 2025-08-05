"use client";
import { Area } from "@/interface/area";
import { CatalogoServicio } from "@/interface/catalogo";
import { Incidencia } from "@/interface/incidencia";
import { Ticket } from "@/interface/ticket_ti";
import { getAreas } from "@/services/area"; // ✅ Faltaba importar esto
import { getCatalogo } from "@/services/catalogo";
import { getIncidencias } from "@/services/incidencias";
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
  const [tipo, setTipo] = useState<string | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [catalogos, setCatalogos] = useState<CatalogoServicio[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const incidenciaId = Form.useWatch("incidencia_id", form);

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
    setCatalogos([]);
    setIncidencias([]);
    setTipo(null);
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
      setCatalogos([]);
      setIncidencias([]);
      setTipo(null);
      setIsModalOpen(false);
      router.push("/ticket/soporte");
    } catch (error) {
      console.error("error =>", error);
      message.error("No se pudo derivar el ticket");
    }
  };

  const handleAreaChange = async (area_id: number) => {
    form.setFieldsValue({
      catalogo_servicio_id: undefined,
      tipo: undefined,
      incidencia_id: undefined,
      categoria_id: undefined,
    });
    setTipo(null);
    setIncidencias([]);
    try {
      const data = await getCatalogo(String(area_id));
      setCatalogos(data);
    } catch {
      message.error("Error al cargar el catálogo");
    }
  };

  const handleCatalogoChange = () => {
    form.setFieldsValue({
      tipo: undefined,
      incidencia_id: undefined,
      categoria_id: undefined,
    });
    setTipo(null);
    setIncidencias([]);
  };

  const handleIncidenciaChange = () => {
    form.setFieldsValue({ categoria_id: undefined });
  };

  const handleTipoChange = async (value: string) => {
    setTipo(value);
    form.setFieldsValue({ incidencia_id: undefined, categoria_id: undefined });
    const catalogo_id = form.getFieldValue("catalogo_servicio_id");
    if (value && catalogo_id) {
      try {
        const data = await getIncidencias(value, String(catalogo_id));
        setIncidencias(data);
      } catch {
        message.error("Error al cargar incidencias");
      }
    }
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
          label="Catálogo de Servicio"
          name="catalogo_servicio_id"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Seleccione un catálogo"
            disabled={!form.getFieldValue("area_id")}
            onChange={handleCatalogoChange}
          >
            {catalogos.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.nombre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Tipo" name="tipo" rules={[{ required: true }]}>
          <Select
            placeholder="Seleccione tipo"
            disabled={!form.getFieldValue("catalogo_servicio_id")}
            onChange={handleTipoChange}
          >
            <Select.Option value="incidencia">Incidencia</Select.Option>
            <Select.Option value="requerimiento">Requerimiento</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Incidencia o Requerimiento"
          name="incidencia_id"
          rules={[{ required: true }]}
        >
          <Select
            placeholder="Seleccione opción"
            disabled={!tipo}
            onChange={handleIncidenciaChange}
          >
            {incidencias.map((i) => (
              <Select.Option key={i.id} value={i.id}>
                {i.nombre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Categoría" name="categoria_id">
          <Select placeholder="Seleccione categoría" disabled={!incidenciaId}>
            {incidencias
              .find((i) => i.id === incidenciaId)
              ?.categoria?.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.nombre}
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
