// app/tp/ficha/crear/page.tsx
"use client";

import {
  Affix,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tooltip,
  Typography,
  Steps,
  theme,
  message,
} from "antd";
import {
  InfoCircleOutlined,
  SaveOutlined,
  UserAddOutlined,
  IdcardOutlined,
  HomeOutlined,
  PhoneOutlined,
  HeartOutlined,
  BookOutlined,
  InteractionOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, {
  useMemo,
  useState,
  useCallback,
  PropsWithChildren,
} from "react";

// Servicio y tipo (ajusta según tu proyecto)
import { createFicha } from "@/services/tp/ficha";
import { TP_Ficha } from "@/interfaces/tp";

export default function CrearFichaPage() {
  const [form] = Form.useForm<TP_Ficha>();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { token } = theme.useToken();

  // watches (solo para UI condicional)
  const sufreEnfermedad = Form.useWatch("sufreEnfermedad", form) ?? false;
  const alergias = Form.useWatch("alergias", form) ?? false;

  // Layout
  const containerStyle = useMemo(
    () => ({ maxWidth: 1080, margin: "0 auto", padding: 16 }),
    []
  );

  const heroStyle = useMemo(
    () => ({
      background:
        "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.12) 50%, rgba(236,72,153,0.10) 100%)",
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: 16,
      padding: "18px 20px",
    }),
    [token.colorBorderSecondary]
  );

  // ─────────────────────────────────────────────────────────
  // Sub-secciones como componentes locales (mismo archivo)
  // ─────────────────────────────────────────────────────────
  type SectionCardProps = PropsWithChildren<{
    title: React.ReactNode;
    icon?: React.ReactNode;
  }>;

  const SectionCard = ({ title, icon, children }: SectionCardProps) => (
    <Card
      size="small"
      className="shadow-sm"
      style={{
        borderRadius: 14,
        borderColor: token.colorBorderSecondary,
        marginBottom: 16,
      }}
      title={
        <Space>
          {icon}
          <Typography.Text strong style={{ fontSize: 15 }}>
            {title}
          </Typography.Text>
        </Space>
      }
      extra={
        <Tooltip title="Complete los campos de esta sección">
          <InfoCircleOutlined />
        </Tooltip>
      }
    >
      {children}
    </Card>
  );

  const SeccionIdentificacion = () => (
    <SectionCard title="Identificación" icon={<IdcardOutlined />}>
      <Row gutter={[16, 12]}>
        <Col xs={24} md={10}>
          <Form.Item label="Código estudiante" name="codigoEstudiante">
            <Input allowClear placeholder="Ej: 123456" maxLength={30} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="DNI"
            name="dni"
            tooltip="8–12 dígitos"
            rules={[
              { min: 8, max: 12, message: "Longitud 8 a 12" },
              { pattern: /^[0-9]{8,12}$/, message: "Solo dígitos (8 a 12)" },
            ]}
          >
            <Input allowClear placeholder="12345678" maxLength={12} />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            label="Nombres"
            name="nombres"
            rules={[{ required: true, message: "Ingrese los nombres" }]}
          >
            <Input allowClear maxLength={80} />
          </Form.Item>
        </Col>
      </Row>

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
      </Row>
    </SectionCard>
  );

  const SeccionDemografiaContacto = () => (
    <>
      <SectionCard title="Datos demográficos" icon={<InteractionOutlined />}>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={6}>
            <Form.Item label="Sexo" name="sexo">
              <Select
                allowClear
                options={[
                  { label: "Masculino", value: "M" },
                  { label: "Femenino", value: "F" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Género" name="genero">
              <Select allowClear>
                <Select.Option value="M">Masculino</Select.Option>
                <Select.Option value="F">Femenino</Select.Option>
                <Select.Option value="O">Otro</Select.Option>
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
          <Col xs={24} md={6}>
            <Form.Item
              label="Teléfono personal"
              name="telefonoPersonal"
              tooltip="Formato sugerido: +51 9xx xxx xxx"
            >
              <Input allowClear maxLength={20} prefix={<PhoneOutlined />} />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>

      <SectionCard title="Domicilio" icon={<HomeOutlined />}>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <Form.Item label="Domicilio actual" name="domicilioActual">
              <Input allowClear maxLength={120} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Distrito de residencia" name="distritoResidencia">
              <Input allowClear maxLength={80} />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>
    </>
  );

  const SeccionAcademicaEmergencia = () => (
    <>
      <SectionCard title="Información académica" icon={<BookOutlined />}>
        <Row gutter={[16, 12]}>
          <Col xs={24} md={12}>
            <Form.Item label="Carrera profesional" name="carreraProfesional">
              <Input allowClear maxLength={80} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Ciclo de estudios" name="cicloEstudios">
              <Select allowClear>
                {[...Array(10)].map((_, i) => (
                  <Select.Option key={i + 1} value={`${i + 1}`}>
                    {
                      [
                        "I",
                        "II",
                        "III",
                        "IV",
                        "V",
                        "VI",
                        "VII",
                        "VIII",
                        "IX",
                        "X",
                      ][i]
                    }
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>

      <SectionCard title="Contacto de emergencia" icon={<PhoneOutlined />}>
        <Typography.Text type="secondary" style={{ display: "block" }}>
          Contacto 1
        </Typography.Text>
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

        <Typography.Text type="secondary" style={{ display: "block" }}>
          Contacto 2 (opcional)
        </Typography.Text>
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
      </SectionCard>
    </>
  );

  const SeccionSaludFisicos = () => (
    <>
      <SectionCard title="Salud" icon={<HeartOutlined />}>
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
      </SectionCard>

      <SectionCard
        title="Datos físicos y seguro"
        icon={<CheckCircleOutlined />}
      >
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
                { type: "number", min: 0.3, max: 2.5, message: "0.3 a 2.5 m" },
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
          <Col xs={24} md={8}>
            <Form.Item label="Tipo de seguro" name="tipoSeguro">
              <Select allowClear>
                <Select.Option value="sis">SIS</Select.Option>
                <Select.Option value="essalud">ESSALUD</Select.Option>
                <Select.Option value="eps">EPS</Select.Option>
                <Select.Option value="otro">Otro</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Seguro (otro)" name="seguroOtro">
              <Input allowClear />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>
    </>
  );

  // Campos por paso para validar por bloque
  const stepFieldNames: string[][] = [
    [
      "codigoEstudiante",
      "dni",
      "nombres",
      "apellidoPaterno",
      "apellidoMaterno",
    ],
    [
      "sexo",
      "genero",
      "fechaNacimiento",
      "telefonoPersonal",
      "domicilioActual",
      "distritoResidencia",
    ],
    [
      "carreraProfesional",
      "cicloEstudios",
      "contactoEmergencia1",
      "parentescoEmergencia1",
      "telefonoEmergencia1",
      "contactoEmergencia2",
      "parentescoEmergencia2",
      "telefonoEmergencia2",
    ],
    [
      "sufreEnfermedad",
      "enfermedades",
      "antecedentesFamiliares",
      "alergias",
      "alergiasDetalle",
      "peso",
      "estatura",
      "tipoSeguro",
      "seguroOtro",
    ],
  ];

  const handleNext = useCallback(async () => {
    try {
      await form.validateFields(stepFieldNames[step]);
      setStep((s) => Math.min(s + 1, 3));
    } catch {
      /* antd muestra los errores */
    }
  }, [form, step]);

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const onFinish = async (values: TP_Ficha) => {
    const payload = {
      ...values,
      fechaNacimiento: values.fechaNacimiento
        ? dayjs(values.fechaNacimiento).toDate()
        : undefined,
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

  // const onCancel = () => {
  //   form.resetFields();
  //   router.back();
  // };

  return (
    <>
      <div style={containerStyle}>
        {/* HERO */}
        <div style={heroStyle}>
          <Space size={12} align="start" wrap>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                background: token.colorPrimaryBgHover,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <UserAddOutlined
                style={{ fontSize: 20, color: token.colorPrimary }}
              />
            </div>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Nueva Ficha de Usuario
              </Typography.Title>
              <Typography.Text type="secondary">
                Completa la información en pasos. Puedes volver atrás sin perder
                datos.
              </Typography.Text>
            </div>
          </Space>
        </div>

        <Card
          size="default"
          className="shadow-sm"
          style={{ marginTop: 16, borderRadius: 16 }}
          bodyStyle={{ paddingTop: 16 }}
          title={
            <Space>
              <Typography.Text strong style={{ fontSize: 16 }}>
                Formulario
              </Typography.Text>
            </Space>
          }
          extra={
            <Steps
              size="small"
              current={step}
              items={[
                { title: "Identificación" },
                { title: "Demografía" },
                { title: "Académico" },
                { title: "Salud", icon: <CheckCircleOutlined /> },
              ]}
              style={{ minWidth: 420 }}
            />
          }
        >
          <Form<TP_Ficha>
            form={form}
            layout="vertical"
            size="large"
            onFinish={onFinish}
            requiredMark="optional"
            initialValues={{ sufreEnfermedad: false, alergias: false }}
          >
            {step === 0 && <SeccionIdentificacion />}
            {step === 1 && <SeccionDemografiaContacto />}
            {step === 2 && <SeccionAcademicaEmergencia />}
            {step === 3 && <SeccionSaludFisicos />}

            <Affix offsetBottom={0}>
              <Card
                size="small"
                style={{
                  borderTop: `1px solid ${token.colorBorderSecondary}`,
                  background: token.colorBgContainer,
                  marginTop: 8,
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                }}
                bodyStyle={{ padding: "10px 12px" }}
              >
                <Space
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  {/* <Button icon={<RollbackOutlined />} onClick={onCancel}>
                    Cancelar
                  </Button> */}

                  <Space>
                    {step > 0 && <Button onClick={handlePrev}>Anterior</Button>}
                    {step < 3 && (
                      <Button type="primary" onClick={handleNext}>
                        Siguiente
                      </Button>
                    )}
                    {step === 3 && (
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={saving}
                      >
                        Guardar
                      </Button>
                    )}
                  </Space>
                </Space>
              </Card>
            </Affix>
          </Form>
        </Card>
      </div>
    </>
  );
}
