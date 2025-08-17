"use client";

import { useEffect, useState } from "react";
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
import type { StepsProps } from "antd";
import {
  UploadOutlined,
  FormOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

import { Area } from "@/interface/area";
import { Incidencia } from "@/interface/incidencia";
import { CatalogoServicio } from "@/interface/catalogo";
import { getAreas } from "@/services/area";
import { getCatalogo } from "@/services/catalogo";
import { createTicketTi } from "@/services/ticket_ti";
import { getIncidencias } from "@/services/incidencias";
import { useRouter } from "next/navigation";
import Link from "next/link";

const { Title, Text } = Typography;
const { TextArea } = Input;

const STEP_KEYS = ["datos", "detalle", "confirmacion"] as const;

// ✅ HAZLO CONSTANTE A NIVEL DE MÓDULO (no cambia entre renders)
const REQUIRED_STEP1_FIELDS = [
  "area_id",
  "catalogo_servicio_id",
  "tipo",
  "incidencia_id",
  "categoria_id",
] as const;

export default function Page() {
  const router = useRouter();
  const [form] = Form.useForm();

  const [current, setCurrent] = useState<number>(0);
  const [areas, setAreas] = useState<Area[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoServicio[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [tipo, setTipo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Tipar useWatch (evita any); si tus IDs pueden ser string, usa number | string
  const catalogoId = Form.useWatch<number>("catalogo_servicio_id", form);
  const incidenciaId = Form.useWatch<number>("incidencia_id", form);

  useEffect(() => {
    getAreas().then(setAreas);
  }, []);

  const fetchCatalogo = async (area_id: number) => {
    const data = await getCatalogo(String(area_id));
    setCatalogo(data);
  };

  const handleAreaChange = (area_id: number) => {
    form.setFieldsValue({
      catalogo_servicio_id: undefined,
      tipo: undefined,
      incidencia_id: undefined,
      categoria_id: undefined,
    });
    setTipo(null);
    setCatalogo([]);
    setIncidencias([]);
    fetchCatalogo(area_id);
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

  const handleTipoChange = async (value: string) => {
    setTipo(value);
    form.setFieldsValue({ incidencia_id: undefined, categoria_id: undefined });
    setIncidencias([]);
    const id = form.getFieldValue("catalogo_servicio_id");
    if (value && id) {
      try {
        const data = await getIncidencias(value, String(id));
        setIncidencias(data);
      } catch (error) {
        console.error("Error al cargar incidencias:", error);
      }
    }
  };

  const handleIncidenciaChange = () => {
    form.setFieldsValue({ categoria_id: undefined });
  };

  // ✅ Sin warning: la constante es estable y no hace falta ponerla en deps
  const isStep1Complete = REQUIRED_STEP1_FIELDS.every((name) =>
    Boolean(form.getFieldValue(name))
  );
  const next = async () => {
    try {
      if (current === 0) {
        await form.validateFields([...REQUIRED_STEP1_FIELDS]);
      }
      if (current === 1) {
        await form.validateFields(["descripcion"]);
      }
      setCurrent((prev) => prev + 1);
    } catch {}
  };

  const prev = () => setCurrent((prev) => prev - 1);

  const onSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue(true);
      setLoading(true);

      const formData = new FormData();
      formData.append("descripcion", values.descripcion);
      formData.append("incidencia_id", values.incidencia_id);
      formData.append("area_id", values.area_id);
      if (values.categoria_id)
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
      console.log("error => ", error);
    } finally {
      setLoading(false);
    }
  };

  const labelIncidenciaRequerimiento =
    tipo === "incidencia"
      ? "Incidencia"
      : tipo === "requerimiento"
      ? "Requerimiento"
      : "Detalle";

  const stepItems: StepsProps["items"] = [
    {
      title: "Datos del Ticket",
      description: "Área, catálogo y clasificación",
      icon: <FormOutlined />,
      status: current > 0 ? (isStep1Complete ? "finish" : "error") : "process",
    },
    {
      title: "Descripción y Adjuntos",
      description: "Detalle del problema y evidencias",
      icon: <FileTextOutlined />,
      status:
        current > 1
          ? form.getFieldValue("descripcion")
            ? "finish"
            : "error"
          : current === 1
          ? "process"
          : "wait",
    },
    {
      title: "Confirmación",
      description: "Revisa antes de enviar",
      icon: <CheckCircleOutlined />,
      status: current === 2 ? "process" : current > 2 ? "finish" : "wait",
    },
  ] as const;

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Área"
                  name="area_id"
                  rules={[{ required: true, message: "Selecciona el área" }]}
                >
                  <Select
                    placeholder="Selecciona el área"
                    onChange={handleAreaChange}
                    allowClear
                    size="large"
                    showSearch
                    optionFilterProp="label"
                    className="w-full"
                  >
                    {areas.map((area) => (
                      <Select.Option
                        key={area.id}
                        value={area.id}
                        label={area.nombre}
                      >
                        {area.nombre}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Catálogo de Servicio"
                  name="catalogo_servicio_id"
                  rules={[{ required: true, message: "Selecciona catálogo" }]}
                >
                  <Select
                    placeholder="Selecciona catálogo"
                    size="large"
                    disabled={!form.getFieldValue("area_id")}
                    onChange={handleCatalogoChange}
                    showSearch
                    optionFilterProp="label"
                  >
                    {catalogo.map((cat) => (
                      <Select.Option
                        key={cat.id}
                        value={cat.id}
                        label={cat.nombre}
                      >
                        {cat.nombre}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Tipo de solicitud" required>
                  <div className="mb-2 text-gray-500 text-sm">
                    <span className="italic">
                      📌 <strong>Incidencia</strong>: problema o falla técnica.
                      &nbsp;|&nbsp; 📌 <strong>Requerimiento</strong>:
                      instalación, acceso o configuración.
                    </span>
                  </div>
                  <Form.Item
                    name="tipo"
                    noStyle
                    rules={[{ required: true, message: "Selecciona tipo" }]}
                  >
                    <Select
                      placeholder="Selecciona tipo"
                      size="large"
                      disabled={!catalogoId}
                      onChange={handleTipoChange}
                    >
                      <Select.Option value="incidencia">
                        Incidencia
                      </Select.Option>
                      <Select.Option value="requerimiento">
                        Requerimiento
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label={labelIncidenciaRequerimiento}
                  name="incidencia_id"
                  rules={[
                    {
                      required: true,
                      message: `Selecciona ${labelIncidenciaRequerimiento}`,
                    },
                  ]}
                >
                  <Select
                    placeholder={`Selecciona ${labelIncidenciaRequerimiento}`}
                    size="large"
                    disabled={!tipo}
                    onChange={handleIncidenciaChange}
                    showSearch
                    optionFilterProp="label"
                  >
                    {incidencias.map((i) => (
                      <Select.Option key={i.id} value={i.id} label={i.nombre}>
                        {i.nombre}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <div className="flex items-center gap-2">
                      <span>Categoría</span>
                    </div>
                  }
                  name="categoria_id"
                  rules={[{ required: true, message: "Selecciona categoría" }]}
                >
                  <Select
                    placeholder="Selecciona categoría"
                    size="large"
                    disabled={!incidenciaId}
                    showSearch
                    optionFilterProp="label"
                  >
                    {incidencias
                      .find((i) => i.id === incidenciaId)
                      ?.categoria?.map((cat) => (
                        <Select.Option
                          key={cat.id}
                          value={cat.id}
                          label={cat.nombre}
                        >
                          {cat.nombre}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      case 1:
        return (
          <>
            <Form.Item
              label="Descripción detallada"
              name="descripcion"
              rules={[{ required: true, message: "Describe el problema" }]}
            >
              <TextArea
                rows={5}
                placeholder="Describe con detalle (qué, cuándo, dónde, cómo impacta)"
              />
            </Form.Item>
            <Form.Item label="Adjuntar archivos (opcional)">
              <Upload
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList)}
                beforeUpload={() => false}
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              >
                <Button icon={<UploadOutlined />}>Seleccionar archivos</Button>
              </Upload>
              <div className="text-xs text-gray-500 mt-2">
                Máx. 10MB por archivo. Formatos: PDF, DOC/DOCX, PNG, JPG.
              </div>
            </Form.Item>
          </>
        );

      case 2:
        const values = form.getFieldsValue(true);
        const area = areas.find((a) => a.id === values.area_id)?.nombre ?? "-";
        const incidencia =
          incidencias.find((i) => i.id === values.incidencia_id)?.nombre ?? "-";
        const categoria =
          incidencias
            .find((i) => i.id === values.incidencia_id)
            ?.categoria?.find((c) => c.id === values.categoria_id)?.nombre ??
          "-";

        return (
          <>
            <Title level={4}>✅ Confirma tu ticket</Title>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Área">{area}</Descriptions.Item>
              <Descriptions.Item label="Tipo de solicitud">
                {values.tipo || "-"}
              </Descriptions.Item>
              <Descriptions.Item label={labelIncidenciaRequerimiento}>
                {incidencia}
              </Descriptions.Item>
              <Descriptions.Item label="Categoría">
                {categoria}
              </Descriptions.Item>
              <Descriptions.Item label="Descripción">
                {values.descripcion || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Archivos adjuntos">
                {fileList.length > 0 ? (
                  <ul style={{ paddingLeft: "1rem" }}>
                    {fileList.map((file) => (
                      <li key={file.uid}>
                        <Link
                          href={URL.createObjectURL(file.originFileObj!)}
                          target="_blank"
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
          </>
        );
    }
  };

  const handleStepClick = async (nextIndex: number) => {
    // Navegación controlada: valida el paso actual antes de avanzar
    if (nextIndex === current) return;
    if (nextIndex > current) {
      await next();
    } else {
      prev();
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <Card className="shadow-md" style={{ borderRadius: 12 }}>
        <div className="flex flex-col items-center">
          <Title level={3} className="text-center m-0">
            📝 Crear Nuevo Ticket
          </Title>
          <Text type="secondary" className="text-center">
            Sigue los pasos para registrar su ticket
          </Text>
        </div>

        <div className="mt-6 px-2">
          <Steps
            current={current}
            items={stepItems}
            onChange={handleStepClick}
            responsive
          />
        </div>

        <Divider />

        <Form layout="vertical" form={form} className="px-1 md:px-2">
          {renderStepContent()}

          <Divider />

          {/* Footer de acciones sticky para mejor UX */}
          <div className="sticky bottom-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 py-3">
            <div className="flex justify-between">
              {current > 0 ? (
                <Button onClick={prev} disabled={loading}>
                  Anterior
                </Button>
              ) : (
                <span />
              )}

              <div className="ml-auto flex gap-2">
                {current < STEP_KEYS.length - 1 ? (
                  <Button type="primary" onClick={next} loading={loading}>
                    Siguiente
                  </Button>
                ) : (
                  <Button type="primary" onClick={onSubmit} loading={loading}>
                    Crear Ticket
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}
