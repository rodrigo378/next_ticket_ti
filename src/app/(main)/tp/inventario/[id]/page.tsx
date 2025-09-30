// app/inventario/[id]/page.tsx
"use client";

import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Tag,
  Typography,
  Space,
  Button,
  Row,
  Col,
  Divider,
  Descriptions,
  message,
  Tooltip,
  Breadcrumb,
  Statistic,
  Badge,
  Alert,
  Segmented,
  Affix,
  theme,
  Skeleton,
  Modal,
  Table,
  DatePicker,
  Select,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  SaveOutlined,
  RollbackOutlined,
  InboxOutlined,
  BarcodeOutlined,
  InfoCircleOutlined,
  AppstoreOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import dayjs, { Dayjs } from "dayjs";

// Servicios
import {
  createLote,
  getInventario,
  getLotesByInventario,
  updateInventario,
  updateLote,
} from "@services/tp/inventario";
import { TP_Inventario, TP_InventarioLote, TP_Ubicacion } from "@interfaces/tp";
import { getUbicaciones, createUbicacion } from "@services/tp/ubicacion";

type FormValues = {
  nombre: string;
  unidadBase?: string;
  stockMinimo?: number;
  ubicacion?: string;
  esPerecible?: boolean;
  activo?: boolean;
  notas?: string;
};

// Form de Lote: tipado explícito para asegurar ubicacion_id number|null
type LoteFormValues = {
  codigoLote: string;
  fechaVencimiento?: Dayjs;
  cantidad?: number;
  estado?: boolean; // true => ACTIVO
  ubicacion_id?: number | null;
};

// ──────────────────────────────────────────────────────────────────────────────
// Modal local: Crear Ubicación
// ──────────────────────────────────────────────────────────────────────────────
function NuevaUbicacionModal({
  open,
  onCancel,
  onCreated,
}: {
  open: boolean;
  onCancel: () => void;
  onCreated: (u: TP_Ubicacion) => void;
}) {
  const [formUbic] = Form.useForm<{
    nombre: string;
    descripcion?: string;
    direccion?: string;
    tipo?: string;
  }>();
  const [saving, setSaving] = useState(false);

  const handleOk = async () => {
    try {
      const values = await formUbic.validateFields();
      setSaving(true);
      const payload: Partial<TP_Ubicacion> = {
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || undefined,
        direccion: values.direccion?.trim() || undefined,
        tipo: values.tipo?.trim() || undefined,
      };
      const created = await createUbicacion(payload);
      message.success("Ubicación creada.");
      onCreated(created);
      formUbic.resetFields();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error("No se pudo crear la ubicación.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Nueva ubicación"
      okText="Guardar"
      cancelText="Cancelar"
      onCancel={() => !saving && onCancel()}
      onOk={handleOk}
      confirmLoading={saving}
    >
      <Form form={formUbic} layout="vertical" preserve={false}>
        <Form.Item
          label="Nombre"
          name="nombre"
          rules={[
            { required: true, message: "Ingrese el nombre" },
            { max: 100, message: "Máximo 100 caracteres" },
          ]}
        >
          <Input placeholder="Ej: Almacén Central / Estante A-3" />
        </Form.Item>
        <Form.Item
          label="Descripción"
          name="descripcion"
          rules={[{ max: 200, message: "Máximo 200 caracteres" }]}
        >
          <Input placeholder="Referencia breve" />
        </Form.Item>
        <Form.Item
          label="Dirección"
          name="direccion"
          rules={[{ max: 200, message: "Máximo 200 caracteres" }]}
        >
          <Input placeholder="(Opcional) Ubicación física" />
        </Form.Item>
        <Form.Item
          label="Tipo"
          name="tipo"
          rules={[{ max: 50, message: "Máximo 50 caracteres" }]}
        >
          <Input placeholder="Ej: almacén, anaquel, aula" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

export default function InventarioDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const [editingLote, setEditingLote] = useState<TP_InventarioLote | null>(
    null
  );
  const [form] = Form.useForm<FormValues>();
  const [mode, setMode] = useState<"ver" | "editar">("ver");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TP_Inventario | null>(null);

  // Lotes
  const [loteModalOpen, setLoteModalOpen] = useState(false);
  const [lotes, setLotes] = useState<TP_InventarioLote[]>([]);
  const [loadingLotes, setLoadingLotes] = useState(false);
  const [creatingLote, setCreatingLote] = useState(false);
  const [loteForm] = Form.useForm<LoteFormValues>();

  // Ubicaciones (para lotes)
  const [ubicLoading, setUbicLoading] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<TP_Ubicacion[]>([]);
  const [ubicModalOpen, setUbicModalOpen] = useState(false);

  const topRef = useRef<HTMLDivElement | null>(null);
  const { token } = theme.useToken();

  const underMin = useMemo(() => {
    if (!data) return false;
    return data.stockMinimo != null && data.stockGlobal < data.stockMinimo;
  }, [data]);

  // Cargar detalle
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!Number.isFinite(id)) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getInventario(id);
        if (!mounted) return;
        setData(res);
        form.setFieldsValue({
          nombre: res.nombre,
          unidadBase: res.unidadBase ?? undefined,
          stockMinimo: res.stockMinimo ?? undefined,
          ubicacion: res.ubicacion ?? undefined,
          esPerecible: res.esPerecible,
          activo: res.activo,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          notas: (res as any).notas ?? undefined,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.log("e =>", e);

        if (!mounted) return;
        message.error("No se pudo cargar el inventario.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id, form]);

  // Cargar ubicaciones (para Lotes)
  useEffect(() => {
    const loadUbic = async () => {
      try {
        setUbicLoading(true);
        const res = await getUbicaciones();
        setUbicaciones(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error("getUbicaciones error =>", e);
        setUbicaciones([]);
        message.warning("No se pudieron cargar las ubicaciones.");
      } finally {
        setUbicLoading(false);
      }
    };
    loadUbic();
  }, []);

  const ubicacionMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const u of ubicaciones) m.set(Number(u.id), u.nombre);
    return m;
  }, [ubicaciones]);

  // Guardar inventario
  const handleSave = async () => {
    if (!data) return;
    try {
      setSaving(true);
      const values = await form.validateFields();
      const payload: Partial<TP_Inventario> = {
        nombre: values.nombre?.trim(),
        unidadBase: values.unidadBase ?? null,
        stockMinimo:
          typeof values.stockMinimo === "number" ? values.stockMinimo : null,
        ubicacion: values.ubicacion ?? null, // a nivel inventario (no perecibles)
        esPerecible: !!values.esPerecible,
        activo: values.activo !== false,
      };
      const updated = await updateInventario(data.id, payload);
      setData(updated);
      message.success("Inventario actualizado.");
      setMode("ver");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error("No se pudo actualizar el inventario.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!data) return;
    form.resetFields();
    setMode("ver");
  };

  // Lotes
  const openLoteModal = async () => {
    if (!data) return;
    setLoteModalOpen(true);
    await loadLotes();
  };

  const loadLotes = async () => {
    if (!data) return;
    try {
      setLoadingLotes(true);
      const res = await getLotesByInventario(data.id);
      setLotes(res || []);
    } catch {
      message.error("No se pudieron cargar los lotes.");
      setLotes([]);
    } finally {
      setLoadingLotes(false);
    }
  };

  const handleSubmitLote = async (values: LoteFormValues) => {
    if (!data) return;

    const payload = {
      inventario_id: data.id,
      codigoLote: values.codigoLote?.trim(),
      fechaVencimiento: values.fechaVencimiento
        ? values.fechaVencimiento.toDate()
        : null,
      cantidad: typeof values.cantidad === "number" ? values.cantidad : 0,
      estado: values.estado ? "ACTIVO" : "INACTIVO",
      // IMPORTANT: antd Select ya devuelve number porque options usan Number(u.id)
      // si viene undefined => lo mandamos como null
      ubicacion_id:
        typeof values.ubicacion_id === "number" ? values.ubicacion_id : null,
    };

    console.debug("Lote payload =>", payload); // quítalo en prod

    try {
      setCreatingLote(true);
      if (editingLote) {
        await updateLote(editingLote.id, payload);
        message.success("Lote actualizado.");
      } else {
        await createLote(payload);
        message.success("Lote creado.");
      }
      loteForm.resetFields();
      setEditingLote(null);
      await loadLotes();
    } catch {
      message.error(
        editingLote
          ? "No se pudo actualizar el lote."
          : "No se pudo crear el lote."
      );
    } finally {
      setCreatingLote(false);
    }
  };

  // Columnas con nombre de ubicación (no ID)
  const loteColumns: ColumnsType<TP_InventarioLote> = [
    {
      title: "Código lote",
      dataIndex: "codigoLote",
      key: "codigoLote",
      ellipsis: true,
    },
    {
      title: "Vence",
      dataIndex: "fechaVencimiento",
      key: "fechaVencimiento",
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "—"),
      sorter: (a, b) =>
        dayjs(a.fechaVencimiento || "1900-01-01").unix() -
        dayjs(b.fechaVencimiento || "1900-01-01").unix(),
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      sorter: (a, b) => a.cantidad - b.cantidad,
    },
    {
      title: "Ubicación",
      dataIndex: "ubicacion_id",
      key: "ubicacion",
      render: (v: number | null | undefined) => {
        if (v == null)
          return (
            <Typography.Text type="secondary">Sin ubicación</Typography.Text>
          );
        const nombre = ubicacionMap.get(Number(v));
        return nombre ? (
          <Typography.Text>{nombre}</Typography.Text>
        ) : (
          <Typography.Text type="secondary">ID {v}</Typography.Text>
        );
      },
      sorter: (a, b) =>
        (a.ubicacion_id ?? Number.MAX_SAFE_INTEGER) -
        (b.ubicacion_id ?? Number.MAX_SAFE_INTEGER),
      filters: [
        { text: "Con ubicación", value: "con" },
        { text: "Sin ubicación", value: "sin" },
      ],
      onFilter: (val, row) =>
        val === "con" ? row.ubicacion_id != null : row.ubicacion_id == null,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (v) =>
        v === "ACTIVO" ? <Tag color="blue">Activo</Tag> : <Tag>Inactivo</Tag>,
      filters: [
        { text: "Activos", value: "ACTIVO" },
        { text: "Inactivos", value: "INACTIVO" },
      ],
      onFilter: (val, row) => row.estado === val,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, r) => (
        <Space size={4} wrap>
          <Button
            size="small"
            onClick={() => {
              setEditingLote(r);
              loteForm.setFieldsValue({
                codigoLote: r.codigoLote,
                fechaVencimiento: r.fechaVencimiento
                  ? dayjs(r.fechaVencimiento)
                  : undefined,
                cantidad: r.cantidad,
                ubicacion_id:
                  r.ubicacion_id != null ? Number(r.ubicacion_id) : undefined,
                estado: r.estado === "ACTIVO",
              });
            }}
          >
            Editar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div ref={topRef}>
      <Affix offsetTop={0}>
        <div
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: "12px 16px",
          }}
        >
          <Row align="middle" justify="space-between" gutter={12}>
            <Col flex="auto">
              <Breadcrumb
                items={[
                  { title: "TP" },
                  { title: <a href="/tp/inventario">Inventario</a> },
                  { title: data ? `#${data.id}` : "..." },
                ]}
              />
              <Space size={8} style={{ marginTop: 6 }}>
                <InboxOutlined />
                <Typography.Title
                  level={4}
                  style={{ margin: 0, display: "inline-block" }}
                >
                  {data?.nombre ?? <Skeleton.Input active size="small" />}
                </Typography.Title>
                {data &&
                  (data.activo ? (
                    <Tag color="blue">Activo</Tag>
                  ) : (
                    <Tag>Inactivo</Tag>
                  ))}
                {data?.esPerecible ? <Tag color="red">Perecible</Tag> : null}
              </Space>
            </Col>

            <Col>
              <Space>
                <Segmented
                  value={mode}
                  onChange={(v) => setMode(v as "ver" | "editar")}
                  options={[
                    { label: "Ver", value: "ver" },
                    {
                      label: "Editar",
                      value: "editar",
                      icon: <EditOutlined />,
                    },
                  ]}
                  disabled={loading || !data}
                />

                {mode === "editar" ? (
                  <>
                    <Button
                      icon={<RollbackOutlined />}
                      onClick={handleCancel}
                      disabled={saving || loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={saving}
                      disabled={loading}
                    >
                      Guardar
                    </Button>
                  </>
                ) : (
                  data?.esPerecible && (
                    <Button
                      icon={<AppstoreOutlined />}
                      onClick={openLoteModal}
                      disabled={loading || !data}
                    >
                      Lotes
                    </Button>
                  )
                )}
              </Space>
            </Col>
          </Row>
        </div>
      </Affix>

      <div style={{ padding: 16 }}>
        <Row gutter={[16, 16]}>
          {/* Izquierda */}
          <Col xs={24} lg={10} xxl={8}>
            <Badge.Ribbon
              text={data ? `Código ${data.codigo}` : "Cargando..."}
              color="geekblue"
            >
              <Card
                size="small"
                className="shadow-sm"
                style={{ marginBottom: 16 }}
              >
                {loading || !data ? (
                  <Skeleton active paragraph={{ rows: 6 }} />
                ) : (
                  <>
                    <Row gutter={[12, 12]}>
                      <Col span={12}>
                        <Statistic
                          title="Stock global"
                          value={data.stockGlobal}
                          valueStyle={{
                            color: underMin
                              ? token.colorError
                              : token.colorSuccess,
                          }}
                        />
                        <Typography.Text type="secondary">
                          mínimo {data.stockMinimo ?? 0}
                        </Typography.Text>
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Estado"
                          valueRender={() =>
                            data.activo ? (
                              <Tag color="blue" style={{ marginTop: 6 }}>
                                Activo
                              </Tag>
                            ) : (
                              <Tag style={{ marginTop: 6 }}>Inactivo</Tag>
                            )
                          }
                        />
                      </Col>
                    </Row>

                    <Divider style={{ margin: "12px 0" }} />

                    <Descriptions size="small" column={1} colon>
                      <Descriptions.Item label="Código de barras">
                        <Space>
                          <BarcodeOutlined />
                          <Typography.Text type="secondary">
                            {data.codigoBarras ?? "—"}
                          </Typography.Text>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Unidad base">
                        {data.unidadBase ?? "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ubicación">
                        {data.ubicacion ?? "—"}
                      </Descriptions.Item>
                    </Descriptions>

                    {underMin && (
                      <Alert
                        type="warning"
                        showIcon
                        style={{ marginTop: 12 }}
                        message="Stock bajo el mínimo"
                        description="Considere realizar reposición para evitar quiebres."
                      />
                    )}
                  </>
                )}
              </Card>
            </Badge.Ribbon>

            <Card size="small" title="Notas" className="shadow-sm">
              {loading || !data ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : (
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                  {/* notas opcionales */}
                </Typography.Paragraph>
              )}
            </Card>
          </Col>

          {/* Derecha */}
          <Col xs={24} lg={14} xxl={16}>
            <Card
              className="shadow-sm"
              title="Editar inventario"
              extra={
                <Tag color={mode === "editar" ? "gold" : "default"}>
                  {mode === "editar" ? "Modo edición" : "Solo lectura"}
                </Tag>
              }
            >
              <Form<FormValues>
                form={form}
                layout="vertical"
                disabled={mode !== "editar" || loading || !data}
                initialValues={{ activo: true, esPerecible: false }}
              >
                <Row gutter={[16, 12]}>
                  <Col xs={24}>
                    <Form.Item
                      label="Nombre"
                      name="nombre"
                      tooltip="Nombre comercial o descriptivo"
                      rules={[{ required: true, message: "Ingrese el nombre" }]}
                    >
                      <Input
                        placeholder="Ej: Algodón hidrófilo 500g"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 12]}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Unidad base"
                      name="unidadBase"
                      tooltip="Unidad de control principal"
                    >
                      <Input
                        placeholder="Ej: unidad, caja, frasco, kg"
                        allowClear
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      label={
                        <Space size={6}>
                          <span>Stock mínimo</span>
                          <Tooltip title="Umbral para alertas de reposición">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
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
                      <InputNumber
                        placeholder="0"
                        min={0}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
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
                </Row>

                <Row gutter={[16, 12]}>
                  <Col xs={12} md={6}>
                    <Form.Item
                      label="Perecible"
                      name="esPerecible"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Item
                      label="Activo"
                      name="activo"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 12]}>
                  <Col span={24}>
                    <Form.Item label="Notas" name="notas">
                      <Input.TextArea
                        rows={4}
                        placeholder="Observaciones internas, recomendaciones de conservación, etc."
                        autoSize={{ minRows: 3, maxRows: 6 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>

              {mode === "editar" && !loteModalOpen && (
                <>
                  <Divider style={{ margin: 0 }} />
                  <Space
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      paddingTop: 12,
                    }}
                  >
                    <Button
                      icon={<RollbackOutlined />}
                      onClick={handleCancel}
                      disabled={saving || loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={saving}
                      disabled={loading || !data}
                    >
                      Guardar cambios
                    </Button>
                  </Space>
                </>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* MODAL LOTES */}
      <Modal
        zIndex={2000}
        title={
          <Space>
            <AppstoreOutlined />
            <span>Lotes — {data?.nombre ?? "…"}</span>
          </Space>
        }
        open={loteModalOpen}
        onCancel={() => {
          setLoteModalOpen(false);
          setEditingLote(null);
          loteForm.resetFields();
        }}
        width={900}
        footer={null}
      >
        <Card
          size="small"
          title="Lotes registrados"
          extra={
            <Button type="default" onClick={loadLotes} disabled={loadingLotes}>
              Recargar
            </Button>
          }
          style={{ marginBottom: 12 }}
        >
          <Table<TP_InventarioLote>
            rowKey="id"
            columns={loteColumns}
            dataSource={lotes}
            loading={loadingLotes || ubicLoading}
            size="middle"
            tableLayout="fixed"
            scroll={{ x: "max-content" }}
            pagination={{ pageSize: 8, showTotal: (t) => `${t} lotes` }}
          />
        </Card>

        <Card
          size="small"
          title={
            <Space>
              <PlusOutlined />
              <span>{editingLote ? "Editar lote" : "Crear nuevo lote"}</span>
            </Space>
          }
        >
          <Form<LoteFormValues>
            layout="vertical"
            form={loteForm}
            onFinish={handleSubmitLote}
            initialValues={{ estado: true, cantidad: 0 }}
          >
            <Row gutter={[12, 12]}>
              <Col xs={24} md={10}>
                <Form.Item
                  label="Código de lote"
                  name="codigoLote"
                  rules={[
                    { required: true, message: "Ingrese el código de lote" },
                  ]}
                  tooltip="Único por inventario"
                >
                  <Input placeholder="Ej: LOTE-2025-01-A" allowClear />
                </Form.Item>
              </Col>

              <Col xs={24} md={7}>
                <Form.Item label="Fecha de vencimiento" name="fechaVencimiento">
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>
              </Col>

              <Col xs={24} md={7}>
                <Form.Item
                  label="Cantidad"
                  name="cantidad"
                  rules={[
                    {
                      type: "number",
                      min: 0,
                      message: "No puede ser negativa",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[12, 12]}>
              <Col xs={24} md={10}>
                <Form.Item
                  label="Ubicación (opcional)"
                  name="ubicacion_id"
                  tooltip="Catálogo TP_Ubicacion"
                >
                  <Select
                    allowClear
                    placeholder="Seleccione una ubicación"
                    loading={ubicLoading}
                    options={ubicaciones.map((u) => ({
                      label: u.nombre,
                      value: Number(u.id), // asegura number
                    }))}
                    showSearch
                    optionFilterProp="label"
                    dropdownRender={(menu) => (
                      <div>
                        {menu}
                        <Divider style={{ margin: "8px 0" }} />
                        <div style={{ padding: "0 8px 8px" }}>
                          <Button
                            block
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => setUbicModalOpen(true)}
                          >
                            Nueva ubicación
                          </Button>
                        </div>
                      </div>
                    )}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={7}>
                <Form.Item label="Activo" name="estado" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>

              <Col
                xs={24}
                md={7}
                style={{ display: "flex", alignItems: "end" }}
              >
                <Space style={{ marginTop: 4 }}>
                  {editingLote && (
                    <Button
                      onClick={() => {
                        setEditingLote(null);
                        loteForm.resetFields();
                      }}
                    >
                      Cancelar edición
                    </Button>
                  )}
                  <Button onClick={() => loteForm.resetFields()}>
                    Limpiar
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={creatingLote}
                  >
                    {editingLote ? "Guardar cambios" : "Crear lote"}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </Card>
      </Modal>

      {/* Modal crear ubicación (para lotes) */}
      <NuevaUbicacionModal
        open={ubicModalOpen}
        onCancel={() => setUbicModalOpen(false)}
        onCreated={(created) => {
          // agregar ordenado y preseleccionar
          setUbicaciones((prev) =>
            [...prev, created].sort((a, b) =>
              a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
            )
          );
          loteForm.setFieldsValue({ ubicacion_id: Number(created.id) });
          setUbicModalOpen(false);
        }}
      />
    </div>
  );
}
