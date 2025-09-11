"use client";

import {
  Table,
  Typography,
  Button,
  Tag,
  Input,
  message,
  Select,
  InputNumber,
  Drawer,
  Form,
  theme,
  Space,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { createCatalogo, getCatalogo } from "@/features/hd/service/catalogo";
import {
  createCategoria,
  createIncidencia,
  updateCategoria,
} from "@/features/hd/service/incidencias";
import { updateSla } from "@/features/hd/service/sla";
import { HD_CatalogoServicio } from "@/interface/hd/hd_catalogoServicio";
import { HD_Area } from "@/interface/hd/hd_area";
import { HD_Subarea } from "@/interface/hd/hd_subarea";
import { getAreas, getSubareas } from "@/features/hd/service/area";
import { HD_Incidencia } from "@/interface/hd/hd_incidencia";

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function Page() {
  const { token } = theme.useToken();

  const [catalogoIdActual, setCatalogoIdActual] = useState<number | null>(null);
  const [catalogos, setCatalogos] = useState<HD_CatalogoServicio[]>([]);
  const [areas, setAreas] = useState<HD_Area[]>([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState<number | null>(null);
  const [filtro, setFiltro] = useState("");
  const [subareasPorCatalogo, setSubareasPorCatalogo] = useState<
    Record<number, HD_Subarea[]>
  >({});

  const [formCatalogo] = Form.useForm();
  const [formIncidencia] = Form.useForm();
  const [formCategoria] = Form.useForm();

  // Drawers
  const [openCatalogo, setOpenCatalogo] = useState(false);
  const [openIncidencia, setOpenIncidencia] = useState(false);
  const [openCatagoria, setOpenCatagoria] = useState(false);

  // --- Handlers de creación/edición
  const handleSubmitCatalogo = () => {
    formCatalogo.validateFields().then(async (values) => {
      try {
        await createCatalogo(values);
        await fetchCatalogos();
        message.success("Catálogo creado");
      } catch (error) {
        console.log("error => ", error);
        message.error("No se pudo crear el catálogo");
      }
      formCatalogo.resetFields();
      setOpenCatalogo(false);
    });
  };

  const handleSubmitIncidencia = () => {
    formIncidencia.validateFields().then(async (values) => {
      try {
        await createIncidencia(values);
        await fetchCatalogos();
        message.success("Incidencia creada");
      } catch (error) {
        console.log("error => ", error);
        message.error("No se pudo crear la incidencia");
      }
      formIncidencia.resetFields();
      setOpenIncidencia(false);
    });
  };

  const handleSubmitCategoria = () => {
    formCategoria.validateFields().then(async (values) => {
      try {
        await createCategoria(values);
        await fetchCatalogos();
        message.success("Categoría creada");
      } catch (error) {
        console.log("error => ", error);
        message.error("No se pudo crear la categoría");
      }
      formCategoria.resetFields();
      setOpenCatagoria(false);
    });
  };

  // Open/Close
  const onOpenCatalogo = () => setOpenCatalogo(true);
  const onCloseCatalogo = () => setOpenCatalogo(false);

  const onOpenIncidencia = (catalogo_id: number) => {
    formIncidencia.setFieldValue("catalogo_id", catalogo_id);
    setOpenIncidencia(true);
  };
  const onCloseIncidencia = () => setOpenIncidencia(false);

  const onOpenCategoria = async (
    incidencia_id: number,
    catalogo_id: number
  ) => {
    formCategoria.setFieldValue("incidencia_id", incidencia_id);
    setCatalogoIdActual(catalogo_id);

    if (!subareasPorCatalogo[catalogo_id]) {
      const subareas = await getSubareas(catalogo_id);
      setSubareasPorCatalogo((prev) => ({ ...prev, [catalogo_id]: subareas }));
    }
    setOpenCatagoria(true);
  };
  const onCloseCategoria = () => setOpenCatagoria(false);

  // Data
  const fetchAreas = async () => setAreas(await getAreas());
  const fetchCatalogos = async () => setCatalogos(await getCatalogo());

  const cargarSubareasSiNoExisten = async (
    catalogoId: number,
    areaId: number
  ) => {
    if (!subareasPorCatalogo[catalogoId]) {
      const subareas = await getSubareas(areaId);
      setSubareasPorCatalogo((prev) => ({ ...prev, [catalogoId]: subareas }));
    }
  };

  useEffect(() => {
    fetchAreas();
    fetchCatalogos();
  }, []);

  const handleAreaChange = (areaId: number) => setAreaSeleccionada(areaId);

  const handleSubareaChange = async (
    categoriaId: number,
    subareaId: number
  ) => {
    try {
      await updateCategoria(categoriaId, { subarea_id: subareaId });
      message.success("Subárea actualizada");
      fetchCatalogos();
    } catch {
      message.error("No se pudo actualizar la subárea");
    }
  };

  const handleSLAUpdate = async (
    slaId: number,
    field: "tiempo_respuesta" | "tiempo_resolucion",
    value: number
  ) => {
    try {
      await updateSla(slaId, { [field]: value });
      message.success("SLA actualizado");
      fetchCatalogos();
    } catch {
      message.error("No se pudo actualizar el SLA");
    }
  };

  // Filtrado local
  const dataFiltrada = useMemo(
    () =>
      catalogos.filter((cat) => {
        const matchTexto = cat.nombre
          .toLowerCase()
          .includes(filtro.toLowerCase());
        const matchArea = areaSeleccionada
          ? cat.area_id === areaSeleccionada
          : true;
        return matchTexto && matchArea;
      }),
    [catalogos, filtro, areaSeleccionada]
  );

  // Columnas principales
  const columnasCatalogo = [
    { title: "Catálogo", dataIndex: "nombre", key: "nombre" },
    {
      title: "Área",
      dataIndex: ["area", "nombre"],
      key: "area",
      render: (nombre: string) => (
        <Tag
          style={{
            color: token.colorText,
            background: token.colorFillQuaternary,
            borderColor: token.colorBorderSecondary,
          }}
        >
          {nombre}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "accion",
      render: (catalogo: HD_CatalogoServicio) => (
        <Button
          // Secundario para no competir con el CTA superior
          type="default"
          style={{ borderColor: token.colorPrimary, color: token.colorPrimary }}
          onClick={() => onOpenIncidencia(catalogo.id)}
        >
          Agregar Incidencia
        </Button>
      ),
    },
  ];

  return (
    <div
      className="mx-auto max-w-7xl p-6 rounded-xl"
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadowSecondary,
      }}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Catálogo de Incidencias y Categorías
          </Title>
          <Paragraph style={{ margin: 0, color: token.colorTextSecondary }}>
            Gestión unificada de los tres niveles
          </Paragraph>
        </div>
        <Space.Compact block style={{ maxWidth: 520 }}>
          <Input
            size="middle" // 👈 armoniza tamaños
            placeholder="Buscar catálogo…"
            prefix={<SearchOutlined />}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            allowClear
          />
          <Button
            size="middle" // 👈 armoniza tamaños
            type="primary"
            icon={<PlusOutlined />}
            onClick={onOpenCatalogo}
          >
            Nuevo Catálogo
          </Button>
        </Space.Compact>
      </div>

      {/* Filtros */}
      <div className="mb-3">
        <Select
          size="large"
          placeholder="Filtrar por Área"
          style={{ width: 280 }}
          allowClear
          onChange={handleAreaChange}
        >
          {areas.map((area) => (
            <Option key={area.id} value={area.id}>
              {area.nombre}
            </Option>
          ))}
        </Select>
      </div>

      {/* Tabla principal */}
      <Table
        rowKey="id"
        size="middle"
        bordered={false}
        columns={columnasCatalogo}
        dataSource={dataFiltrada}
        sticky
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: true }}
        className="tabla-catalogo"
        expandable={{
          expandRowByClick: true,
          expandedRowRender: (catalogo: HD_CatalogoServicio) => {
            // Pre-cargar subáreas del catálogo
            cargarSubareasSiNoExisten(catalogo.id, catalogo.area_id);
            const subareas = subareasPorCatalogo[catalogo.id] || [];

            // Subtabla: incidencias
            return (
              <div
                style={{
                  background: token.colorFillTertiary,
                  border: `1px dashed ${token.colorBorderSecondary}`,
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Table
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: "Incidencia", dataIndex: "nombre" },
                    {
                      title: "Tipo",
                      dataIndex: "tipo",
                      render: (t) => (
                        <Tag
                          color={
                            t === "requerimiento"
                              ? token.colorInfo
                              : token.colorWarning
                          }
                        >
                          {t}
                        </Tag>
                      ),
                    },
                    { title: "Descripción", dataIndex: "descripcion" },
                    {
                      title: "Acciones",
                      key: "accion",
                      render: (incidencia: HD_Incidencia) => (
                        <Button
                          type="default"
                          style={{
                            borderColor: token.colorPrimary,
                            color: token.colorPrimary,
                          }}
                          onClick={() =>
                            onOpenCategoria(
                              incidencia.id,
                              incidencia.catalogo_servicio_id
                            )
                          }
                        >
                          Agregar categoría
                        </Button>
                      ),
                    },
                  ]}
                  dataSource={catalogo.incidencias || []}
                  expandable={{
                    expandRowByClick: true,
                    expandedRowRender: (inc: HD_Incidencia) => (
                      <div
                        className="space-y-3"
                        style={{
                          background: token.colorBgContainer,
                          border: `1px solid ${token.colorBorderSecondary}`,
                          borderRadius: 8,
                          padding: 12,
                        }}
                      >
                        {(inc.categoria || []).map((cat) => (
                          <div
                            key={cat.id}
                            style={{
                              border: `1px solid ${token.colorBorderSecondary}`,
                              borderRadius: 8,
                              padding: 12,
                              background: token.colorFillQuaternary,
                            }}
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <strong>📂 {cat.nombre}</strong>
                              <Select
                                defaultValue={cat.subarea?.id}
                                style={{ width: 260 }}
                                onChange={(subId) =>
                                  handleSubareaChange(cat.id, subId)
                                }
                                placeholder="Selecciona subárea"
                              >
                                {subareas.map((sub) => (
                                  <Option key={sub.id} value={sub.id}>
                                    {sub.nombre}
                                  </Option>
                                ))}
                              </Select>
                            </div>

                            <div className="mt-3 overflow-x-auto">
                              <table className="table-auto w-full text-sm">
                                <thead>
                                  <tr
                                    style={{
                                      borderBottom: `1px solid ${token.colorBorder}`,
                                    }}
                                  >
                                    <th className="py-2 text-left">
                                      Prioridad
                                    </th>
                                    <th className="py-2 text-left">
                                      Respuesta (min)
                                    </th>
                                    <th className="py-2 text-left">
                                      Resolución (min)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(cat.sla || []).map((sla) => (
                                    <tr
                                      key={sla.id}
                                      style={{
                                        borderTop: `1px solid ${token.colorBorderSecondary}`,
                                      }}
                                    >
                                      <td className="py-2">
                                        {sla.prioridad?.nombre}
                                      </td>
                                      <td className="py-2">
                                        <InputNumber
                                          min={1}
                                          defaultValue={sla.tiempo_respuesta}
                                          onBlur={(e) =>
                                            handleSLAUpdate(
                                              sla.id,
                                              "tiempo_respuesta",
                                              Number(e.target.value)
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="py-2">
                                        <InputNumber
                                          min={1}
                                          defaultValue={sla.tiempo_resolucion}
                                          onBlur={(e) =>
                                            handleSLAUpdate(
                                              sla.id,
                                              "tiempo_resolucion",
                                              Number(e.target.value)
                                            )
                                          }
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                  }}
                />
              </div>
            );
          },
        }}
      />

      {/* Drawer: Catálogo */}
      <Drawer
        title="Crear Catálogo de servicio"
        placement="right"
        width={500}
        open={openCatalogo}
        onClose={() => {
          formCatalogo.resetFields();
          onCloseCatalogo();
        }}
        extra={
          <Button type="primary" onClick={handleSubmitCatalogo}>
            Guardar
          </Button>
        }
      >
        <Form layout="vertical" form={formCatalogo}>
          <Form.Item
            name="nombre"
            label="Nombre del catálogo"
            rules={[{ required: true, message: "Ingrese un nombre" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="area_id"
            label="Área"
            rules={[{ required: true, message: "Seleccione un área" }]}
          >
            <Select placeholder="Seleccione un área">
              {areas.map((a) => (
                <Option key={a.id} value={a.id}>
                  {a.nombre}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Drawer: Incidencia */}
      <Drawer
        title="Crear Incidencia"
        placement="right"
        width={500}
        open={openIncidencia}
        onClose={() => {
          formIncidencia.resetFields();
          onCloseIncidencia();
        }}
        extra={
          <Button type="primary" onClick={handleSubmitIncidencia}>
            Guardar
          </Button>
        }
      >
        <Form layout="vertical" form={formIncidencia}>
          <Form.Item name="catalogo_id" noStyle>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="nombre"
            label="Nombre de la incidencia"
            rules={[{ required: true, message: "Ingrese un nombre" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="descripcion" label="Descripción">
            <Input.TextArea autoSize={{ minRows: 3 }} />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo"
            rules={[{ required: true, message: "Seleccione el tipo" }]}
          >
            <Select placeholder="Tipo">
              <Option value="incidencia">Incidencia</Option>
              <Option value="requerimiento">Requerimiento</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Drawer: Categoría */}
      <Drawer
        title="Crear Categoría"
        placement="right"
        width={500}
        open={openCatagoria}
        onClose={() => {
          formCategoria.resetFields();
          onCloseCategoria();
        }}
        extra={
          <Button type="primary" onClick={handleSubmitCategoria}>
            Guardar
          </Button>
        }
      >
        <Form layout="vertical" form={formCategoria}>
          <Form.Item name="incidencia_id" noStyle>
            <Input type="hidden" />
          </Form.Item>

          <Form.Item
            name="nombre"
            label="Nombre de la categoría"
            rules={[{ required: true, message: "Ingrese un nombre" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="subarea_id"
            label="Subárea"
            rules={[{ required: true, message: "Seleccione una subárea" }]}
          >
            <Select placeholder="Subárea">
              {(subareasPorCatalogo[catalogoIdActual ?? -1] || []).map((s) => (
                <Option key={s.id} value={s.id}>
                  {s.nombre}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Styles locales para zebra + hover */}
      <style jsx global>{`
        .tabla-catalogo .ant-table-thead > tr > th {
          background: ${token.colorFillSecondary};
        }
        .tabla-catalogo .ant-table-tbody > tr:nth-child(odd) > td {
          background: ${token.colorFillQuaternary};
        }
        .tabla-catalogo .ant-table-tbody > tr:hover > td {
          background: ${token.controlItemBgHover} !important;
        }
      `}</style>
    </div>
  );
}
