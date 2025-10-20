/* eslint-disable @typescript-eslint/no-explicit-any */
// app/tp/ficha/crear/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
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
  Typography,
  Steps,
  message,
  Tag,
  Cascader,
  Spin,
  Avatar,
} from "antd";
import {
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
  UserOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getInfoEstudiante,
  createFicha,
  fichaExiste,
} from "@/services/tp/ficha";
import { TP_Ficha } from "@/interfaces/tp";
import { getUbigeoResolve, getUbigeoTree } from "@/services/core/rol";

const { useBreakpoint } = Grid;

const PRIMARY = "#ec244f";

// =================== Listas Salud (comunes) ===================
const ENFERMEDADES_COMUNES = [
  "Hipertensión arterial",
  "Diabetes",
  "Asma",
  "Cardiopatía",
  "Epilepsia",
  "Otra",
];

const ALERGIAS_COMUNES = [
  "Polvo",
  "Mariscos",
  "Maní",
  "Medicamentos",
  "Polen",
  "Otra",
];

type UbigeoResolve = {
  departamento: string | null;
  provincia: string | null;
  distrito: string | null;
  ubigeo: string;
} | null;

export default function CrearFichaPage() {
  const [form] = Form.useForm<TP_Ficha>();
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);

  // Modo “solo lectura” si ya existe ficha
  const [loadingFicha, setLoadingFicha] = useState(true);
  const [fichaExistente, setFichaExistente] = useState<TP_Ficha | null>(null);

  // Ubigeo
  const [treeLoading, setTreeLoading] = useState(true);
  const [ubigeoTree, setUbigeoTree] = useState<any[]>([]);
  const [resolvedUbigeo, setResolvedUbigeo] = useState<UbigeoResolve>(null);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // =================== Helpers UBIGEO ===================
  // Toma el último valor seleccionado (distrito) y lo fuerza a 6 dígitos
  const pickUbigeo6 = (ub: unknown): string | undefined => {
    if (Array.isArray(ub) && ub.length) {
      const last = String(ub[ub.length - 1] ?? "");
      return /^\d{6}$/.test(last) ? last : undefined;
    }
    if (typeof ub === "string" && /^\d{6}$/.test(ub)) return ub;
    return undefined;
  };

  // Si getUbigeoResolve falla, resolvemos etiquetas desde el árbol local
  const resolveUbigeoLabelsFromTree = (path: string[] | undefined) => {
    if (!Array.isArray(path) || path.length < 3) {
      return { departamento: null, provincia: null, distrito: null };
    }
    let nodes: any[] = ubigeoTree;
    let departamento: string | null = null;
    let provincia: string | null = null;
    let distrito: string | null = null;

    for (let i = 0; i < 3; i++) {
      const node = nodes?.find((x) => String(x.value) === String(path[i]));
      if (!node) break;
      if (i === 0) departamento = node.label || null;
      if (i === 1) provincia = node.label || null;
      if (i === 2) distrito = node.label || null;
      nodes = node.children || [];
    }
    return { departamento, provincia, distrito };
  };

  // =================== CARGA INICIAL (¿existe ficha?) ===================
  useEffect(() => {
    (async () => {
      try {
        const data = await fichaExiste();
        if (data) {
          setFichaExistente(data);
        } else {
          // Solo si NO existe ficha, prellenamos identidad
          const { codigo, c_dni, paterno, materno, nombres } =
            await getInfoEstudiante();
          if (codigo) {
            form.setFieldsValue({
              codigoEstudiante: String(codigo),
              dni: c_dni,
              apellidoPaterno: paterno,
              apellidoMaterno: materno,
              nombres,
            });
          }
        }
      } catch (e) {
        console.error(e);
        message.error("No se pudo verificar si ya registraste tu ficha.");
      } finally {
        setLoadingFicha(false);
      }
    })();
  }, [form]);

  // Cargar árbol de Ubigeo desde API (solo para formulario)
  useEffect(() => {
    if (fichaExistente) return; // si ya existe, no gastamos en ubigeo
    (async () => {
      try {
        setTreeLoading(true);
        const tree = await getUbigeoTree();

        // Normalizamos: value siempre string
        const normalize = (nodes: any[]): any[] =>
          (nodes || []).map((n: any) => ({
            label: n.label,
            value: String(n.value),
            children: normalize(n.children || []),
          }));

        setUbigeoTree(normalize(tree || []));
      } catch (e) {
        console.error(e);
        message.error("No se pudo cargar el catálogo de Ubigeo.");
      } finally {
        setTreeLoading(false);
      }
    })();
  }, [fichaExistente]);

  // ------------------- FIX 1: normalizar ubigeo y estabilizar dependencias -------------------
  // Observa el valor crudo del form (puede ser string | string[] | undefined)
  const rawUbigeo = Form.useWatch("ubigeo", form) as unknown;

  // Normaliza SIEMPRE a string[] (estable y tipeado)
  const ubigeoPath = useMemo<string[]>(() => {
    if (Array.isArray(rawUbigeo)) return rawUbigeo.map(String);
    if (typeof rawUbigeo === "string" && /^\d{6}$/.test(rawUbigeo))
      return [rawUbigeo];
    return [];
  }, [rawUbigeo]);

  // Resolver nombres de ubigeo en vivo (si el usuario selecciona distrito)
  useEffect(() => {
    (async () => {
      if (ubigeoPath.length === 3) {
        const lastValue = String(ubigeoPath[2]);
        const ubigeo6 = /^\d{6}$/.test(lastValue) ? lastValue : undefined;
        if (!ubigeo6) {
          setResolvedUbigeo(null);
          return;
        }
        try {
          const info = await getUbigeoResolve(ubigeo6);
          setResolvedUbigeo(info ?? null);
        } catch (e) {
          console.error(e);
          setResolvedUbigeo(null);
        }
      } else {
        setResolvedUbigeo(null);
      }
    })();
  }, [ubigeoPath]);
  // ------------------------------------------------------------------------------------------

  // Watches
  const sufreEnfermedad = Form.useWatch("sufreEnfermedad", form) ?? false;
  const alergias = Form.useWatch("alergias", form) ?? false;
  const tipoSeguro = Form.useWatch("tipoSeguro", form);
  const enfermedadesSelect: string[] =
    (Form.useWatch("enfermedadesSelect", form) as string[]) ?? [];
  const alergiasSelect: string[] =
    (Form.useWatch("alergiasSelect", form) as string[]) ?? [];

  const containerStyle = useMemo(
    () => ({
      maxWidth: 1200,
      margin: "0 auto",
      padding: isMobile ? 12 : 16,
      background: "#fff",
      borderRadius: 12,
    }),
    [isMobile]
  );

  // =================== VALIDACIÓN POR PASOS ===================
  const stepFields: string[][] = [
    // 0 Identificación
    [
      "codigoEstudiante",
      "dni",
      "apellidoPaterno",
      "apellidoMaterno",
      "nombres",
    ],
    // 1 Demográficos
    ["sexo", "genero", "fechaNacimiento"],
    // 2 Contacto (Ubigeo + domicilio + teléfonos + emergencias)
    [
      "domicilioActual",
      "ubigeo",
      "telefonoPersonal",
      "contactoEmergencia1",
      "parentescoEmergencia1",
      "telefonoEmergencia1",
    ],
    // 3 Académicos
    ["carreraProfesional", "cicloEstudios"],
    // 4 Salud/Seguro
    [
      "sufreEnfermedad",
      ...(sufreEnfermedad ? ["enfermedadesSelect"] : []),
      "alergias",
      ...(alergias ? ["alergiasSelect"] : []),
      ...(sufreEnfermedad && enfermedadesSelect.includes("Otra")
        ? ["enfermedadesOtro"]
        : []),
      ...(alergias && alergiasSelect.includes("Otra") ? ["alergiasOtro"] : []),
      ...(tipoSeguro === "otro" ? ["seguroOtro"] : []),
    ],
    // 5 Físicos
    ["peso", "estatura"],
    // 6 Confirmar
    [],
  ];

  const steps = [
    { title: "Identificación", icon: <IdcardOutlined /> },
    { title: "Demográficos", icon: <InteractionOutlined /> },
    { title: "Contacto", icon: <HomeOutlined /> },
    { title: "Académicos", icon: <BookOutlined /> },
    { title: "Salud/Seguro", icon: <HeartOutlined /> },
    { title: "Físicos", icon: <UserOutlined /> },
    { title: "Confirmar", icon: <FileProtectOutlined /> },
  ];

  // =================== FUNCIÓN PRINCIPAL ===================
  const onPrimaryAction = async () => {
    try {
      await form.validateFields(stepFields[current]);

      if (current < steps.length - 1) {
        setCurrent((c) => c + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSaving(true);
        const values = form.getFieldsValue(true);

        // Transformaciones
        const fechaNacimiento = values?.fechaNacimiento
          ? dayjs(values.fechaNacimiento).format("YYYY-MM-DD")
          : undefined;

        // Ubigeo (distrito = último nivel)
        const ubigeo6 = pickUbigeo6(values.ubigeo);
        const pathArray: string[] = Array.isArray(values.ubigeo)
          ? values.ubigeo.map(String)
          : [];

        // Etiquetas de ubigeo: primero intentamos con el resolve del backend,
        // si no hay, usamos el árbol local como fallback
        const {
          departamento: depTree,
          provincia: provTree,
          distrito: distTree,
        } = resolveUbigeoLabelsFromTree(pathArray);

        const departamento = resolvedUbigeo?.departamento ?? depTree ?? null;
        const provincia = resolvedUbigeo?.provincia ?? provTree ?? null;
        const distrito = resolvedUbigeo?.distrito ?? distTree ?? null;

        let enfermedades: string | undefined = undefined;
        if (values.sufreEnfermedad) {
          const base = (values.enfermedadesSelect ?? []).filter(
            (x: string) => x !== "Otra"
          );
          const extra = (values.enfermedadesOtro ?? "").trim();
          const joined = [...base, ...(extra ? [extra] : [])].join(", ");
          enfermedades = joined || undefined;
        }

        let alergiasDetalle: string | undefined = undefined;
        if (values.alergias) {
          const base = (values.alergiasSelect ?? []).filter(
            (x: string) => x !== "Otra"
          );
          const extra = (values.alergiasOtro ?? "").trim();
          const joined = [...base, ...(extra ? [extra] : [])].join(", ");
          alergiasDetalle = joined || undefined;
        }

        const seguroOtro =
          values.tipoSeguro === "otro"
            ? (values.seguroOtro ?? "").trim() || undefined
            : undefined;

        const payload = {
          codigoEstudiante: values.codigoEstudiante,
          dni: values.dni,
          apellidoPaterno: values.apellidoPaterno,
          apellidoMaterno: values.apellidoMaterno,
          nombres: values.nombres,

          sexo: values.sexo,
          genero: values.genero,
          fechaNacimiento,

          domicilioActual: values.domicilioActual,

          departamento,
          provincia,
          distrito,
          ubigeo: ubigeo6, // <- ahora sí, string de 6 dígitos

          distritoResidencia: distrito ?? undefined,

          telefonoPersonal: values.telefonoPersonal,

          carreraProfesional: values.carreraProfesional,
          cicloEstudios: values.cicloEstudios,

          contactoEmergencia1: values.contactoEmergencia1,
          parentescoEmergencia1: values.parentescoEmergencia1,
          telefonoEmergencia1: values.telefonoEmergencia1,

          contactoEmergencia2: values.contactoEmergencia2,
          parentescoEmergencia2: values.parentescoEmergencia2,
          telefonoEmergencia2: values.telefonoEmergencia2,

          tipoSeguro: values.tipoSeguro,
          seguroOtro,

          sufreEnfermedad: values.sufreEnfermedad ?? false,
          enfermedades,
          antecedentesFamiliares: values.antecedentesFamiliares,
          alergias: values.alergias ?? false,
          alergiasDetalle,

          peso: values.peso,
          estatura: values.estatura,
        };

        const res = await createFicha(payload);
        console.log("✅ Respuesta del servidor:", res);
        message.success("Ficha creada correctamente ✅");
        // Opcional: cambiar a modo solo lectura tras crear
        setFichaExistente(res);
      }
    } catch (error) {
      console.error("❌ Error al guardar ficha:", error);
      message.error("Revisa los campos antes de continuar.");
    } finally {
      setSaving(false);
    }
  };

  // =================== PASOS (form) ===================
  const StepIdentificacion = (
    <Card className="rounded-2xl shadow-sm">
      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <Form.Item
            label="Código estudiante"
            name="codigoEstudiante"
            rules={[{ required: true, message: "El código es obligatorio." }]}
          >
            <Input readOnly suffix={<IdcardOutlined />} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="DNI"
            name="dni"
            rules={[
              { required: true, message: "El DNI es obligatorio." },
              { min: 8, max: 12, message: "Debe tener entre 8 y 12 dígitos." },
              { pattern: /^[0-9]{8,12}$/, message: "Solo dígitos." },
            ]}
          >
            <Input readOnly placeholder="00000000" maxLength={12} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <Form.Item
            label="Apellido paterno"
            name="apellidoPaterno"
            rules={[{ required: true, message: "Obligatorio." }]}
          >
            <Input allowClear readOnly />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Apellido materno"
            name="apellidoMaterno"
            rules={[{ required: true, message: "Obligatorio." }]}
          >
            <Input allowClear readOnly />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Nombres"
            name="nombres"
            rules={[{ required: true, message: "Obligatorio." }]}
          >
            <Input allowClear readOnly />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const StepDemograficos = (
    <Card className="rounded-2xl shadow-sm">
      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <Form.Item
            label="Sexo (Condición orgánica al nacer)"
            name="sexo"
            rules={[{ required: true, message: "Seleccione su sexo." }]}
          >
            <Select
              allowClear
              placeholder="Seleccione"
              options={[
                { label: "Varón", value: "V" },
                { label: "Mujer", value: "M" },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Género"
            name="genero"
            rules={[{ required: true, message: "Seleccione su género." }]}
          >
            <Select allowClear placeholder="Seleccione">
              <Select.Option value="M">Masculino</Select.Option>
              <Select.Option value="F">Femenino</Select.Option>
              <Select.Option value="O">Otros</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            label="Fecha de nacimiento"
            name="fechaNacimiento"
            rules={[{ required: true, message: "Seleccione su fecha." }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
              disabledDate={(d) => d && d.isAfter(dayjs(), "day")}
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const StepContacto = (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      <Card
        className="rounded-2xl shadow-sm"
        title="Domicilio y contacto personal"
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Domicilio actual"
              name="domicilioActual"
              rules={[{ required: true, message: "Ingrese su domicilio." }]}
            >
              <Input allowClear placeholder="Av., Jr., Calle..." />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Ubicación (Departamento / Provincia / Distrito)"
              name="ubigeo"
              rules={[
                {
                  required: true,
                  message: "Seleccione su distrito de residencia.",
                },
                {
                  validator: (_, val) => {
                    const okArray = Array.isArray(val) && val.length === 3;
                    const okString =
                      typeof val === "string" && /^\d{6}$/.test(val);
                    return okArray || okString
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "Seleccione Departamento, Provincia y Distrito."
                          )
                        );
                  },
                },
              ]}
            >
              <Spin spinning={treeLoading}>
                <Cascader
                  options={ubigeoTree}
                  showSearch
                  placeholder="Selecciona tu distrito"
                  changeOnSelect={false}
                  fieldNames={{
                    label: "label",
                    value: "value",
                    children: "children",
                  }}
                  // Asegura que el Form siempre guarde el path completo (array)
                  onChange={(pathValue) => {
                    // pathValue puede venir como array (preferido) o como string (algunas búsquedas)
                    if (Array.isArray(pathValue)) {
                      form.setFieldValue("ubigeo", pathValue.map(String));
                    } else if (typeof pathValue === "string") {
                      // si llegara un string de 6 dígitos, buscamos el path en el árbol
                      const findPath = (
                        nodes: any[],
                        target: string,
                        trail: string[] = []
                      ): string[] | null => {
                        for (const n of nodes) {
                          const nextTrail = [...trail, String(n.value)];
                          if (
                            String(n.value) === target &&
                            nextTrail.length === 3
                          )
                            return nextTrail;
                          if (n.children?.length) {
                            const r = findPath(n.children, target, nextTrail);
                            if (r) return r;
                          }
                        }
                        return null;
                      };
                      const path = /^\d{6}$/.test(pathValue)
                        ? findPath(ubigeoTree, pathValue)
                        : null;
                      form.setFieldValue("ubigeo", path ?? pathValue);
                    }
                  }}
                />
              </Spin>
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              label="Teléfono personal"
              name="telefonoPersonal"
              rules={[{ required: true, message: "Ingrese su teléfono." }]}
            >
              <Input
                allowClear
                prefix={<PhoneOutlined />}
                placeholder="+51 9xx xxx xxx"
                maxLength={20}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card className="rounded-2xl shadow-sm" title="Contactos de emergencia">
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Contacto 1"
              name="contactoEmergencia1"
              rules={[{ required: true, message: "Ingrese el contacto." }]}
            >
              <Input allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Parentesco 1"
              name="parentescoEmergencia1"
              rules={[{ required: true, message: "Obligatorio." }]}
            >
              <Select
                allowClear
                placeholder="Seleccione"
                options={[
                  { value: "Padre", label: "Padre" },
                  { value: "Madre", label: "Madre" },
                  { value: "Hermano(a)", label: "Hermano(a)" },
                  { value: "Cónyuge", label: "Cónyuge" },
                  { value: "Tutor", label: "Tutor" },
                  { value: "Otro", label: "Otro" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Teléfono 1"
              name="telefonoEmergencia1"
              rules={[{ required: true, message: "Obligatorio." }]}
            >
              <Input
                allowClear
                prefix={<PhoneOutlined />}
                placeholder="+51 9xx xxx xxx"
                maxLength={20}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider plain>Segundo contacto (opcional)</Divider>

        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Form.Item label="Contacto 2" name="contactoEmergencia2">
              <Input allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Parentesco 2" name="parentescoEmergencia2">
              <Select
                allowClear
                placeholder="Seleccione"
                options={[
                  { value: "Padre", label: "Padre" },
                  { value: "Madre", label: "Madre" },
                  { value: "Hermano(a)", label: "Hermano(a)" },
                  { value: "Cónyuge", label: "Cónyuge" },
                  { value: "Tutor", label: "Tutor" },
                  { value: "Otro", label: "Otro" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Teléfono 2" name="telefonoEmergencia2">
              <Input
                allowClear
                prefix={<PhoneOutlined />}
                placeholder="+51 9xx xxx xxx"
                maxLength={20}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </Space>
  );

  const StepAcademicos = (
    <Card className="rounded-2xl shadow-sm">
      <Row gutter={[12, 12]}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Carrera profesional"
            name="carreraProfesional"
            rules={[{ required: true, message: "Obligatorio." }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Seleccione su carrera"
              options={[
                { value: "Enfermería", label: "Enfermería" },
                {
                  value: "Farmacia y Bioquímica",
                  label: "Farmacia y Bioquímica",
                },
                { value: "Obstetricia", label: "Obstetricia" },
                { value: "Psicología", label: "Psicología" },
                { value: "Administración", label: "Administración" },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Ciclo de estudios"
            name="cicloEstudios"
            rules={[{ required: true, message: "Seleccione el ciclo." }]}
          >
            <Select allowClear placeholder="Seleccione">
              {Array.from({ length: 10 }).map((_, i) => (
                <Select.Option key={i + 1} value={String(i + 1)}>
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
    </Card>
  );

  const StepSaludSeguro = (
    <Space direction="vertical" size="small" style={{ width: "100%" }}>
      <Card className="rounded-2xl shadow-sm" title="Condiciones médicas">
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Form.Item
              label="¿Sufre alguna enfermedad?"
              name="sufreEnfermedad"
              valuePropName="checked"
              rules={[
                {
                  required: true,
                  message: "Indique si sufre alguna enfermedad.",
                },
              ]}
            >
              <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>
          </Col>

          {sufreEnfermedad && (
            <>
              <Col xs={24}>
                <Form.Item
                  label="Enfermedades (seleccione una o varias)"
                  name="enfermedadesSelect"
                  rules={[
                    {
                      required: true,
                      message: "Seleccione al menos una opción.",
                    },
                  ]}
                >
                  <Select mode="multiple" placeholder="Seleccione">
                    {ENFERMEDADES_COMUNES.map((e) => (
                      <Select.Option key={e} value={e}>
                        {e}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {enfermedadesSelect.includes("Otra") && (
                <Col xs={24}>
                  <Form.Item
                    label="Otras enfermedades (detalle)"
                    name="enfermedadesOtro"
                    rules={[
                      {
                        required: true,
                        message: "Detalle otras enfermedades.",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Ej: tiroides, anemia, etc."
                    />
                  </Form.Item>
                </Col>
              )}
            </>
          )}

          <Col xs={24} md={8}>
            <Form.Item
              label="¿Tiene alergias?"
              name="alergias"
              valuePropName="checked"
            >
              <Switch checkedChildren="Sí" unCheckedChildren="No" />
            </Form.Item>
          </Col>

          {alergias && (
            <>
              <Col xs={24}>
                <Form.Item
                  label="Alergias (seleccione una o varias)"
                  name="alergiasSelect"
                  rules={[
                    {
                      required: true,
                      message: "Seleccione al menos una opción.",
                    },
                  ]}
                >
                  <Select mode="multiple" placeholder="Seleccione">
                    {ALERGIAS_COMUNES.map((a) => (
                      <Select.Option key={a} value={a}>
                        {a}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {alergiasSelect.includes("Otra") && (
                <Col xs={24}>
                  <Form.Item
                    label="Otras alergias (detalle)"
                    name="alergiasOtro"
                    rules={[
                      { required: true, message: "Detalle otras alergias." },
                    ]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Ej: alimentos específicos, látex..."
                    />
                  </Form.Item>
                </Col>
              )}
            </>
          )}

          <Col xs={24}>
            <Form.Item
              label="Antecedentes familiares (opcional)"
              name="antecedentesFamiliares"
            >
              <Input.TextArea rows={3} allowClear placeholder="Opcional" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        className="rounded-2xl shadow-sm"
        title="Seguro de salud (opcional)"
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Form.Item label="Tipo de seguro" name="tipoSeguro">
              <Select allowClear placeholder="Seleccione">
                <Select.Option value="sis">
                  SIS (Seguro Integral de Salud)
                </Select.Option>
                <Select.Option value="essalud">
                  EsSalud (Seguro Social de Salud)
                </Select.Option>
                <Select.Option value="eps">
                  EPS (Entidad Prestadora de Salud)
                </Select.Option>
                <Select.Option value="otro">Otro</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          {tipoSeguro === "otro" && (
            <Col xs={24} md={16}>
              <Form.Item
                label="Detalle del seguro (otro)"
                name="seguroOtro"
                rules={[{ required: true, message: "Especifique el seguro." }]}
              >
                <Input allowClear placeholder="Nombre del seguro" />
              </Form.Item>
            </Col>
          )}
        </Row>
      </Card>
    </Space>
  );

  const StepFisicos = (
    <Card className="rounded-2xl shadow-sm">
      <Row gutter={[12, 12]}>
        <Col xs={24} md={6}>
          <Form.Item
            label="Peso"
            name="peso"
            tooltip="En kilogramos"
            rules={[
              { required: true, message: "Ingrese su peso." },
              {
                type: "number",
                min: 2,
                max: 300,
                message: "Rango válido: 2–300 kg.",
              },
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
              { required: true, message: "Ingrese su estatura." },
              {
                type: "number",
                min: 0.3,
                max: 2.5,
                message: "Rango válido: 0.3–2.5 m.",
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
    </Card>
  );

  const StepConfirm = () => {
    const v = form.getFieldsValue(true);

    const Section: React.FC<{
      title: React.ReactNode;
      children: React.ReactNode;
    }> = ({ title, children }) => (
      <Card
        size="small"
        className="rounded-xl"
        style={{ borderColor: "#f0f0f0" }}
        title={title}
      >
        {children}
      </Card>
    );

    const Item = ({
      label,
      value,
    }: {
      label: string;
      value: React.ReactNode;
    }) => (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "220px 1fr",
          gap: 8,
          padding: "6px 0",
        }}
      >
        <div style={{ color: "#6b7280" }}>{label}</div>
        <div style={{ fontWeight: 500 }}>{value ?? "—"}</div>
      </div>
    );

    const enfermedadesPreview =
      (v.enfermedadesSelect || [])
        .map((e: string) => (e === "Otra" ? null : e))
        .filter(Boolean)
        .join(", ") || "—";

    const alergiasPreview =
      (v.alergiasSelect || [])
        .map((a: string) => (a === "Otra" ? null : a))
        .filter(Boolean)
        .join(", ") || "—";

    const ubigeoPreview = resolvedUbigeo
      ? `${resolvedUbigeo.departamento ?? "—"} / ${
          resolvedUbigeo.provincia ?? "—"
        } / ${resolvedUbigeo.distrito ?? "—"}`
      : v.ubigeo?.join?.(" / ") ?? "—";

    return (
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Card
          className="rounded-2xl shadow-sm"
          style={{ borderTop: `5px solid ${PRIMARY}`, background: "#fff5f7" }}
        >
          <Typography.Title
            level={5}
            style={{ marginBottom: 8, color: PRIMARY }}
          >
            <UserAddOutlined /> Revisión final de la ficha
          </Typography.Title>
          <Typography.Paragraph style={{ marginTop: 0, color: "#374151" }}>
            Este formulario <b>se completa una sola vez</b>. Verifica que la
            información sea precisa antes de guardar.
          </Typography.Paragraph>
        </Card>

        <Section title="Identificación">
          <Item label="Código estudiante" value={v.codigoEstudiante} />
          <Item label="DNI" value={v.dni} />
          <Item label="Ap. paterno" value={v.apellidoPaterno} />
          <Item label="Ap. materno" value={v.apellidoMaterno} />
          <Item label="Nombres" value={v.nombres} />
        </Section>

        <Section title="Demográficos">
          <Item
            label="Sexo"
            value={
              v.sexo === "V"
                ? "Varón"
                : v.sexo === "M"
                ? "Mujer"
                : v.sexo || "—"
            }
          />
          <Item
            label="Género"
            value={
              v.genero === "M"
                ? "Masculino"
                : v.genero === "F"
                ? "Femenino"
                : v.genero === "O"
                ? "Otros"
                : "—"
            }
          />
          <Item
            label="Fecha de nacimiento"
            value={
              v.fechaNacimiento
                ? dayjs(v.fechaNacimiento).format("YYYY-MM-DD")
                : "—"
            }
          />
        </Section>

        <Section title="Contacto">
          <Item label="Domicilio actual" value={v.domicilioActual} />
          <Item label="Ubigeo" value={ubigeoPreview} />
          <Item label="Teléfono personal" value={v.telefonoPersonal} />
        </Section>

        <Section title="Contactos de emergencia">
          <Item
            label="Contacto 1"
            value={
              <>
                {v.contactoEmergencia1}{" "}
                <Tag color="geekblue">{v.parentescoEmergencia1 || "—"}</Tag>
              </>
            }
          />
          <Item label="Teléfono 1" value={v.telefonoEmergencia1} />
          {(v.contactoEmergencia2 ||
            v.parentescoEmergencia2 ||
            v.telefonoEmergencia2) && (
            <>
              <Divider style={{ margin: "8px 0" }} />
              <Item
                label="Contacto 2"
                value={
                  <>
                    {v.contactoEmergencia2}{" "}
                    <Tag color="cyan">{v.parentescoEmergencia2 || "—"}</Tag>
                  </>
                }
              />
              <Item label="Teléfono 2" value={v.telefonoEmergencia2} />
            </>
          )}
        </Section>

        <Section title="Académicos">
          <Item label="Carrera profesional" value={v.carreraProfesional} />
          <Item label="Ciclo de estudios" value={v.cicloEstudios} />
        </Section>

        <Section title="Salud">
          <Item
            label="¿Sufre enfermedad?"
            value={
              v.sufreEnfermedad ? (
                <Tag color="red">Sí</Tag>
              ) : (
                <Tag color="green">No</Tag>
              )
            }
          />
          {v.sufreEnfermedad && (
            <>
              <Item
                label="Enfermedades (comunes)"
                value={enfermedadesPreview}
              />
              {v.enfermedadesSelect?.includes("Otra") && (
                <Item label="Otras enfermedades" value={v.enfermedadesOtro} />
              )}
            </>
          )}
          <Item
            label="¿Tiene alergias?"
            value={v.alergias ? <Tag color="orange">Sí</Tag> : "No"}
          />
          {v.alergias && (
            <>
              <Item label="Alergias (comunes)" value={alergiasPreview} />
              {v.alergiasSelect?.includes("Otra") && (
                <Item label="Otras alergias" value={v.alergiasOtro} />
              )}
            </>
          )}
          <Item
            label="Antecedentes familiares"
            value={v.antecedentesFamiliares}
          />
        </Section>

        <Section title="Seguro (opcional)">
          <Item label="Tipo de seguro" value={v.tipoSeguro} />
          {v.tipoSeguro === "otro" && (
            <Item label="Seguro (otro)" value={v.seguroOtro} />
          )}
        </Section>

        <Section title="Datos físicos">
          <Item
            label="Peso"
            value={v.peso !== undefined ? `${v.peso} kg` : "—"}
          />
          <Item
            label="Estatura"
            value={v.estatura !== undefined ? `${v.estatura} m` : "—"}
          />
        </Section>
      </Space>
    );
  };

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
        return StepSaludSeguro;
      case 5:
        return StepFisicos;
      case 6:
        return <StepConfirm />;
      default:
        return StepIdentificacion;
    }
  };

  // =================== SOLO LECTURA (diseño actualizado) ===================
  const ReadOnlyFicha: React.FC<{ ficha: TP_Ficha }> = ({ ficha }) => {
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    const SOFT_BG = "#fff8f9";
    const EMPTY = "No registrado";

    const nombreCompleto = [
      ficha.apellidoPaterno,
      ficha.apellidoMaterno,
      ficha.nombres,
    ]
      .filter(Boolean)
      .join(" ");

    const initials = (nombreCompleto || ficha.nombres || "?")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const fmt = (v: any) =>
      v === null ||
      v === undefined ||
      (typeof v === "string" && v.trim() === "")
        ? EMPTY
        : v;

    const Field: React.FC<{
      label: React.ReactNode;
      value: React.ReactNode;
    }> = ({ label, value }) => (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "220px 1fr",
          gap: 6,
          padding: "6px 0",
        }}
      >
        <div style={{ color: "#6b7280" }}>{label}</div>
        <div style={{ fontWeight: 500 }}>{fmt(value)}</div>
      </div>
    );

    const Section: React.FC<{
      title: React.ReactNode;
      icon?: React.ReactNode;
      extra?: React.ReactNode;
      children: React.ReactNode;
    }> = ({ title, icon, extra, children }) => (
      <Card
        className="rounded-2xl shadow-sm"
        styles={{
          header: {
            background: SOFT_BG,
            borderRadius: 12,
            padding: "10px 14px",
          },
          body: { paddingTop: 16 },
        }}
        title={
          <Space>
            {icon}
            <span style={{ fontWeight: 700 }}>{title}</span>
          </Space>
        }
        extra={extra}
      >
        {children}
      </Card>
    );

    const generoToText = (g?: "M" | "F" | "O") =>
      g === "M"
        ? "Masculino"
        : g === "F"
        ? "Femenino"
        : g === "O"
        ? "Otros"
        : EMPTY;

    const sexoToText = (s?: string) =>
      s === "V" ? "Varón" : s === "M" ? "Mujer" : EMPTY;

    const seguroToText = (t?: string, otro?: string) => {
      switch ((t || "").toLowerCase()) {
        case "sis":
          return "SIS (Seguro Integral de Salud)";
        case "essalud":
          return "EsSalud (Seguro Social de Salud)";
        case "eps":
          return "EPS (Entidad Prestadora de Salud)";
        case "otro":
          return `Otro: ${fmt(otro)}`;
        default:
          return "Sin seguro registrado";
      }
    };

    return (
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: isMobile ? 12 : 16,
        }}
      >
        {/* HERO */}
        <div
          style={{
            background: `linear-gradient(90deg, ${PRIMARY} 0%, #ff6c8a 60%, #ff9fb3 100%)`,
            color: "#fff",
            padding: isMobile ? "16px" : "20px 24px",
            borderRadius: 16,
            marginBottom: 20,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col flex="48px">
              <Avatar
                size={48}
                style={{ background: "#fff", color: PRIMARY, fontWeight: 800 }}
                icon={<UserOutlined />}
              >
                {initials}
              </Avatar>
            </Col>
            <Col flex="auto">
              <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
                {fmt(nombreCompleto) !== EMPTY ? nombreCompleto : "Estudiante"}
              </Typography.Title>
              <Space wrap>
                <Tag color="white" style={{ color: PRIMARY, fontWeight: 700 }}>
                  <IdcardOutlined /> {fmt(ficha.codigoEstudiante)}
                </Tag>
                {ficha.carreraProfesional && (
                  <Tag color="#ffd6e0" style={{ color: PRIMARY }}>
                    <BookOutlined /> {ficha.carreraProfesional}
                  </Tag>
                )}
                {ficha.cicloEstudios && (
                  <Tag color="#ffd6e0" style={{ color: PRIMARY }}>
                    Ciclo {ficha.cicloEstudios}
                  </Tag>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        {/* CONTENIDO ORDENADO */}
        <Row gutter={[16, 16]}>
          {/* 1) Identificación – full width */}
          <Col xs={24}>
            <Section title="Identificación" icon={<UserOutlined />}>
              <Field
                label="Código de estudiante"
                value={ficha.codigoEstudiante}
              />
              <Field
                label="DNI (Documento Nacional de Identidad)"
                value={ficha.dni}
              />
              <Field label="Apellido paterno" value={ficha.apellidoPaterno} />
              <Field label="Apellido materno" value={ficha.apellidoMaterno} />
              <Field label="Nombres" value={ficha.nombres} />
            </Section>
          </Col>

          {/* 2) Demográficos + Académica – lado a lado en desktop */}
          <Col xs={24} md={12}>
            <Section title="Datos demográficos" icon={<InteractionOutlined />}>
              <Field
                label="Sexo (al nacer)"
                value={sexoToText(ficha.sexo || "")}
              />
              <Field
                label="Género (autopercibido)"
                value={generoToText(ficha.genero || "F")}
              />
              <Field
                label="Fecha de nacimiento (DD/MM/AAAA)"
                value={
                  ficha.fechaNacimiento
                    ? dayjs(ficha.fechaNacimiento).format("DD/MM/YYYY")
                    : EMPTY
                }
              />
            </Section>
          </Col>
          <Col xs={24} md={12}>
            <Section title="Información académica" icon={<BookOutlined />}>
              <Field
                label="Carrera profesional"
                value={ficha.carreraProfesional}
              />
              <Field label="Ciclo de estudios" value={ficha.cicloEstudios} />
            </Section>
          </Col>

          {/* 3) Residencia – full width */}
          <Col xs={24}>
            <Section title="Residencia y contacto" icon={<HomeOutlined />}>
              <Field label="Domicilio actual" value={ficha.domicilioActual} />
              <Field
                label="Ubigeo (Departamento / Provincia / Distrito)"
                value={`${fmt(ficha.departamento)} / ${fmt(
                  ficha.provincia
                )} / ${fmt(ficha.distrito)}`}
              />
              <Field
                label="Teléfono de contacto"
                value={ficha.telefonoPersonal}
              />
            </Section>
          </Col>

          {/* 4) Salud – full width */}
          <Col xs={24}>
            <Section
              title="Salud y seguro"
              icon={<HeartOutlined />}
              extra={
                <Tag color="processing">
                  {seguroToText(ficha.tipoSeguro || "", ficha.seguroOtro || "")}
                </Tag>
              }
            >
              {String(ficha.tipoSeguro || "").toLowerCase() === "otro" && (
                <Field
                  label="Detalle del seguro (otro)"
                  value={ficha.seguroOtro}
                />
              )}
              <Field
                label="Enfermedades registradas"
                value={ficha.enfermedades}
              />
              <Field
                label="Alergias registradas"
                value={ficha.alergiasDetalle}
              />
              <Field
                label="Antecedentes familiares"
                value={ficha.antecedentesFamiliares}
              />
            </Section>
          </Col>

          {/* 5) Contactos de emergencia – full width */}
          <Col xs={24}>
            <Section title="Contactos de emergencia" icon={<PhoneOutlined />}>
              <Row gutter={[12, 12]}>
                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    style={{ background: SOFT_BG, borderRadius: 12 }}
                  >
                    <Space
                      direction="vertical"
                      size={6}
                      style={{ width: "100%" }}
                    >
                      <Field
                        label="Nombre de contacto 1"
                        value={ficha.contactoEmergencia1}
                      />
                      <Field
                        label="Parentesco 1"
                        value={ficha.parentescoEmergencia1}
                      />
                      <Field
                        label="Teléfono 1"
                        value={ficha.telefonoEmergencia1}
                      />
                    </Space>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    style={{ background: SOFT_BG, borderRadius: 12 }}
                  >
                    <Space
                      direction="vertical"
                      size={6}
                      style={{ width: "100%" }}
                    >
                      <Field
                        label="Nombre de contacto 2"
                        value={ficha.contactoEmergencia2}
                      />
                      <Field
                        label="Parentesco 2"
                        value={ficha.parentescoEmergencia2}
                      />
                      <Field
                        label="Teléfono 2"
                        value={ficha.telefonoEmergencia2}
                      />
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Section>
          </Col>

          {/* 6) Datos físicos – full width */}
          <Col xs={24}>
            <Section title="Datos físicos" icon={<UserOutlined />}>
              <Space size="large" wrap>
                <Card style={{ minWidth: 260, background: SOFT_BG }}>
                  <div style={{ color: "#6b7280" }}>Peso</div>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {ficha.peso !== null && ficha.peso !== undefined
                      ? `${ficha.peso} kg`
                      : EMPTY}
                  </Typography.Title>
                </Card>
                <Card style={{ minWidth: 260, background: SOFT_BG }}>
                  <div style={{ color: "#6b7280" }}>Estatura</div>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {ficha.estatura !== null && ficha.estatura !== undefined
                      ? `${ficha.estatura} m`
                      : EMPTY}
                  </Typography.Title>
                </Card>
              </Space>
            </Section>
          </Col>
        </Row>

        <Divider />
        <Space style={{ color: "#6b7280" }}>
          <FileProtectOutlined />
          <Typography.Text type="secondary">
            Si necesitas actualizar algún dato, comunícate con la Secretaría
            Académica.
          </Typography.Text>
        </Space>
      </div>
    );
  };

  // =================== RENDER PRINCIPAL ===================
  if (loadingFicha) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" tip="Cargando información..." />
      </div>
    );
  }

  if (fichaExistente) {
    return <ReadOnlyFicha ficha={fichaExistente} />;
  }

  return (
    <div style={containerStyle}>
      {/* Banner superior */}
      <div
        style={{
          background: `linear-gradient(90deg, ${PRIMARY} 0%, #ff6c8a 50%, #ff9fb3 100%)`,
          color: "#fff",
          padding: "20px 24px",
          borderRadius: 12,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}
      >
        <UserAddOutlined style={{ fontSize: 28, color: "white" }} />
        <div>
          <Typography.Title
            level={4}
            style={{ color: "#fff", margin: 0, fontWeight: 700 }}
          >
            Ficha de Estudiante — Registro Único
          </Typography.Title>
          <Typography.Text
            style={{ color: "#fff", opacity: 0.95, fontSize: 15 }}
          >
            Este formulario solo se llena una vez. Asegúrate de que la
            información sea precisa y veraz.
          </Typography.Text>
        </div>
      </div>

      <Row gutter={16}>
        <Col xs={24} md={6}>
          <Card
            size="small"
            className="rounded-2xl shadow-sm"
            style={{ position: "sticky", top: 12 }}
          >
            <Steps
              direction={isMobile ? "horizontal" : "vertical"}
              current={current}
              items={steps.map((s) => ({ title: s.title, icon: s.icon }))}
            />
          </Card>
        </Col>

        <Col xs={24} md={18}>
          <Form
            form={form}
            layout="vertical"
            requiredMark="optional"
            initialValues={{
              sufreEnfermedad: false,
              alergias: false,
              ubigeo: [], // <- mantiene el tipo estable
            }}
          >
            <Divider orientation="left" style={{ marginTop: 0 }}>
              <Space>
                {steps[current].icon}
                <span style={{ fontWeight: 600 }}>{steps[current].title}</span>
              </Space>
            </Divider>

            {renderStepContent()}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              {current > 0 && (
                <Button
                  icon={<DoubleLeftOutlined />}
                  onClick={() => setCurrent((c) => c - 1)}
                >
                  Atrás
                </Button>
              )}
              <Button
                type="primary"
                icon={
                  current < steps.length - 1 ? (
                    <DoubleRightOutlined />
                  ) : (
                    <CheckOutlined />
                  )
                }
                onClick={onPrimaryAction}
                loading={saving}
                style={{
                  borderRadius: 8,
                  padding: "0 20px",
                  backgroundColor: PRIMARY,
                  borderColor: PRIMARY,
                }}
              >
                {current < steps.length - 1 ? "Siguiente" : "Guardar Ficha"}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  );
}
