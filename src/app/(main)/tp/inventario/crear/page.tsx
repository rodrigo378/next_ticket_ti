// components/tp/CreateInventarioForm.tsx
"use client";

import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Alert,
  Button,
  Divider,
  Row,
  Col,
  message,
  Tooltip,
  Select,
  Skeleton,
  Modal,
  Space,
  Divider as AntDivider,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createInventario } from "@/services/tp/inventario";
import { applyFormErrors } from "@/shared/ui/errors/applyFormErrors";
import { NormalizedError } from "@/services/api";
import { handleApiError } from "@/shared/ui/errors/handleApiError";
import { tpErrorMap } from "@/features/tp/errors/errorMap.tp";
import { InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";

// Servicios de ubicaciones
import { getUbicaciones, createUbicacion } from "@/services/tp/ubicacion";
import type { TP_Ubicacion } from "@/interfaces/tp";

type NuevaUbicacionForm = {
  nombre: string;
  descripcion?: string;
  direccion?: string;
  tipo?: string;
};

// ──────────────────────────────────────────────────────────────────────────────
// Sub-componente local (en el mismo archivo) para crear ubicaciones
// ──────────────────────────────────────────────────────────────────────────────
function NuevaUbicacionModal({
  open,
  onCancel,
  onCreated,
}: {
  open: boolean;
  onCancel: () => void;
  onCreated: (created: TP_Ubicacion) => void;
}) {
  const [formUbic] = Form.useForm<NuevaUbicacionForm>();
  const [saving, setSaving] = useState(false);

  const handleOk = async () => {
    try {
      const values = await formUbic.validateFields();
      setSaving(true);
      const payload: Partial<TP_Ubicacion> = {
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || undefined,
        direccion: values.direccion?.trim() || undefined,
        tipo: values.tipo?.trim() || undefined,
      };
      const created = await createUbicacion(payload);
      message.success("Ubicación creada.");
      onCreated(created);
      formUbic.resetFields();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (err && (err as any).errorFields) return; // errores de validación
      message.error("No se pudo crear la ubicación.");
      // puedes loguear o mapear errores si tu API los devuelve normalizados
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Nueva ubicación"
      okText="Guardar"
      cancelText="Cancelar"
      onCancel={() => {
        if (!saving) onCancel();
      }}
      onOk={handleOk}
      confirmLoading={saving}
      destroyOnClose
    >
      <Form form={formUbic} layout="vertical" preserve={false}>
        <Form.Item
          label="Nombre"
          name="nombre"
          rules={[
            { required: true, message: "Ingrese el nombre de la ubicación" },
            { max: 100, message: "Máximo 100 caracteres" },
          ]}
        >
          <Input placeholder="Ej: Almacén Central / Estante A-3" />
        </Form.Item>

        <Form.Item
          label="Descripción"
          name="descripcion"
          rules={[{ max: 200, message: "Máximo 200 caracteres" }]}
        >
          <Input placeholder="Referencia breve" />
        </Form.Item>

        <Form.Item
          label="Dirección"
          name="direccion"
          rules={[{ max: 200, message: "Máximo 200 caracteres" }]}
        >
          <Input placeholder="(Opcional) Ubicación física" />
        </Form.Item>

        <Form.Item
          label="Tipo"
          name="tipo"
          rules={[{ max: 50, message: "Máximo 50 caracteres" }]}
        >
          <Input placeholder="Ej: almacén, anaquel, aula, etc." />
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Form principal
// ──────────────────────────────────────────────────────────────────────────────
export default function CreateInventarioForm() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // Estado de ubicaciones
  const [ubicLoading, setUbicLoading] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<TP_Ubicacion[]>([]);
  const [openNuevaUbic, setOpenNuevaUbic] = useState(false);

  const router = useRouter();

  // watch para habilitar/deshabilitar según perecible
  const esPerecible: boolean = Form.useWatch("esPerecible", form) ?? false;

  // cargar ubicaciones
  useEffect(() => {
    const loadUbicaciones = async () => {
      try {
        setUbicLoading(true);
        const data = await getUbicaciones();
        setUbicaciones(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("getUbicaciones error =>", e);
        message.warning("No se pudieron cargar las ubicaciones.");
        setUbicaciones([]);
      } finally {
        setUbicLoading(false);
      }
    };
    loadUbicaciones();
  }, []);

  const ubicacionOptions = useMemo(
    () =>
      ubicaciones.map((u) => ({
        label: u.nombre,
        value: u.id,
      })),
    [ubicaciones]
  );

  // cuando se crea una ubicación nueva desde el modal
  const handleUbicacionCreada = (created: TP_Ubicacion) => {
    setUbicaciones((prev) => {
      const next = [...prev, created].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      );
      return next;
    });
    // seleccionar automáticamente la nueva
    form.setFieldsValue({ ubicacion_id: created.id });
    setOpenNuevaUbic(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: Record<string, any>) => {
    const esP = !!values.esPerecible;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {
      codigo: values.codigo?.trim(),
      nombre: values.nombre?.trim(),
      unidadBase: values.unidadBase ?? null,
      esPerecible: esP,
      stockMinimo:
        typeof values.stockMinimo === "number" ? values.stockMinimo : null,
      activo: values.activo !== false,
      // Solo para NO perecibles: permitir stockGlobal inicial y ubicación a nivel de inventario
      ...(esP
        ? {}
        : {
            stockGlobal:
              typeof values.stockGlobal === "number"
                ? values.stockGlobal
                : undefined,
            // el back espera ubicacion_id (número)
            ubicacion_id:
              typeof values.ubicacion_id === "number"
                ? values.ubicacion_id
                : null,
          }),
    };

    try {
      setSaving(true);
      await createInventario(payload);
      message.success("Inventario creado correctamente.");
      router.push("/tp/inventario");
    } catch (e) {
      const err = e as NormalizedError;
      const painted = applyFormErrors(form, err);
      if (!painted) handleApiError(err, tpErrorMap);
      console.error("createInventario error =>", err);
      message.error("No se pudo crear el inventario.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Nuevo Inventario" bordered={false} className="shadow-sm">
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Información"
        description={
          <>
            <div>
              • Si el ítem es <b>perecible</b>, el stock global se gestiona por{" "}
              <b>lotes</b> (la ubicación se define por lote).
            </div>
            <div>
              • El <b>código de barras</b> se generará automáticamente (ej.
              INV-00000001).
            </div>
          </>
        }
      />

      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={{ esPerecible: false, activo: true }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Código"
              name="codigo"
              tooltip="Identificador único del inventario"
              rules={[{ required: true, message: "Ingrese el código" }]}
            >
              <Input placeholder="Ej: ALG-001" allowClear />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item
              label="Nombre"
              name="nombre"
              tooltip="Nombre comercial o descriptivo"
              rules={[{ required: true, message: "Ingrese el nombre" }]}
            >
              <Input placeholder="Ej: Algodón hidrófilo 500g" allowClear />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Unidad base"
              name="unidadBase"
              tooltip="Unidad de control principal"
            >
              <Input placeholder="Ej: unidad, caja, frasco, kg" allowClear />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={
                <>
                  Stock mínimo{" "}
                  <Tooltip title="Umbral para alertas de reposición">
                    <InfoCircleOutlined />
                  </Tooltip>
                </>
              }
              name="stockMinimo"
              rules={[
                {
                  type: "number",
                  min: 0,
                  message: "El stock mínimo no puede ser negativo",
                },
              ]}
            >
              <InputNumber placeholder="0" min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            {/* Ubicación solo para no perecibles */}
            <Form.Item
              label={
                <>
                  Ubicación (no perecibles){" "}
                  <Tooltip title="Para ítems no perecibles asigna ubicación a nivel de inventario. Para perecibles, la ubicación se define por lote.">
                    <InfoCircleOutlined />
                  </Tooltip>
                </>
              }
              name="ubicacion_id"
              rules={
                !esPerecible
                  ? [
                      {
                        required: false,
                        message: "Seleccione una ubicación",
                      },
                    ]
                  : []
              }
            >
              {ubicLoading ? (
                <Skeleton.Input active style={{ width: "100%" }} />
              ) : (
                <Select
                  allowClear
                  placeholder={
                    esPerecible
                      ? "Deshabilitado para perecibles"
                      : "Seleccione una ubicación"
                  }
                  options={ubicacionOptions}
                  disabled={esPerecible}
                  showSearch
                  optionFilterProp="label"
                  // Pie custom en el dropdown: botón para crear nueva
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <AntDivider style={{ margin: "8px 0" }} />
                      <Space
                        style={{
                          padding: "0 8px 8px",
                          width: "100%",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          onClick={() => setOpenNuevaUbic(true)}
                          block
                        >
                          Nueva ubicación
                        </Button>
                      </Space>
                    </>
                  )}
                />
              )}
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Row gutter={16}>
              <Col xs={12}>
                <Form.Item
                  label="Perecible"
                  name="esPerecible"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>

              <Col xs={12}>
                <Form.Item label="Activo" name="activo" valuePropName="checked">
                  <Switch defaultChecked />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Stock global inicial (solo aplica si NO es perecible) */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={
                <>
                  Stock global inicial{" "}
                  <Tooltip
                    className="ms-1"
                    title="Solo para productos no perecibles. Si es perecible, el stock se maneja por lotes."
                  >
                    <InfoCircleOutlined />
                  </Tooltip>
                </>
              }
              name="stockGlobal"
              rules={[
                {
                  type: "number",
                  min: 0,
                  message: "El stock no puede ser negativo",
                },
              ]}
            >
              <InputNumber
                placeholder="0"
                min={0}
                style={{ width: "100%" }}
                disabled={esPerecible}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <div className="flex gap-2 justify-end">
          <Button onClick={() => form.resetFields()}>Cancelar</Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            Guardar
          </Button>
        </div>
      </Form>

      {/* Modal para crear ubicación (mismo archivo) */}
      <NuevaUbicacionModal
        open={openNuevaUbic}
        onCancel={() => setOpenNuevaUbic(false)}
        onCreated={handleUbicacionCreada}
      />
    </Card>
  );
}
