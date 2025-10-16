// app/tp/ficha/crear/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Grid,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Tooltip,
  Typography,
  Steps,
  message,
} from "antd";
import {
  InfoCircleOutlined,
  RollbackOutlined,
  UserAddOutlined,
  IdcardOutlined,
  HomeOutlined,
  PhoneOutlined,
  HeartOutlined,
  BookOutlined,
  InteractionOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

// Servicio y tipo (ajusta según tu proyecto)
import { createFicha } from "@/services/tp/ficha";
import { TP_Ficha } from "@/interfaces/tp";

const { useBreakpoint } = Grid;

export default function CrearFichaPage() {
  const [form] = Form.useForm<TP_Ficha>();
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(0);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const router = useRouter();

  const sufreEnfermedad = Form.useWatch("sufreEnfermedad", form) ?? false;
  const alergias = Form.useWatch("alergias", form) ?? false;

  const containerStyle = useMemo(
    () => ({ maxWidth: 1200, margin: "0 auto", padding: isMobile ? 12 : 16 }),
    [isMobile]
  );

  // Campos por paso para validar solo lo necesario
  const stepFields: string[][] = [
    // 0 - Identificación
    [
      "codigoEstudiante",
      "dni",
      "apellidoPaterno",
      "apellidoMaterno",
      "nombres",
    ],
    // 1 - Demográficos
    ["sexo", "genero", "fechaNacimiento"],
    // 2 - Contacto
    [
      "domicilioActual",
      "distritoResidencia",
      "telefonoPersonal",
      "contactoEmergencia1",
      "parentescoEmergencia1",
      "telefonoEmergencia1",
      "contactoEmergencia2",
      "parentescoEmergencia2",
      "telefonoEmergencia2",
    ],
    // 3 - Académicos
    ["carreraProfesional", "cicloEstudios"],
    // 4 - Salud
    [
      "sufreEnfermedad",
      ...(sufreEnfermedad ? ["enfermedades"] : []),
      "antecedentesFamiliares",
      "alergias",
      ...(alergias ? ["alergiasDetalle"] : []),
      "tipoSeguro",
      "seguroOtro",
    ],
    // 5 - Físicos
    ["peso", "estatura"],
    // 6 - Confirmación (sin campos)
    [],
  ];

  const steps = [
    { key: "ident", title: "Identificación", icon: <IdcardOutlined /> },
    { key: "demo", title: "Demográficos", icon: <InteractionOutlined /> },
    { key: "cont", title: "Contacto", icon: <HomeOutlined /> },
    { key: "acad", title: "Académicos", icon: <BookOutlined /> },
    { key: "salud", title: "Salud", icon: <HeartOutlined /> },
    { key: "fis", title: "Físicos" },
    { key: "conf", title: "Confirmar" },
  ];

  const next = async () => {
    try {
      await form.validateFields(stepFields[current]);
      setCurrent((c) => c + 1);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    } catch {}
  };

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

  const onPrimaryAction = async () => {
    if (current < steps.length - 1) {
      await next();
    } else {
      try {
        await form.validateFields();
        await onFinish(form.getFieldsValue());
      } catch {
        // errores visibles
      }
    }
  };

  // ---------- Render de secciones (cards cortos por paso) ----------
  const StepIdentificacion = (
    <Card size="small">
      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <Form.Item label="Código estudiante" name="codigoEstudiante">
            <Input allowClear placeholder="Ej: 2025-000123" maxLength={30} />
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
      </Row>

      <Row gutter={[12, 12]}>
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
    </Card>
  );

  const StepDemograficos = (
    <Card size="small">
      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
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
        <Col xs={24} md={8}>
          <Form.Item label="Género" name="genero">
            <Select allowClear>
              <Select.Option value="M">Masculino</Select.Option>
              <Select.Option value="F">Femenino</Select.Option>
              <Select.Option value="O">Otros</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
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
    </Card>
  );

  const StepContacto = (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      <Card size="small">
        <Divider orientation="left" plain style={{ marginTop: 0 }}>
          Domicilio
        </Divider>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Form.Item label="Domicilio actual" name="domicilioActual">
              <Input allowClear maxLength={120} />
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item label="Distrito de residencia" name="distritoResidencia">
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
      </Card>

      <Card size="small">
        <Divider orientation="left" plain style={{ marginTop: 0 }}>
          Contactos de emergencia
        </Divider>
        <Row gutter={[12, 12]}>
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

        <Row gutter={[12, 12]}>
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
      </Card>
    </Space>
  );

  const StepAcademicos = (
    <Card size="small">
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <Form.Item label="Carrera profesional" name="carreraProfesional">
            <Input allowClear maxLength={80} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Ciclo de estudios" name="cicloEstudios">
            <Select allowClear>
              {Array.from({ length: 10 }).map((_, idx) => (
                <Select.Option key={idx + 1} value={String(idx + 1)}>
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
                    ][idx]
                  }
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const StepSalud = (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      <Card size="small">
        <Row gutter={[12, 12]}>
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
      </Card>

      <Card size="small">
        <Divider orientation="left" plain style={{ marginTop: 0 }}>
          Seguro
        </Divider>
        <Row gutter={[12, 12]}>
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
          <Col xs={24} md={16}>
            <Form.Item label="Seguro (otro)" name="seguroOtro">
              <Input allowClear />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </Space>
  );

  const StepFisicos = (
    <Card size="small">
      <Row gutter={[12, 12]}>
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
      </Row>
    </Card>
  );

  const StepConfirm = (
    <Card size="small">
      <Alert
        type="success"
        showIcon
        message="Revise los datos antes de guardar"
        description="Si todo está correcto, presione Guardar para registrar la ficha."
      />
    </Card>
  );

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return StepIdentificacion;
      case 1:
        return StepDemograficos;
      case 2:
        return StepContacto;
      case 3:
        return StepAcademicos;
      case 4:
        return StepSalud;
      case 5:
        return StepFisicos;
      default:
        return StepConfirm;
    }
  };

  return (
    <>
      <div style={containerStyle}>
        <Card
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

          <Row gutter={isMobile ? 0 : 16}>
            {/* Sidebar Steps */}
            <Col xs={24} md={6} style={{ marginBottom: isMobile ? 12 : 0 }}>
              <Card size="small">
                <Steps
                  current={current}
                  onChange={(i) => setCurrent(i)}
                  direction={isMobile ? "horizontal" : "vertical"}
                  size={isMobile ? "small" : "default"}
                  items={steps.map((s) => ({ title: s.title, icon: s.icon }))}
                />
              </Card>
            </Col>

            {/* Content */}
            <Col xs={24} md={18}>
              <Form<TP_Ficha>
                form={form}
                layout="vertical"
                size={isMobile ? "middle" : "large"}
                requiredMark="optional"
                initialValues={{ sufreEnfermedad: false, alergias: false }}
              >
                {/* Título del paso */}
                <Divider orientation="left" style={{ marginTop: 0 }}>
                  <Space>
                    {steps[current].icon}
                    <span>{steps[current].title}</span>
                  </Space>
                </Divider>

                {renderStepContent()}

                <div
                  style={{
                    maxWidth: 1200,
                    margin: "12px auto 24px",
                    padding: isMobile ? "8px 12px" : "10px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <Space wrap>
                    <Button
                      icon={<RollbackOutlined />}
                      onClick={() => router.back()}
                    >
                      Cancelar
                    </Button>
                    {current > 0 && (
                      <Button
                        onClick={() => setCurrent((c) => c - 1)}
                        icon={<DoubleLeftOutlined />}
                      >
                        Atrás
                      </Button>
                    )}
                  </Space>

                  <Space wrap>
                    {current < steps.length - 1 ? (
                      <Button
                        type="primary"
                        onClick={onPrimaryAction}
                        icon={<DoubleRightOutlined />}
                        style={{
                          borderRadius: 8,
                          padding: "0 18px",
                          boxShadow: "0 6px 18px rgba(0,0,0,.08)",
                        }}
                      >
                        Siguiente
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        onClick={onPrimaryAction}
                        loading={saving}
                        icon={<CheckOutlined />}
                        style={{
                          borderRadius: 8,
                          padding: "0 18px",
                          boxShadow: "0 6px 18px rgba(0,0,0,.08)",
                        }}
                      >
                        Guardar
                      </Button>
                    )}
                  </Space>
                </div>
              </Form>
            </Col>
          </Row>
        </Card>
      </div>
    </>
  );
}
