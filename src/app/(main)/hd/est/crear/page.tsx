/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Form,
  Select,
  Input,
  Upload,
  Button,
  Divider,
  message,
  Typography,
  Tag,
  Tooltip,
  Alert,
  Modal,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  InboxOutlined,
  SafetyCertificateTwoTone,
  InfoCircleOutlined,
  FileProtectOutlined,
  SendOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { createTicketEstudiante } from "@/features/hd/service/ticket_ti";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// ====== Tipos / Mocks (cámbialos por tus servicios reales) ======
export type AreaOption = { id: number; nombre: string };

// import { getAreas } from "@/features/hd/service/area";
// import { createTicketEstudiante } from "@/features/hd/service/ticket";
async function getAreasMock(): Promise<AreaOption[]> {
  return [
    { id: 1, nombre: "Tecnologías de la Información (TI)" },
    { id: 2, nombre: "Oficina de Coordinación académica (COA)" },
    { id: 3, nombre: "Oficina de Servicios académicos (OSAR)" },
    { id: 4, nombre: "Mesa de partes" },
    { id: 6, nombre: "Defensoria Estudiante" },
    { id: 7, nombre: "'Admisión'," },
  ];
}

// ====== Constantes UI ======
const MAX_DESC = 800;
const MIN_DESC = 10;
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/plain",
];
const MAX_SIZE_MB = 10;
const MAX_FILES = 5;

// ====== Helpers ======
const isBlank = (v?: string) => !v || v.trim().length === 0;
const isValidDesc = (v?: string) =>
  !!v && v.trim().length >= MIN_DESC && v.trim().length <= MAX_DESC;

export default function TicketCreateStudentView() {
  const router = useRouter();

  const [form] = Form.useForm();
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const searchParams = useSearchParams();

  // Cargar áreas
  useEffect(() => {
    (async () => {
      try {
        const data = await getAreasMock(); // ← reemplazar por getAreas()
        setAreas(data || []);
      } catch {
        message.error("No se pudieron cargar las áreas.");
      }
    })();
  }, []);

  // Preselección de área por query ?area=ID
  useEffect(() => {
    if (!areas.length) return;
    const areaParam = searchParams.get("area");
    if (areaParam) {
      const id = Number(areaParam);
      const exists = areas.some((a) => a.id === id);
      if (exists) {
        form.setFieldsValue({ area_id: id });
      }
    }
  }, [areas, searchParams, form]);

  const areaOptions = useMemo(
    () => areas.map((a) => ({ label: a.nombre, value: a.id })),
    [areas]
  );

  const getSelectedAreaLabel = (id?: number) =>
    id ? areaOptions.find((o) => o.value === id)?.label : undefined;

  // Validaciones de adjuntos
  const beforeUpload = (file: File) => {
    const isAllowedType =
      ACCEPTED_TYPES.includes(file.type) ||
      /\.(pdf|png|jpe?g|docx?|xlsx?|txt)$/i.test(file.name);
    if (!isAllowedType) {
      message.error("Tipo de archivo no permitido.");
      return Upload.LIST_IGNORE;
    }
    const isLtSize = file.size / 1024 / 1024 <= MAX_SIZE_MB;
    if (!isLtSize) {
      message.error(`Cada archivo debe pesar ≤ ${MAX_SIZE_MB} MB.`);
      return Upload.LIST_IGNORE;
    }
    if (fileList.length >= MAX_FILES) {
      message.warning(`Máximo ${MAX_FILES} archivos.`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleChangeUpload = ({ fileList: list }: { fileList: UploadFile[] }) =>
    setFileList(list);

  const getRawFiles = (): File[] =>
    fileList.map((f) => f.originFileObj).filter(Boolean) as File[];

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!isValidDesc(values.descripcion)) {
        message.warning(
          `La descripción debe tener entre ${MIN_DESC} y ${MAX_DESC} caracteres.`
        );
        return;
      }

      const files = getRawFiles();
      setLoading(true);

      console.log("Ticket a crear:", {
        area_id: Number(values.area_id),
        descripcion: String(values.descripcion || "").trim(),
        files,
      });

      const fd = new FormData();
      fd.append("area_id", String(values.area_id));
      fd.append("descripcion", String(values.descripcion || "").trim());
      files.forEach((f) => fd.append("archivos", f));

      const res = await createTicketEstudiante(fd);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((res as any)?.codigo) {
        message.success(
          <>
            Ticket creado correctamente. Código:{" "}
            <Tag color="geekblue">{(res as any).codigo}</Tag>
          </>
        );

        form.resetFields();
        setFileList([]);
        setTouched(false);

        // 👇 redirigir luego de un pequeño delay opcional
        setTimeout(() => {
          router.push("/hd/est/mis-tickets");
        }, 1000);
      } else {
        message.error("No se pudo crear el ticket. Inténtalo nuevamente.");
      }
    } catch (err: any) {
      if (err?.errorFields) {
        message.warning("Revisa los campos obligatorios.");
      } else {
        message.error("Ocurrió un error al crear el ticket.");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedArea: number | undefined = Form.useWatch("area_id", form);
  const descValue: string = Form.useWatch("descripcion", form) || "";
  const descCount = descValue.length;

  // Habilita/deshabilita "Crear Ticket"
  const canSubmit = !!selectedArea && isValidDesc(descValue) && !loading;

  // Detectar cambios para confirmar limpieza
  useEffect(() => {
    setTouched(true);
  }, [selectedArea, descValue, fileList.length]);

  const handleClear = () => {
    if (!touched) {
      form.resetFields();
      setFileList([]);
      return;
    }
    Modal.confirm({
      title: "Limpiar formulario",
      content:
        "Se perderán los datos ingresados y los archivos adjuntos. ¿Deseas continuar?",
      okText: "Sí, limpiar",
      cancelText: "Cancelar",
      onOk: () => {
        form.resetFields();
        setFileList([]);
        setTouched(false);
      },
    });
  };

  // Enviar con Enter (si válido)
  // const onKeyDownForm: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
  //   if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
  //     if (canSubmit) onSubmit();
  //   }
  // };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-sky-50 via-white to-white">
      {/* HERO / ENCABEZADO */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 p-[1px] shadow-lg">
          <div className="rounded-2xl bg-white/80 backdrop-blur-md px-6 py-6 md:px-10">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Title level={3} className="m-0 !text-slate-900">
                  🎫 Crear Ticket — Estudiante
                </Title>
                <Text type="secondary">
                  Registra tu solicitud en pocos pasos. Nuestro equipo te
                  contactará por correo institucional.
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <Tag
                  color="blue"
                  className="text-sm"
                  aria-label="Mesa de Ayuda"
                >
                  Mesa de Ayuda
                </Tag>
                <Tag
                  color="purple"
                  className="text-sm"
                  aria-label="Atención Estudiante"
                >
                  Atención Estudiante
                </Tag>
                <Tooltip title="Tus datos están protegidos">
                  <SafetyCertificateTwoTone twoToneColor="#22c55e" />
                </Tooltip>
              </div>
            </div>
            <Alert
              className="mt-4"
              type="info"
              showIcon
              message={
                <span className="text-[13px]">
                  <InfoCircleOutlined /> Respuesta por correo UMA. Revisa tu
                  bandeja y spam.
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Columna principal */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <Form
                form={form}
                layout="vertical"
                requiredMark="optional"
                initialValues={{ area_id: undefined, descripcion: "" }}
              >
                {/* Área (label con justify-between funcionando) */}
                <Form.Item
                  label={
                    <span className="flex w-full items-center justify-between">
                      <span className="block" style={{ display: "block" }}>
                        Área
                      </span>
                      <Text type="secondary" className="text-xs ps-2">
                        (Selecciona el destino de tu solicitud)
                      </Text>
                    </span>
                  }
                  name="area_id"
                  rules={[{ required: true, message: "Selecciona un área" }]}
                >
                  <Select
                    placeholder="— Selecciona un área —"
                    options={areaOptions}
                    showSearch
                    optionFilterProp="label"
                    size="large"
                    autoFocus
                    disabled={loading}
                    aria-label="Seleccionar área"
                  />
                </Form.Item>

                {/* Descripción */}
                <Form.Item
                  label="Descripción"
                  name="descripcion"
                  rules={[
                    {
                      required: true,
                      message: "Describe tu incidencia o requerimiento",
                    },
                    {
                      validator: (_, v: string) =>
                        isBlank(v) || v.trim().length < MIN_DESC
                          ? Promise.reject(
                              new Error(
                                `Debe tener al menos ${MIN_DESC} caracteres`
                              )
                            )
                          : Promise.resolve(),
                    },
                    { max: MAX_DESC, message: `Máximo ${MAX_DESC} caracteres` },
                  ]}
                  extra={
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Sé claro y específico (ej. “no puedo acceder al aula
                        virtual”).
                      </span>
                      <span
                        className={`${
                          descCount > MAX_DESC * 0.9
                            ? "text-rose-500"
                            : "text-slate-400"
                        }`}
                      >
                        {descCount}/{MAX_DESC}
                      </span>
                    </div>
                  }
                >
                  <TextArea
                    rows={6}
                    placeholder="Describe el problema con detalle. Si aplica, indica curso, sección, código de matrícula, navegador, etc."
                    disabled={loading}
                    aria-label="Descripción del problema"
                  />
                </Form.Item>

                {/* Adjuntos (texto auxiliar movido a extra) */}
                <Form.Item
                  label="Adjuntos"
                  extra={
                    <Text type="secondary" className="text-xs">
                      Opcional — {MAX_FILES} máx., {MAX_SIZE_MB} MB c/u
                    </Text>
                  }
                >
                  <Dragger
                    multiple
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    onChange={handleChangeUpload}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.txt"
                    itemRender={(origin) => origin}
                    disabled={loading}
                    aria-label="Cargar adjuntos"
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Arrastra y suelta archivos aquí
                    </p>
                    <p className="ant-upload-hint">
                      PDF, imágenes, Word, Excel, TXT. Prioriza capturas que
                      ayuden a entender el problema.
                    </p>
                    <p className="m-0 text-xs text-slate-500">
                      {fileList.length}/{MAX_FILES} archivos seleccionados
                    </p>
                  </Dragger>
                </Form.Item>

                <Divider />

                {/* Barra de acción sticky */}
                <div className="sticky bottom-2 z-10">
                  <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <FileProtectOutlined className="text-slate-400" />
                        <Text type="secondary" className="text-xs">
                          Verifica que tus datos sean correctos antes de enviar.
                        </Text>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          icon={<ReloadOutlined />}
                          onClick={handleClear}
                          disabled={loading}
                          aria-label="Limpiar formulario"
                        >
                          Limpiar
                        </Button>
                        <Button
                          type="primary"
                          size="large"
                          icon={<SendOutlined />}
                          onClick={onSubmit}
                          loading={loading}
                          disabled={!canSubmit}
                          aria-label="Crear ticket"
                        >
                          Crear Ticket
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Form>
            </Card>

            {/* PREVIEW compacto */}
            <Card
              className="rounded-2xl border-slate-200 shadow-sm"
              title="Vista previa"
            >
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Text className="w-28 text-slate-500">Área:</Text>
                  <Text strong>
                    {getSelectedAreaLabel(selectedArea) || "—"}
                  </Text>
                </div>
                <div className="flex items-start gap-2">
                  <Text className="w-28 text-slate-500">Descripción:</Text>
                  <Paragraph className="m-0 whitespace-pre-wrap">
                    {descValue || "—"}
                  </Paragraph>
                </div>
                <div className="flex items-start gap-2">
                  <Text className="w-28 text-slate-500">Adjuntos:</Text>
                  <Text>
                    {fileList.length ? `${fileList.length} archivo(s)` : "—"}
                  </Text>
                </div>
              </div>
            </Card>
          </div>

          {/* Columna lateral (tips / ayuda) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <Title level={5} className="m-0">
                Consejos para un ticket efectivo
              </Title>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>Indica el contexto: curso, plataforma, sección, etc.</li>
                <li>
                  Señala el <strong>error exacto</strong> que observas (copia el
                  mensaje si es posible).
                </li>
                <li>Adjunta capturas de pantalla con fecha/hora visibles.</li>
                <li>
                  Evita datos sensibles (contraseñas, números de tarjetas).
                </li>
              </ul>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <Title level={5} className="m-0">
                Estado y seguimiento
              </Title>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>
                  Recibirás notificaciones al correo institucional UMA con cada
                  actualización.
                </p>
                <p>
                  Puedes consultar el avance de tus tickets desde{" "}
                  <Tag color="blue">Mis Tickets</Tag>.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
