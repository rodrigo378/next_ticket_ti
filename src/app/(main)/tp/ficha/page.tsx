// app/tp/ficha/crear/page.tsx
"use client";

import {
  Affix,
  Alert,
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tooltip,
  Typography,
  theme,
  message,
} from "antd";
import {
  InfoCircleOutlined,
  SaveOutlined,
  RollbackOutlined,
  UserAddOutlined,
  IdcardOutlined,
  HomeOutlined,
  PhoneOutlined,
  HeartOutlined,
  BookOutlined,
  InteractionOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// Servicio y tipo (ajusta según tu proyecto)
import { createFicha } from "@/services/tp/ficha";
import { TP_Ficha } from "@/interfaces/tp";

export default function CrearFichaPage() {
  const [form] = Form.useForm<TP_Ficha>();
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { token } = theme.useToken();

  // Watches para mostrar campos condicionales
  const sufreEnfermedad = Form.useWatch("sufreEnfermedad", form) ?? false;
  const alergias = Form.useWatch("alergias", form) ?? false;

  // Diseño: contenedor central limpio
  const containerStyle = useMemo(
    () => ({
      maxWidth: 1200,
      margin: "0 auto",
      padding: 16,
    }),
    []
  );

  const onFinish = async (values: TP_Ficha) => {
    const payload = {
      ...values,
      // Asegura Date real
      fechaNacimiento: values.fechaNacimiento
        ? dayjs(values.fechaNacimiento).toDate()
        : undefined,
      // Trims
      codigoEstudiante: values.codigoEstudiante?.trim() || undefined,
      dni: values.dni?.trim() || undefined,
      apellidoPaterno: values.apellidoPaterno?.trim() || undefined,
      apellidoMaterno: values.apellidoMaterno?.trim() || undefined,
      nombres: values.nombres?.trim() || undefined,
      genero: values.genero?.trim() || undefined,
      domicilioActual: values.domicilioActual?.trim() || undefined,
      distritoResidencia: values.distritoResidencia?.trim() || undefined,
      telefonoPersonal: values.telefonoPersonal?.trim() || undefined,
      carreraProfesional: values.carreraProfesional?.trim() || undefined,
      cicloEstudios: values.cicloEstudios?.trim() || undefined,
      contactoEmergencia1: values.contactoEmergencia1?.trim() || undefined,
      parentescoEmergencia1: values.parentescoEmergencia1?.trim() || undefined,
      telefonoEmergencia1: values.telefonoEmergencia1?.trim() || undefined,
      contactoEmergencia2: values.contactoEmergencia2?.trim() || undefined,
      parentescoEmergencia2: values.parentescoEmergencia2?.trim() || undefined,
      telefonoEmergencia2: values.telefonoEmergencia2?.trim() || undefined,
      tipoSeguro: values.tipoSeguro?.trim() || undefined,
      seguroOtro: values.seguroOtro?.trim() || undefined,
      enfermedades: values.enfermedades?.trim() || undefined,
      antecedentesFamiliares:
        values.antecedentesFamiliares?.trim() || undefined,
      alergiasDetalle: values.alergiasDetalle?.trim() || undefined,
    };

    try {
      setSaving(true);
      await createFicha(payload);
      message.success("Ficha creada correctamente.");
      router.push("/tp/ficha");
    } catch (e) {
      console.error(e);
      message.error("No se pudo crear la ficha.");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    form.resetFields();
    router.back();
  };

  return (
    <>
      {/* Header pegajoso */}
      <Affix offsetTop={0}>
        <div
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: "10px 16px",
          }}
        >
          <div style={containerStyle}>
            <Breadcrumb
              items={[{ title: "TP" }, { title: "Ficha" }, { title: "Nueva" }]}
            />
          </div>
        </div>
      </Affix>

      <div style={containerStyle}>
        <Card
          size="default"
          className="shadow-sm"
          title={
            <Space>
              <UserAddOutlined />
              <Typography.Text strong style={{ fontSize: 16 }}>
                Nueva Ficha
              </Typography.Text>
            </Space>
          }
          extra={
            <Tooltip title="Complete la información del estudiante/usuario">
              <InfoCircleOutlined />
            </Tooltip>
          }
        >
          <Alert
            showIcon
            type="info"
            style={{ marginBottom: 16 }}
            message="Recomendaciones"
            description={
              <>
                <div>Los campos sin asterisco son opcionales.</div>
                <div>
                  La fecha de nacimiento se envía como <b>Date</b> (zona horaria
                  del servidor).
                </div>
              </>
            }
          />

          <Form<TP_Ficha>
            form={form}
            layout="vertical"
            size="large"
            onFinish={onFinish}
            requiredMark="optional"
            initialValues={{
              sufreEnfermedad: false,
              alergias: false,
            }}
          >
            {/* Identificación */}
            <Divider orientation="left">
              <Space>
                <IdcardOutlined />
                <span>Identificación</span>
              </Space>
            </Divider>
            <Row gutter={[16, 12]}>
              <Col xs={24} md={8}>
                <Form.Item label="Código estudiante" name="codigoEstudiante">
                  <Input
                    allowClear
                    placeholder="Ej: 2025-000123"
                    maxLength={30}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="DNI"
                  name="dni"
                  tooltip="8–12 dígitos"
                  rules={[
                    { min: 8, max: 12, message: "Longitud 8 a 12" },
                    {
                      pattern: /^[0-9]{8,12}$/,
                      message: "Solo dígitos (8 a 12)",
                    },
                  ]}
                >
                  <Input allowClear placeholder="12345678" maxLength={12} />
                </Form.Item>
              </Col>
            </Row>

            {/* Nombres */}
            <Row gutter={[16, 12]}>
              <Col xs={24} md={8}>
                <Form.Item label="Apellido paterno" name="apellidoPaterno">
                  <Input allowClear maxLength={60} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Apellido materno" name="apellidoMaterno">
                  <Input allowClear maxLength={60} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Nombres"
                  name="nombres"
                  rules={[{ required: true, message: "Ingrese los nombres" }]}
                >
                  <Input allowClear maxLength={80} />
                </Form.Item>
              </Col>
            </Row>

            {/* Datos demográficos */}
            <Divider orientation="left">
              <Space>
                <InteractionOutlined />
                <span>Datos demográficos</span>
              </Space>
            </Divider>
            <Row gutter={[16, 12]}>
              <Col xs={24} md={6}>
                <Form.Item label="Sexo" name="sexo">
                  <Select
                    allowClear
                    options={[
                      { label: "Varón", value: "V" },
                      { label: "Mujer", value: "M" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item label="Género" name="genero">
                  {/* <Input allowClear placeholder="(opcional)" maxLength={30} /> */}
                  <Select allowClear>
                    <Select.Option value="M">Masculino</Select.Option>
                    <Select.Option value="F">Femenino</Select.Option>
                    <Select.Option value="O">Otros</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item label="Fecha de nacimiento" name="fechaNacimiento">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    allowClear
                    disabledDate={(d) => d && d.isAfter(dayjs(), "day")}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Contacto y domicilio */}
            <Divider orientation="left">
              <Space>
                <HomeOutlined />
                <span>Contacto y domicilio</span>
              </Space>
            </Divider>
            <Row gutter={[16, 12]}>
              <Col xs={24} md={12}>
                <Form.Item label="Domicilio actual" name="domicilioActual">
                  <Input allowClear maxLength={120} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  label="Distrito de residencia"
                  name="distritoResidencia"
                >
                  <Input allowClear maxLength={80} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item label="Teléfono personal" name="telefonoPersonal">
                  <Input
                    allowClear
                    maxLength={20}
                    prefix={<PhoneOutlined />}
                    placeholder="+51 9xx xxx xxx"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Académicos */}
            <Divider orientation="left">
              <Space>
                <BookOutlined />
                <span>Información académica</span>
              </Space>
            </Divider>
            <Row gutter={[16, 12]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Carrera profesional"
                  name="carreraProfesional"
                >
                  <Input allowClear maxLength={80} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Ciclo de estudios" name="cicloEstudios">
                  {/* <Input allowClear maxLength={40} /> */}
                  <Select allowClear>
                    <Select.Option value="1">I</Select.Option>
                    <Select.Option value="2">II</Select.Option>
                    <Select.Option value="3">III</Select.Option>
                    <Select.Option value="4">IV</Select.Option>
                    <Select.Option value="5">V</Select.Option>
                    <Select.Option value="6">VI</Select.Option>
                    <Select.Option value="7">VII</Select.Option>
                    <Select.Option value="8">VIII</Select.Option>
                    <Select.Option value="9">IX</Select.Option>
                    <Select.Option value="10">X</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Contactos de emergencia */}
            <Divider orientation="left">Contacto de emergencia 1</Divider>
            <Row gutter={[16, 12]}>
              <Col xs={24} md={10}>
                <Form.Item label="Nombre" name="contactoEmergencia1">
                  <Input allowClear maxLength={80} />
                </Form.Item>
              </Col>
              <Col xs={24} md={7}>
                <Form.Item label="Parentesco" name="parentescoEmergencia1">
                  <Input allowClear maxLength={40} />
                </Form.Item>
              </Col>
              <Col xs={24} md={7}>
                <Form.Item label="Teléfono" name="telefonoEmergencia1">
                  <Input allowClear maxLength={20} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Contacto de emergencia 2</Divider>
            <Row gutter={[16, 12]}>
              <Col xs={24} md={10}>
                <Form.Item label="Nombre" name="contactoEmergencia2">
                  <Input allowClear maxLength={80} />
                </Form.Item>
              </Col>
              <Col xs={24} md={7}>
                <Form.Item label="Parentesco" name="parentescoEmergencia2">
                  <Input allowClear maxLength={40} />
                </Form.Item>
              </Col>
              <Col xs={24} md={7}>
                <Form.Item label="Teléfono" name="telefonoEmergencia2">
                  <Input allowClear maxLength={20} />
                </Form.Item>
              </Col>
            </Row>

            {/* Seguro */}
            <Divider orientation="left">Seguro</Divider>
            <Row gutter={[16, 12]}>
              <Col xs={24} md={8}>
                <Form.Item label="Tipo de seguro" name="tipoSeguro">
                  <Select allowClear>
                    <Select.Option value="sis">SIS</Select.Option>
                    <Select value="essalud">ESSALUD</Select>
                    <Select value="eps">EPS</Select>
                    <Select value="otro">otro</Select>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={16}>
                <Form.Item label="Seguro (otro)" name="seguroOtro">
                  <Input allowClear />
                </Form.Item>
              </Col>
            </Row>

            {/* Salud */}
            <Divider orientation="left">
              <Space>
                <HeartOutlined />
                <span>Salud</span>
              </Space>
            </Divider>
            <Row gutter={[16, 12]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="¿Sufre enfermedad?"
                  name="sufreEnfermedad"
                  valuePropName="checked"
                  extra="Si lo activas, detalla las enfermedades."
                >
                  <Switch />
                </Form.Item>
              </Col>
              {sufreEnfermedad && (
                <Col xs={24}>
                  <Form.Item label="Enfermedades" name="enfermedades">
                    <Input.TextArea
                      rows={3}
                      allowClear
                      placeholder="Detalle diagnóstico, medicación, etc."
                    />
                  </Form.Item>
                </Col>
              )}
              <Col xs={24}>
                <Form.Item
                  label="Antecedentes familiares"
                  name="antecedentesFamiliares"
                >
                  <Input.TextArea rows={3} allowClear />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 12]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="¿Alergias?"
                  name="alergias"
                  valuePropName="checked"
                  extra="Si lo activas, especifica el detalle."
                >
                  <Switch />
                </Form.Item>
              </Col>
              {alergias && (
                <Col xs={24}>
                  <Form.Item label="Detalle de alergias" name="alergiasDetalle">
                    <Input.TextArea rows={2} allowClear />
                  </Form.Item>
                </Col>
              )}
            </Row>

            {/* Datos físicos */}
            <Divider orientation="left">Datos físicos</Divider>
            <Row gutter={[16, 12]}>
              <Col xs={24} md={6}>
                <Form.Item
                  label="Peso"
                  name="peso"
                  tooltip="En kilogramos"
                  rules={[
                    { type: "number", min: 2, max: 300, message: "2 a 300 kg" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    step={0.1}
                    style={{ width: "100%" }}
                    addonAfter="kg"
                    placeholder="Ej: 70.5"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item
                  label="Estatura"
                  name="estatura"
                  tooltip="En metros"
                  rules={[
                    {
                      type: "number",
                      min: 0.3,
                      max: 2.5,
                      message: "0.3 a 2.5 m",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    style={{ width: "100%" }}
                    addonAfter="m"
                    placeholder="Ej: 1.68"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Acción fija inferior */}
            <Affix offsetBottom={0}>
              <Card
                size="small"
                style={{
                  borderTop: `1px solid ${token.colorBorderSecondary}`,
                  background: token.colorBgContainer,
                  marginTop: 12,
                }}
                bodyStyle={{ padding: "10px 12px" }}
              >
                <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button icon={<RollbackOutlined />} onClick={onCancel}>
                    Cancelar
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving}
                  >
                    Guardar
                  </Button>
                </Space>
              </Card>
            </Affix>
          </Form>
        </Card>
      </div>
    </>
  );
}
