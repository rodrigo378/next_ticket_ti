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
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";

import { Area } from "@/interface/area";
import { Incidencia } from "@/interface/incidencia";
import { getAreas } from "@/services/area";
import { getCatalogo } from "@/services/catalogo";
import { createTicketTi } from "@/services/ticket_ti";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getIncidencias } from "@/services/incidencias";
import { CatalogoServicio } from "@/interface/catalogo";

const { Title } = Typography;
const { TextArea } = Input;

const STEPS = [
  { title: "Datos del Ticket" },
  { title: "Descripción y Adjuntos" },
  { title: "Confirmación" },
] as const;

export default function Page() {
  const router = useRouter();
  const [form] = Form.useForm();

  const [current, setCurrent] = useState(0);
  const [areas, setAreas] = useState<Area[]>([]);
  const [catalogo, setCatalogo] = useState<CatalogoServicio[]>([]);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [tipo, setTipo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const catalogoId = Form.useWatch("catalogo_servicio_id", form);
  const incidenciaId = Form.useWatch("incidencia_id", form);

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

  const next = async () => {
    try {
      await form.validateFields([
        "area_id",
        "catalogo_servicio_id",
        "tipo",
        "incidencia_id",
      ]);
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

  // const resumen = useMemo(() => {
  //   const v = form.getFieldsValue(true);
  //   console.log("V => ", v);

  //   const area = areas.find((a) => a.id === v.area_id)?.nombre ?? "-";
  //   const incidencia =
  //     incidencias.find((i) => i.id === v.incidencia_id)?.nombre ?? "-";
  //   const categoria =
  //     incidencias
  //       .find((i) => i.id === v.incidencia_id)
  //       ?.categoria?.find((c) => c.id === v.categoria_id)?.nombre ?? "-";

  //   return (
  //     <Descriptions bordered column={1} size="middle">
  //       <Descriptions.Item label="Área">{area}</Descriptions.Item>
  //       <Descriptions.Item label="Tipo de solicitud">
  //         {v.tipo || "-"}
  //       </Descriptions.Item>
  //       <Descriptions.Item label={labelIncidenciaRequerimiento}>
  //         {incidencia}
  //       </Descriptions.Item>
  //       <Descriptions.Item label="Categoría">{categoria}</Descriptions.Item>
  //       <Descriptions.Item label="Descripción">
  //         {v.descripcion || "-"}
  //       </Descriptions.Item>
  //       <Descriptions.Item label="Archivos adjuntos">
  //         {fileList.length > 0 ? (
  //           <ul style={{ paddingLeft: "1rem" }}>
  //             {fileList.map((file) => (
  //               <li key={file.uid}>
  //                 <Link
  //                   href={URL.createObjectURL(file.originFileObj!)}
  //                   target="_blank"
  //                 >
  //                   {file.name}
  //                 </Link>
  //               </li>
  //             ))}
  //           </ul>
  //         ) : (
  //           "— (ninguno)"
  //         )}
  //       </Descriptions.Item>
  //     </Descriptions>
  //   );
  // }, [
  //   areas,
  //   incidencias,
  //   fileList,
  //   form.getFieldsValue(true), // 👈 fuerza actualización al cambiar campos
  //   ,
  //   form,
  //   labelIncidenciaRequerimiento,
  // ]);

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
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
                  label="Catálogo de Servicio"
                  name="catalogo_servicio_id"
                  rules={[{ required: true, message: "Selecciona catálogo" }]}
                >
                  <Select
                    placeholder="Selecciona catálogo"
                    size="large"
                    disabled={!form.getFieldValue("area_id")}
                    onChange={handleCatalogoChange}
                  >
                    {catalogo.map((cat) => (
                      <Select.Option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Tipo de solicitud" required>
                  {/* <div className="mb-2 text-gray-600 text-sm italic">
                    📌 <strong>Incidencia:</strong> Problema o falla técnica
                    (ej. no funciona el monitor).
                    <br />
                    📌 <strong>Requerimiento:</strong> Solicitud de instalación
                    o configuración (ej. instalar impresora).
                  </div> */}
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

              <Col span={12}>
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
                  label="Categoría"
                  name="categoria_id"
                  rules={[{ required: true, message: "Selecciona categoría" }]}
                >
                  <Select
                    placeholder="Selecciona categoría"
                    size="large"
                    disabled={!incidenciaId}
                  >
                    {incidencias
                      .find((i) => i.id === incidenciaId)
                      ?.categoria?.map((cat) => (
                        <Select.Option key={cat.id} value={cat.id}>
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
              <TextArea rows={4} placeholder="Describe con detalle..." />
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

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4">
      <Card className="shadow-md" style={{ borderRadius: 12 }}>
        <Title level={3} className="text-center">
          📝 Crear Nuevo Ticket
        </Title>
        <Steps current={current} style={{ marginTop: 24 }} />
        <Divider />
        <Form layout="vertical" form={form}>
          {renderStepContent()}
          <Divider />
          <div className="flex justify-between">
            {current > 0 && <Button onClick={prev}>Anterior</Button>}
            <div className="ml-auto">
              {current < STEPS.length - 1 ? (
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
        </Form>
      </Card>
    </div>
  );
}
