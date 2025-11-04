/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import {
  Upload,
  Select,
  Form,
  Button,
  Card,
  Typography,
  Alert,
  Divider,
  Table,
  Tag,
  Tabs,
  Statistic,
  Progress,
  ConfigProvider,
  Row,
  Col,
  message,
  Input,
} from "antd";
import { UploadOutlined, SearchOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";

const { Option } = Select;
const { Title, Text } = Typography;

/** ---- Catálogos Facultad/Carrera ---- */
const FACULTADES: Record<string, string> = {
  E: "INGENIERÍA Y NEGOCIOS",
  S: "CIENCIAS DE LA SALUD",
};

const CARRERAS: Record<string, Array<{ value: string; label: string }>> = {
  E: [
    { value: "E2", label: "ADMINISTRACIÓN Y MARKETING" },
    { value: "E4", label: "ADMINISTRACIÓN Y NEGOCIOS INTERNACIONALES" },
    { value: "E6", label: "INGENIERÍA DE INTELIGENCIA ARTIFICIAL" },
  ],
  S: [
    { value: "S1", label: "ENFERMERÍA" },
    { value: "S2", label: "FARMACIA Y BIOQUÍMICA" },
    { value: "S3", label: "NUTRICIÓN Y DIETÉTICA" },
    { value: "S4", label: "PSICOLOGÍA" },
    { value: "S5", label: "TEC. MÉDICA EN TERAPIA FÍSICA Y REHABILITACIÓN" },
    { value: "S6", label: "TEC. MÉDICA EN LAB. CLÍNICO Y ANATOMÍA PATOLÓGICA" },
  ],
};

/** ---- Tipos ---- */
type ConvalidarResponse = {
  status: "ok" | "ya_convalidado";
  mensaje?: string;
  total_archivos?: number;
  resultado_extraccion?: any;
  resultado_convalidacion?: any;
  convalidadas?: number;
  porcentaje_convalidacion_plan?: number;
  porcentaje_convalidacion_real?: number;
  costo_total_usd?: number;
};

type Row = {
  curso_plan: string;
  curso_extraido_equivalente: string | null;
  convalidable: boolean;
  razon: string;
};

/** ---- Normaliza estructura del backend a filas de tabla ---- */
const toRows = (payload: any): Row[] => {
  if (!payload) return [];

  const candidates = [
    payload,
    payload?.convalidaciones,
    payload?.detalle,
    payload?.items,
    payload?.matches,
    payload?.resultado,
    payload?.data,
  ].filter(Boolean);

  let arr: any[] = [];
  for (const c of candidates) {
    if (Array.isArray(c)) {
      arr = c;
      break;
    }
  }

  // Caso mapa plano { "PLAN": "EXTRAIDO", ... }
  if (!arr.length && typeof payload === "object") {
    const entries = Object.entries(payload);
    if (entries.length && typeof entries[0][1] !== "object") {
      return entries.map(([k, v]) => ({
        curso_plan: String(k),
        curso_extraido_equivalente: v ? String(v) : null,
        convalidable: Boolean(v),
        razon: v ? "" : "Sin equivalencia encontrada",
      }));
    }
  }

  const pick = (o: any, keys: string[], def?: any) => {
    for (const k of keys)
      if (o?.[k] !== undefined && o?.[k] !== null) return o[k];
    return def;
  };

  return arr.map((it: any) => ({
    curso_plan: String(
      pick(
        it,
        ["curso_plan", "plan_curso", "plan", "curso", "curso_del_plan"],
        ""
      )
    ),
    curso_extraido_equivalente:
      pick(
        it,
        [
          "curso_extraido_equivalente",
          "convalida_con",
          "extraido",
          "match",
          "curso_extraido",
          "equivalente",
          "origen",
        ],
        null
      )?.toString() ?? null,
    convalidable: Boolean(
      pick(it, ["convalidable", "ok", "match_ok", "valido", "is_match"], false)
    ),
    razon: String(pick(it, ["razon", "motivo", "reason", "explicacion"], "")),
  }));
};

export default function Page() {
  const [fileList, setFileList] = useState<any[]>([]);
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);

  // resultados
  const [extractionResp, setExtractionResp] = useState<any | null>(null);
  const [convResult, setConvResult] = useState<ConvalidarResponse | null>(null);
  const [serverError, setServerError] = useState<{
    code: string;
    message: string;
    files_checked?: number;
  } | null>(null);

  const [searchText, setSearchText] = useState<string>("");

  const [form] = Form.useForm();

  const dni = Form.useWatch("dni", form);
  const nombres = Form.useWatch("nombres", form);
  const apellidos = Form.useWatch("apellidos", form);

  /** Observa facultad para filtrar carreras */
  const facultadSeleccionada = Form.useWatch("facultad", form);

  /** Upload */
  const allowedMimes = ["image/jpeg", "image/png", "application/pdf"];
  const uploadProps: UploadProps = {
    multiple: true,
    beforeUpload: (file) => {
      if (!allowedMimes.includes(file.type)) {
        message.error(`Tipo no permitido: ${file.name}. Solo JPG, PNG o PDF.`);
        return Upload.LIST_IGNORE;
      }
      setFileList((prev) => [...prev, file]);
      return false; // controlado
    },
    fileList,
    onRemove: (file) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
    maxCount: 10,
    accept: ".jpg,.jpeg,.png,.pdf",
  };

  /** Normaliza % (0–1 → 0–100) */
  const normalizePct = (v?: number) =>
    v == null ? undefined : v <= 1 ? v * 100 : v;

  /** Paso 1: EXTRAER CURSOS */
  const handleExtract = async () => {
    if (fileList.length === 0) {
      message.error("Debes subir al menos un archivo.");
      return;
    }
    setServerError(null);
    setExtractionResp(null);
    setConvResult(null);
    setLoadingExtract(true);
    const hide = message.loading("Extrayendo cursos…", 0);

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL!;
      const fd = new FormData();
      fileList.forEach((f) => fd.append("files", f as File));

      // ✅ Obtener los valores del formulario
      const { dni, nombres, apellidos } = form.getFieldsValue([
        "dni",
        "nombres",
        "apellidos",
      ]);

      // Validar que existan
      if (!dni || !nombres || !apellidos) {
        message.error(
          "Debe ingresar DNI, nombres y apellidos antes de extraer."
        );
        hide();
        setLoadingExtract(false);
        return;
      }

      // ✅ Agregarlos al FormData
      fd.append("dni", dni);
      fd.append("nombres", nombres);
      fd.append("apellidos", apellidos);

      const { data } = await axios.post(
        `${baseURL}/api/admin/extraer-cursos`,
        fd,
        { withCredentials: true, timeout: 540_000 }
      );

      const extraidos = data?.resultado?.extraidos ?? [];
      if (!Array.isArray(extraidos) || extraidos.length === 0) {
        throw new Error(
          "No se extrajeron cursos del récord. Verifica la legibilidad del documento."
        );
      }

      setExtractionResp(data);
      message.success(`Se extrajeron ${extraidos.length} curso(s).`);
    } catch (err: any) {
      const be = err?.response?.data?.error || err?.response?.data;
      if (be?.code === "invalid_record_academic") {
        setServerError({
          code: be.code,
          message:
            be.message ||
            "Ningún archivo parece ser un récord académico de notas",
          files_checked: be.files_checked,
        });
        message.error(
          "No se detectó un récord académico válido en los archivos enviados."
        );
      } else if (err?.code === "ECONNABORTED") {
        message.error("La extracción excedió el tiempo de espera.");
      } else {
        message.error(be?.message || err?.message || "Error al extraer cursos");
      }
    } finally {
      hide();
      setLoadingExtract(false);
    }
  };

  /** Paso 2: CONVALIDAR (usa rutas separadas) */
  const handleConvalidar = async (values: any) => {
    // const modalidadMap: Record<string, number> = {
    //   presencial: 1,
    //   semipresencial: 2,
    //   virtual: 3,
    // };
    const c_codesp = values.carrera;

    // extraídos desde el primer paso
    const extraidos: Array<{
      curso: string;
      ciclo: string | null;
      nota: number;
    }> = extractionResp?.resultado?.extraidos ?? [];

    if (!extraidos.length) {
      message.error("Primero debes extraer cursos.");
      return;
    }

    setLoadingConv(true);
    setConvResult(null);
    const hide = message.loading("Convalidando…", 0);

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL!;
      const { dni, nombres, apellidos } = form.getFieldsValue([
        "dni",
        "nombres",
        "apellidos",
      ]);

      // ✅ Ahora incluimos todos los datos esperados por el backend
      const payload = { dni, nombres, apellidos, c_codesp, extraidos };

      const { data } = (await axios.post<ConvalidarResponse>(
        `${baseURL}/api/admin/convalidar-extraidos`,
        payload,
        { withCredentials: true, timeout: 540_000 }
      )) as any;

      // ⚡ Detectar si ya estaba convalidado
      if (data.status === "ya_convalidado") {
        message.warning(
          data.mensaje || "El estudiante ya tiene convalidaciones registradas."
        );

        setConvResult({
          status: "ya_convalidado",
          mensaje: data.mensaje,
          resultado_convalidacion: {
            convalidaciones: data.data_convalidaciones ?? [],
          },
          convalidadas: data.convalidadas ?? 0,
          porcentaje_convalidacion_plan: 0,
          porcentaje_convalidacion_real: 0,
        });

        return;
      }

      // ⚡ Caso normal: convalidación recién ejecutada
      const merged: ConvalidarResponse = {
        status: "ok",
        total_archivos: extractionResp?.total_archivos,
        resultado_extraccion: extractionResp?.resultado,
        resultado_convalidacion: data?.resultado_convalidacion,
        convalidadas: data?.convalidadas,
        porcentaje_convalidacion_plan: data?.porcentaje_convalidacion_plan,
        porcentaje_convalidacion_real: data?.porcentaje_convalidacion_real,
        costo_total_usd: data?.costo_usd,
      };
      setConvResult(merged);
      message.success("Convalidación completada correctamente.");
    } catch (err: any) {
      const be = err?.response?.data?.error || err?.response?.data;
      if (err?.code === "ECONNABORTED") {
        message.error("La convalidación excedió el tiempo de espera.");
      } else {
        message.error(
          be?.message || err?.message || "Error durante la convalidación"
        );
      }
    } finally {
      hide();
      setLoadingConv(false);
    }
  };

  /** Valores de salida + memos */
  const extraidos = useMemo(() => {
    const data = extractionResp?.resultado?.extraidos;
    return Array.isArray(data) ? data : [];
  }, [extractionResp?.resultado?.extraidos]);

  const filteredExtraidos = useMemo(() => {
    const q = (searchText || "").trim().toLowerCase();
    if (!q) return extraidos;
    return extraidos.filter((x: any) => {
      const c = (x.curso || "").toLowerCase();
      const ci = ((x.ciclo as string) || "").toLowerCase();
      return c.includes(q) || ci.includes(q);
    });
  }, [extraidos, searchText]);

  const pctReal = normalizePct(convResult?.porcentaje_convalidacion_real);
  const pctPlan = normalizePct(convResult?.porcentaje_convalidacion_plan);
  // const rows = toRows(convResult?.resultado_convalidacion);
  const rows = toRows(
    convResult?.resultado_convalidacion ||
      convResult?.resultado_convalidacion?.convalidaciones
  );

  // const planTotal =
  //   convResult?.resultado_convalidacion?.plan_total ??
  //   convResult?.resultado_convalidacion?.planTotal ??
  //   undefined;

  // const extraidosTotal =
  //   extractionResp?.resultado?.total_cursos_extraidos ??
  //   convResult?.resultado_convalidacion?.extraidos_total ??
  //   undefined;

  /** 🔹 Exportar reporte visual a PDF */
  // const handleDownloadPDF = async () => {
  //   console.log("click");

  //   try {
  //     const html2canvas = (await import("html2canvas")).default;
  //     const { jsPDF } = await import("jspdf");

  //     const reportElement = document.getElementById("reporte-convalidacion");
  //     if (!reportElement) {
  //       message.error("No se encontró el contenido para generar el PDF.");
  //       return;
  //     }

  //     // Capturar todo el contenido como imagen
  //     const canvas = await html2canvas(reportElement, {
  //       scale: 2,
  //       useCORS: true,
  //       backgroundColor: "#ffffff",
  //       windowWidth: reportElement.scrollWidth,
  //       windowHeight: reportElement.scrollHeight,
  //     });

  //     const imgData = canvas.toDataURL("image/png");
  //     const pdf = new jsPDF({
  //       orientation: "portrait",
  //       unit: "mm",
  //       format: "a4",
  //     });

  //     // Encabezado con título y fecha
  //     pdf.setFontSize(14);
  //     pdf.text("Reporte de Convalidación Académica", 10, 15);
  //     pdf.setFontSize(10);
  //     pdf.text(`Generado el ${new Date().toLocaleDateString()}`, 10, 21);

  //     // Calcular dimensiones y generar páginas
  //     const pageWidth = pdf.internal.pageSize.getWidth();
  //     const pageHeight = pdf.internal.pageSize.getHeight();
  //     const margin = 10;
  //     const imgWidth = pageWidth - margin * 2;
  //     const imgHeight = (canvas.height * imgWidth) / canvas.width;

  //     let heightLeft = imgHeight;
  //     let position = 30;

  //     // Primera página
  //     pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
  //     heightLeft -= pageHeight - position;

  //     // Agregar páginas adicionales si el contenido es más largo
  //     while (heightLeft > 0) {
  //       position = heightLeft - imgHeight + 30;
  //       pdf.addPage();

  //       // Repetir encabezado en cada página
  //       pdf.setFontSize(14);
  //       pdf.text("Reporte de Convalidación Académica", 10, 15);
  //       pdf.setFontSize(10);
  //       pdf.text(`Generado el ${new Date().toLocaleDateString()}`, 10, 21);

  //       pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
  //       heightLeft -= pageHeight;
  //     }

  //     // Guardar el archivo
  //     const dni = form.getFieldValue("dni") || "estudiante";
  //     pdf.save(`reporte_convalidacion_${dni}.pdf`);
  //   } catch (err) {
  //     console.error("Error generando PDF:", err);
  //     message.error("Error al generar el PDF.");
  //   }
  // };
  const handleDownloadPDF = async () => {
    console.log("click");

    try {
      const { utils, writeFile } = await import("xlsx");

      if (!rows || !rows.length) {
        message.warning("No hay datos de convalidación para exportar.");
        return;
      }

      const dni = form.getFieldValue("dni") || "sin_dni";
      const nombres = form.getFieldValue("nombres") || "";
      const apellidos = form.getFieldValue("apellidos") || "";

      // 🔹 Estructurar datos para Excel
      const dataForExcel = rows.map((item) => ({
        "Curso del plan": item.curso_plan || "",
        "Curso del récord (match)": item.curso_extraido_equivalente || "",
        Convalidable: item.convalidable ? "Sí" : "No",
        Razón: item.razon || "",
      }));

      // 🔹 Crear hoja de cálculo
      const worksheet = utils.json_to_sheet(dataForExcel);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Convalidación");

      // 🔹 Ajustar ancho de columnas
      const columnWidths = [
        { wch: 40 }, // Curso del plan
        { wch: 40 }, // Curso del récord (match)
        { wch: 15 }, // Convalidable
        { wch: 60 }, // Razón
      ];
      worksheet["!cols"] = columnWidths;

      // 🔹 Nombre del archivo
      const fileName = `${dni} - ${nombres} ${apellidos}.xlsx`.trim();

      // 🔹 Descargar archivo
      writeFile(workbook, fileName);

      message.success("Archivo Excel generado correctamente.");
    } catch (err) {
      console.error("Error generando Excel:", err);
      message.error("Error al generar el archivo Excel.");
    }
  };

  const convalidadas =
    convResult?.convalidadas ??
    convResult?.resultado_convalidacion?.convalidadas ??
    undefined;

  const algoCargando = loadingExtract || loadingConv;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#e40d5e",
          colorLink: "#e40d5e",
          colorInfo: "#e40d5e",
          borderRadius: 10,
        },
        components: {
          Button: { controlHeight: 40, fontWeight: 600 },
          Card: { headerBg: "#fff" },
          Tabs: { itemSelectedColor: "#e40d5e" },
          Tag: { defaultBg: "#fff1f3", defaultColor: "#e40d5e" },
        },
      }}
    >
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card
          title={
            <span style={{ color: "#e40d5e" }}>Convalidación Académica</span>
          }
          className="w-full max-w-5xl"
        >
          <Form
            layout="vertical"
            form={form}
            className="space-y-4"
            onValuesChange={(changed) => {
              if (Object.prototype.hasOwnProperty.call(changed, "facultad")) {
                form.setFieldsValue({ carrera: undefined });
              }
            }}
            onFinish={handleConvalidar}
          >
            {/* Paso 1: subir y extraer */}
            <Form.Item label="Archivo(s)" required>
              <Upload {...uploadProps} disabled={algoCargando}>
                <Button icon={<UploadOutlined />} disabled={algoCargando}>
                  Subir archivo(s)
                </Button>
              </Upload>
              <Text type="secondary">Formatos permitidos: JPG, PNG, PDF.</Text>
            </Form.Item>

            {/* Datos del estudiante */}
            <Row gutter={[16, 0]}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="DNI"
                  name="dni"
                  rules={[
                    {
                      required: true,
                      message: "Ingrese el DNI del estudiante",
                    },
                  ]}
                >
                  <Input placeholder="Ingrese el DNI" maxLength={15} />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  label="Nombres"
                  name="nombres"
                  rules={[{ required: true, message: "Ingrese los nombres" }]}
                >
                  <Input placeholder="Nombres del estudiante" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item
                  label="Apellidos"
                  name="apellidos"
                  rules={[{ required: true, message: "Ingrese los apellidos" }]}
                >
                  <Input placeholder="Apellidos del estudiante" />
                </Form.Item>
              </Col>
            </Row>

            <div className="flex gap-2">
              <Button
                type="primary"
                onClick={handleExtract}
                loading={loadingExtract}
                disabled={
                  fileList.length === 0 ||
                  algoCargando ||
                  !dni?.trim() ||
                  !nombres?.trim() ||
                  !apellidos?.trim()
                }
              >
                {loadingExtract ? "Extrayendo…" : "Extraer cursos"}
              </Button>
              {extractionResp?.resultado?.extraidos?.length ? (
                <Text type="success">
                  Extraídos: {extractionResp.resultado.extraidos.length}
                </Text>
              ) : null}
            </div>

            {/* ---- ALERTA DE ERROR DEL BACKEND ---- */}
            {!algoCargando && serverError && (
              <Alert
                style={{ marginTop: 8, marginBottom: 8 }}
                type="error"
                showIcon
                closable
                onClose={() => setServerError(null)}
                message="No se encontró un récord académico válido"
                description={
                  <div>
                    <div>
                      <b>Código:</b> {serverError.code}
                    </div>
                    <div>
                      <b>Mensaje:</b> {serverError.message}
                    </div>
                    {typeof serverError.files_checked === "number" && (
                      <div>
                        <b>Archivos revisados:</b> {serverError.files_checked}
                      </div>
                    )}
                    <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                      <li>
                        Verifica que el documento sea el{" "}
                        <i>historial de notas/récord académico</i>.
                      </li>
                      <li>
                        Si es foto, asegúrate de que sea <b>legible</b>.
                      </li>
                      <li>
                        Formatos aceptados: <b>PDF, JPG o PNG</b>.
                      </li>
                    </ul>
                  </div>
                }
              />
            )}

            <Divider />

            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Facultad"
                  name="facultad"
                  rules={[
                    { required: true, message: "Seleccione una facultad" },
                  ]}
                >
                  <Select
                    placeholder="Selecciona una facultad"
                    disabled={!extractionResp || algoCargando}
                  >
                    {Object.entries(FACULTADES).map(([value, label]) => (
                      <Option key={value} value={value}>
                        {label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Carrera"
                  name="carrera"
                  dependencies={["facultad"]}
                  rules={[
                    { required: true, message: "Seleccione una carrera" },
                  ]}
                >
                  <Select
                    placeholder={
                      facultadSeleccionada
                        ? "Selecciona una carrera"
                        : "Primero seleccione una facultad"
                    }
                    disabled={
                      !extractionResp || !facultadSeleccionada || algoCargando
                    }
                    showSearch
                    optionFilterProp="children"
                  >
                    {(facultadSeleccionada
                      ? CARRERAS[facultadSeleccionada] ?? []
                      : []
                    ).map((c) => (
                      <Option key={c.value} value={c.value}>
                        {c.value} — {c.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Modalidad"
              name="modalidad"
              rules={[{ required: true, message: "Seleccione una modalidad" }]}
            >
              <Select
                placeholder="Selecciona una modalidad"
                disabled={!extractionResp || algoCargando}
              >
                <Option value="presencial">Presencial (1)</Option>
                <Option value="semipresencial">Semipresencial (2)</Option>
                <Option value="virtual">Virtual (3)</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                disabled={!extractionResp || algoCargando}
                loading={loadingConv}
              >
                {loadingConv ? "Convalidando…" : "Convalidar"}
              </Button>
            </Form.Item>
          </Form>

          {algoCargando && (
            <div className="w-full flex flex-col items-center justify-center mt-4 gap-2">
              <Text type="secondary">
                No cierres esta ventana hasta finalizar.
              </Text>
            </div>
          )}

          {!!convResult && !algoCargando && (
            <>
              <Divider />

              {/* ✅ CONTENEDOR COMPLETO PARA PDF */}
              <div id="reporte-convalidacion">
                {/* KPIs */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12} lg={6}>
                    <Card>
                      <Statistic
                        title="% Convalidación Real"
                        value={
                          typeof pctReal === "number"
                            ? Number(pctReal.toFixed(2))
                            : undefined
                        }
                        precision={2}
                        suffix="%"
                      />
                      {typeof pctReal === "number" && (
                        <div style={{ marginTop: 12 }}>
                          <Progress percent={Number(pctReal.toFixed(2))} />
                        </div>
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} md={12} lg={6}>
                    <Card>
                      <Statistic
                        title="% Convalidación vs Plan"
                        value={
                          typeof pctPlan === "number"
                            ? Number(pctPlan.toFixed(2))
                            : undefined
                        }
                        precision={2}
                        suffix="%"
                      />
                      {typeof pctPlan === "number" && (
                        <div style={{ marginTop: 12 }}>
                          <Progress percent={Number(pctPlan.toFixed(2))} />
                        </div>
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} md={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Total del plan"
                        value={
                          convResult?.resultado_convalidacion?.plan_total ?? "-"
                        }
                      />
                      <Text type="secondary">plan_total</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Cursos extraídos"
                        value={
                          extractionResp?.resultado?.total_cursos_extraidos ??
                          convResult?.resultado_convalidacion
                            ?.extraidos_total ??
                          "-"
                        }
                      />
                      <Text type="secondary">extraidos_total</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Cursos convalidados"
                        value={convalidadas ?? "-"}
                      />
                      <Text type="secondary">convalidadas</Text>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                {/* Tabs */}
                <Tabs
                  items={[
                    {
                      key: "detalle",
                      label: "Detalle de convalidación",
                      children: (
                        <>
                          <Title
                            level={5}
                            style={{ marginTop: 0, marginBottom: 8 }}
                          >
                            Detalle de cursos (plan vs récord)
                          </Title>

                          {rows.length ? (
                            <Table<Row>
                              size="small"
                              rowKey={(_, i) => String(i)}
                              dataSource={rows}
                              pagination={false}
                              columns={[
                                {
                                  title: "Curso del plan",
                                  dataIndex: "curso_plan",
                                },
                                {
                                  title: "Curso del récord (match)",
                                  dataIndex: "curso_extraido_equivalente",
                                  render: (v) =>
                                    v ?? (
                                      <Text type="secondary">
                                        — sin match —
                                      </Text>
                                    ),
                                },
                                {
                                  title: "Convalidable",
                                  dataIndex: "convalidable",
                                  width: 130,
                                  render: (ok: boolean) =>
                                    ok ? (
                                      <Tag color="green">Sí</Tag>
                                    ) : (
                                      <Tag color="red">No</Tag>
                                    ),
                                },
                                {
                                  title: "Razón",
                                  dataIndex: "razon",
                                  render: (v: string) =>
                                    v?.trim() ? (
                                      v
                                    ) : (
                                      <Text type="secondary">—</Text>
                                    ),
                                },
                              ]}
                            />
                          ) : (
                            <Alert
                              type="info"
                              message="No se detectaron equivalencias o el detalle no está disponible."
                              showIcon
                            />
                          )}
                        </>
                      ),
                    },
                    {
                      key: "extraidos",
                      label: "Cursos extraídos",
                      children: (
                        <>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 12,
                              marginBottom: 8,
                            }}
                          >
                            <Title level={5} style={{ margin: 0 }}>
                              Cursos extraídos del récord
                            </Title>
                            <Input
                              allowClear
                              value={searchText}
                              onChange={(e) => setSearchText(e.target.value)}
                              placeholder="Buscar por curso o ciclo…"
                              prefix={<SearchOutlined />}
                              style={{ maxWidth: 320 }}
                            />
                          </div>

                          {filteredExtraidos?.length ? (
                            <Table<{
                              curso: string;
                              ciclo: string | null;
                              nota: number;
                            }>
                              size="small"
                              rowKey={(_, i) => String(i)}
                              dataSource={filteredExtraidos}
                              pagination={{
                                pageSize: 10,
                                showSizeChanger: false,
                              }}
                              columns={[
                                { title: "Curso", dataIndex: "curso" },
                                {
                                  title: "Ciclo",
                                  dataIndex: "ciclo",
                                  width: 180,
                                  render: (v) =>
                                    v ?? <Text type="secondary">—</Text>,
                                },
                                {
                                  title: "Nota",
                                  dataIndex: "nota",
                                  width: 100,
                                },
                              ]}
                            />
                          ) : (
                            <Alert
                              type="info"
                              message={
                                searchText
                                  ? "Sin resultados para el filtro."
                                  : "No hay cursos extraídos para mostrar."
                              }
                              showIcon
                            />
                          )}
                        </>
                      ),
                    },
                  ]}
                />
              </div>

              {/* ✅ Botón Descargar PDF */}
              <div className="flex justify-end mt-4">
                <Button type="primary" onClick={handleDownloadPDF}>
                  Descargar Excel
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </ConfigProvider>
  );
}
