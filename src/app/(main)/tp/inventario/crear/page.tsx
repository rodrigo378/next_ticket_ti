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
} from "antd";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInventario } from "@/services/tp/inventario";
import { applyFormErrors } from "@/shared/ui/errors/applyFormErrors";
import { NormalizedError } from "@/services/api";
import { handleApiError } from "@/shared/ui/errors/handleApiError";
import { tpErrorMap } from "@/features/tp/errors/errorMap.tp";
import { InfoCircleOutlined } from "@ant-design/icons";

export default function CreateInventarioForm() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // watch para habilitar/deshabilitar stockGlobal según perecible
  const esPerecible: boolean = Form.useWatch("esPerecible", form) ?? false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onFinish = async (values: Record<string, any>) => {
    const esP = !!values.esPerecible;

    const payload = {
      codigo: values.codigo?.trim(),
      nombre: values.nombre?.trim(),
      unidadBase: values.unidadBase ?? null,
      esPerecible: esP,
      stockMinimo:
        typeof values.stockMinimo === "number" ? values.stockMinimo : null,
      ubicacion: values.ubicacion ?? null,
      activo: values.activo !== false,
      // Si NO es perecible, enviamos stockGlobal inicial (opcional).
      // Si es perecible, que el back lo gestione por lotes (ignorar).
      ...(esP
        ? {}
        : {
            stockGlobal:
              typeof values.stockGlobal === "number"
                ? values.stockGlobal
                : undefined,
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
              <b>lotes</b>.
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
            <Form.Item
              label="Ubicación"
              name="ubicacion"
              tooltip="Referencia de almacén o anaquel"
            >
              <Input
                placeholder="Ej: Almacén central / Estante A-3"
                allowClear
              />
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
    </Card>
  );
}
