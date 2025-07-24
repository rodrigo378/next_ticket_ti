"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Form,
  Input,
  Select,
  Typography,
  Button,
  Upload,
  message,
  Row,
  Col,
  Card,
  Divider,
  Steps,
  Descriptions,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

import { Area, Subarea } from "@/interface/area";
import { Categoria, Incidencia } from "@/interface/incidencia";
import { getAreas } from "@/services/area";
import { getIncidencias } from "@/services/incidencias";
import { createTicketTi } from "@/services/ticket_ti";
import { useRouter } from "next/navigation";
import Link from "next/link";

const { Title, Text } = Typography;
const { TextArea } = Input;

const STEPS = [
  { title: "Área / Subárea" },
  { title: "Tipo / Incidencia / Categoría" },
  { title: "Detalles / Adjuntos" },
  { title: "Confirmación" },
] as const;

export default function Page() {
  const router = useRouter();
  const [form] = Form.useForm();

  const [current, setCurrent] = useState(0);

  // Catálogos
  const [areas, setAreas] = useState<Area[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Estado UI
  const [tipo, setTipo] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  // ========= Fetch inicial =========
  useEffect(() => {
    (async () => {
      try {
        const data = await getAreas();
        setAreas(data);
      } catch (err) {
        console.error(err);
        message.error("No se pudieron cargar las áreas");
      }
    })();
  }, []);

  // ========= Handlers =========
  const handleAreaChange = (areaId: number) => {
    const subs = areas.find((a) => a.id === Number(areaId))?.Subarea || [];
    setSubareas(subs);
    // Limpia dependientes
    form.setFieldsValue({
      subarea_id: undefined,
      tipo: undefined,
      incidencia_id: undefined,
      categoria_id: undefined,
      descripcion: undefined,
    });
    setTipo(null);
    setIncidencias([]);
    setCategorias([]);
  };

  const handleSubareaChange = () => {
    form.setFieldsValue({
      tipo: undefined,
      incidencia_id: undefined,
      categoria_id: undefined,
    });
    setTipo(null);
    setIncidencias([]);
    setCategorias([]);
  };

  const handleTipoChange = async (value: string) => {
    setTipo(value);

    form.setFieldsValue({
      incidencia_id: undefined,
      categoria_id: undefined,
    });
    setIncidencias([]);
    setCategorias([]);

    const subarea_id = form.getFieldValue("subarea_id");

    try {
      const data = await getIncidencias(value);
      setIncidencias(
        subarea_id
          ? data.filter((i) => i.subarea_id === Number(subarea_id))
          : data
      );
    } catch (err) {
      console.error(err);
      message.error("No se pudieron cargar las incidencias");
    }
  };

  const handleIncidenciaChange = (incidenciaId: number) => {
    const incidencia = incidencias.find((i) => i.id === incidenciaId);
    const cats = incidencia?.categorias || [];
    setCategorias(cats);
    form.setFieldsValue({
      categoria_id: undefined,
    });
  };

  // ========= Validaciones por paso =========
  const stepFieldMap: Record<number, string[]> = {
    0: ["area_id", "subarea_id"],
    1: ["tipo", "incidencia_id", "categoria_id"],
    2: ["descripcion"], // archivos son opcionales
    3: [], // confirmación (sin nuevos campos)
  };

  const next = async () => {
    try {
      await form.validateFields(stepFieldMap[current]);
      setCurrent((c) => c + 1);
    } catch {
      // AntD ya muestra los errores
    }
  };

  const prev = () => setCurrent((c) => c - 1);

  // ========= Submit =========
  const onSubmit = async () => {
    try {
      // Validamos TODO antes de enviar
      await form.validateFields();
      const values = form.getFieldsValue(true);
      setLoading(true);

      const formData = new FormData();
      formData.append("descripcion", values.descripcion);
      formData.append("incidencia_id", values.incidencia_id);
      formData.append("categoria_id", values.categoria_id);

      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("archivos", file.originFileObj);
        }
      });

      await createTicketTi(formData);
      message.success("🎉 Ticket creado exitosamente");
      router.push("/ticket");
    } catch (error) {
      console.error("❌ Error:", error);
      message.error("Error al crear el ticket");
    } finally {
      setLoading(false);
    }
  };

  // ========= Resumen (Step 4) =========
  const resumen = useMemo(() => {
    const v = form.getFieldsValue(true);

    // Mapeo de nombres legibles
    const labels: Record<string, string> = {
      area_id: "Área",
      subarea_id: "Subárea",
      tipo: "Tipo de solicitud",
      incidencia_id: "Incidencia",
      categoria_id: "Categoría",
      descripcion: "Descripción",
    };

    const area = areas.find((a) => a.id === v.area_id)?.nombre ?? "-";
    const subarea = subareas.find((s) => s.id === v.subarea_id)?.nombre ?? "-";
    const incidencia =
      incidencias.find((i) => i.id === v.incidencia_id)?.nombre ?? "-";
    const categoria =
      categorias.find((c) => c.id === v.categoria_id)?.nombre ?? "-";

    // Campos a mostrar
    const data: Record<string, string> = {
      area_id: area,
      subarea_id: subarea,
      tipo: v.tipo || "-",
      incidencia_id: incidencia,
      categoria_id: categoria,
      descripcion: v.descripcion || "-",
    };

    return (
      <Descriptions bordered column={1} size="middle">
        {Object.entries(data).map(([key, value]) => (
          <Descriptions.Item key={key} label={labels[key] || key}>
            {value}
          </Descriptions.Item>
        ))}

        <Descriptions.Item label="Archivos adjuntos">
          {fileList.length ? (
            <ul style={{ paddingLeft: "0px", margin: 0 }}>
              {fileList.map((file, index) => (
                <li key={index}>
                  <Link
                    href={URL.createObjectURL(file.originFileObj!)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            "— (ninguno)"
          )}
        </Descriptions.Item>
      </Descriptions>
    );
  }, [areas, subareas, incidencias, categorias, fileList, form]);

  // ========= Render por paso =========
  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<Text strong>Área</Text>}
                name="area_id"
                rules={[{ required: true, message: "Selecciona el área" }]}
              >
                <Select
                  placeholder="Selecciona el área"
                  onChange={handleAreaChange}
                  allowClear
                  size="large"
                >
                  {areas.map((area) => (
                    <Select.Option key={area.id} value={area.id}>
                      {area.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={<Text strong>Subárea</Text>}
                name="subarea_id"
                rules={[{ required: true, message: "Selecciona una subárea" }]}
              >
                <Select
                  placeholder="Selecciona una subárea"
                  disabled={subareas.length === 0}
                  onChange={handleSubareaChange}
                  allowClear
                  size="large"
                >
                  {subareas.map((s) => (
                    <Select.Option key={s.id} value={s.id}>
                      {s.nombre}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        );

      case 1:
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<Text strong>Tipo de solicitud</Text>}
                  name="tipo"
                  rules={[{ required: true, message: "Selecciona el tipo" }]}
                >
                  <Select
                    placeholder="Selecciona tipo"
                    disabled={!form.getFieldValue("subarea_id")}
                    onChange={handleTipoChange}
                    size="large"
                  >
                    <Select.Option value="incidencia">Incidencia</Select.Option>
                    <Select.Option value="requerimiento">
                      Requerimiento
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={<Text strong>Problema</Text>}
                  name="incidencia_id"
                  rules={[
                    { required: true, message: "Selecciona un problema" },
                  ]}
                >
                  <Select
                    placeholder="Selecciona una incidencia"
                    disabled={!tipo}
                    onChange={handleIncidenciaChange}
                    size="large"
                  >
                    {incidencias.map((i) => (
                      <Select.Option key={i.id} value={i.id}>
                        {i.nombre}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<Text strong>Categoría</Text>}
                  name="categoria_id"
                  rules={[
                    { required: true, message: "Selecciona una categoría" },
                  ]}
                >
                  <Select
                    placeholder="Selecciona una categoría"
                    disabled={categorias.length === 0}
                    size="large"
                  >
                    {categorias.map((c) => (
                      <Select.Option key={c.id} value={c.id}>
                        {c.nombre}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      case 2:
        return (
          <>
            <Form.Item
              label={<Text strong>Descripción detallada</Text>}
              name="descripcion"
              rules={[{ required: true, message: "Describe el problema" }]}
            >
              <TextArea
                rows={4}
                placeholder="Describe con detalle el problema o requerimiento..."
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            <Form.Item label={<Text strong>Adjuntar archivos (opcional)</Text>}>
              <Upload
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                maxCount={5}
              >
                <Button icon={<UploadOutlined />} size="middle">
                  Seleccionar archivos
                </Button>
              </Upload>
            </Form.Item>
          </>
        );

      case 3:
        return (
          <>
            <Title level={4} className="mb-4">
              ✅ Confirma tu ticket
            </Title>
            {resumen}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <Card className="shadow-md" style={{ borderRadius: 12, padding: 20 }}>
        <Title level={3} className="text-center">
          📝 Crear Nuevo Ticket
        </Title>

        <Steps
          current={current}
          items={STEPS.map((s) => ({ title: s.title }))}
          style={{ marginTop: 24 }}
        />

        <Divider />

        <Form layout="vertical" form={form}>
          <div style={{ marginTop: 24 }}>{renderStepContent()}</div>

          <Divider />

          <div className="flex justify-between">
            <div>
              {current > 0 && (
                <Button onClick={prev} disabled={loading}>
                  Anterior
                </Button>
              )}
            </div>

            <div className="ml-auto">
              {current < STEPS.length - 1 && (
                <Button type="primary" onClick={next} disabled={loading}>
                  Siguiente
                </Button>
              )}

              {current === STEPS.length - 1 && (
                <Button
                  type="primary"
                  onClick={onSubmit}
                  loading={loading}
                  disabled={loading}
                >
                  Crear Ticket
                </Button>
              )}
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}
