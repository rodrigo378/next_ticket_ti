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
} from "antd";
import { useEffect, useState } from "react";
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
  const [catalogoIdActual, setCatalogoIdActual] = useState<number | null>(null);

  const [catalogos, setCatalogos] = useState<HD_CatalogoServicio[]>([]);
  const [areas, setAreas] = useState<HD_Area[]>([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState<number | null>(null);
  const [filtro, setFiltro] = useState("");
  const [subareasPorCatalogo, setSubareasPorCatalogo] = useState<{
    [catalogoId: number]: HD_Subarea[];
  }>({});

  const [formCatalogo] = Form.useForm();
  const [formIncidencia] = Form.useForm();
  const [formCategoria] = Form.useForm();

  const handleSubmitCatalogo = () => {
    formCatalogo.validateFields().then(async (values) => {
      console.log("📦 Crear catálogo:", values);
      try {
        const response = await createCatalogo(values);
        await fetchCatalogos();
        console.log(response);
      } catch (error) {
        console.log("error => ", error);
      }
      formCatalogo.resetFields();
      setOpenCatalogo(false);
    });
  };

  const handleSubmitIncidencia = () => {
    formIncidencia.validateFields().then(async (values) => {
      console.log("🐞 Crear incidencia:", values);
      try {
        const response = await createIncidencia(values);
        await fetchCatalogos();
        console.log("response => ", response);
      } catch (error) {
        console.log("error => ", error);
      }
      formIncidencia.resetFields();
      setOpenIncidencia(false);
    });
  };

  const handleSubmitCategoria = () => {
    formCategoria.validateFields().then(async (values) => {
      console.log("📁 Crear categoría:", values);
      try {
        const response = await createCategoria(values);
        await fetchCatalogos();
        console.log("response => ", response);
      } catch (error) {
        console.log("error => ", error);
      }
      formCategoria.resetFields();
      setOpenCatagoria(false);
    });
  };

  //Estaddos de los drawers
  const [openCatalogo, setOpenCatalogo] = useState(false);
  const [openIncidencia, setOpenIncidencia] = useState(false);
  const [openCatagoria, setOpenCatagoria] = useState(false);

  const onCloseCatalogo = () => {
    setOpenCatalogo(false);
  };
  const onCloseIncidencia = () => {
    setOpenIncidencia(false);
  };
  const onCloseCategoria = () => {
    setOpenCatagoria(false);
  };

  const onOpenCatalogo = () => {
    setOpenCatalogo(true);
  };
  const onOpenIncidencia = (catalogo_id: number) => {
    formIncidencia.setFieldValue("catalogo_id", catalogo_id);
    setOpenIncidencia(true);
  };

  const onOpenCategoria = async (
    incidencia_id: number,
    catalogo_id: number
  ) => {
    console.log("se abrio categoria");
    console.log("catalogo_id => ", catalogo_id);

    console.log("=> ", subareasPorCatalogo[catalogo_id]);

    formCategoria.setFieldValue("incidencia_id", incidencia_id);
    setCatalogoIdActual(catalogo_id);

    if (!subareasPorCatalogo[catalogo_id]) {
      console.log();

      const subareas = await getSubareas(catalogo_id);
      setSubareasPorCatalogo((prev) => ({
        ...prev,
        [catalogo_id]: subareas,
      }));
      console.log("subareas => ", subareas);
    }

    setOpenCatagoria(true);
  };

  const fetchAreas = async () => {
    const data = await getAreas();
    setAreas(data);
  };

  const fetchCatalogos = async () => {
    const data = await getCatalogo();
    setCatalogos(data);
  };

  const cargarSubareasSiNoExisten = async (
    catalogoId: number,
    areaId: number
  ) => {
    if (!subareasPorCatalogo[catalogoId]) {
      const subareas = await getSubareas(areaId);
      setSubareasPorCatalogo((prev) => ({
        ...prev,
        [catalogoId]: subareas,
      }));
    }
  };

  useEffect(() => {
    fetchAreas();
    fetchCatalogos();
  }, []);

  const handleAreaChange = (areaId: number) => {
    setAreaSeleccionada(areaId);
  };

  const handleSubareaChange = async (
    categoriaId: number,
    subareaId: number
  ) => {
    console.log("cambio de subarea de una categoria");
    console.log(categoriaId, subareaId);
    try {
      const response = await updateCategoria(categoriaId, {
        subarea_id: subareaId,
      });
      console.log("response => ", response);
    } catch (error) {
      console.log("error => ", error);
    }

    // await updateCategoriaSubarea({ id: categoriaId, subarea_id: subareaId });
    message.success("Subárea actualizada");
    fetchCatalogos();
  };

  const handleSLAUpdate = async (
    slaId: number,
    field: "tiempo_respuesta" | "tiempo_resolucion",
    value: number
  ) => {
    console.log(slaId, field, value);
    try {
      const response = await updateSla(slaId, {
        [field]: value,
      });
      console.log("response => ", response);
    } catch (error) {
      console.log("error => ", error);
    }

    message.success("SLA actualizado");
    fetchCatalogos();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4}>Catálogo de Incidencias y Categorías</Title>
          <Paragraph>Gestión unificada de los tres niveles</Paragraph>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar catálogo..."
            prefix={<SearchOutlined />}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-64"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onOpenCatalogo}
          >
            Nuevo Catálogo
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <Select
          placeholder="Filtrar por Área"
          style={{ width: 240 }}
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

      <Table
        rowKey="id"
        bordered
        columns={[
          {
            title: "Catálogo",
            dataIndex: "nombre",
            key: "nombre",
          },
          {
            title: "Área",
            dataIndex: ["area", "nombre"],
            key: "area",
            render: (nombre: string) => <Tag>{nombre}</Tag>,
          },
          {
            title: "Acciones",
            key: "accion",
            render: (catalogo: HD_CatalogoServicio) => (
              <Button
                type="primary"
                onClick={() => onOpenIncidencia(catalogo.id)}
              >
                Agregar Incidencia
              </Button>
            ),
          },
        ]}
        dataSource={catalogos.filter((cat) => {
          const matchTexto = cat.nombre
            .toLowerCase()
            .includes(filtro.toLowerCase());
          const matchArea = areaSeleccionada
            ? cat.area_id === areaSeleccionada
            : true;
          return matchTexto && matchArea;
        })}
        expandable={{
          expandedRowRender: (catalogo: HD_CatalogoServicio) => {
            cargarSubareasSiNoExisten(catalogo.id, catalogo.area_id);
            const subareas = subareasPorCatalogo[catalogo.id] || [];

            return (
              <>
                <Table
                  rowKey="id"
                  size="small"
                  columns={[
                    { title: "Incidencia", dataIndex: "nombre" },
                    {
                      title: "Tipo",
                      dataIndex: "tipo",
                      render: (t) => <Tag>{t}</Tag>,
                    },
                    { title: "Descripción", dataIndex: "descripcion" },
                    {
                      title: "Acciones",
                      key: "accion",
                      render: (incidencia: HD_Incidencia) => (
                        <Button
                          type="primary"
                          onClick={() =>
                            onOpenCategoria(
                              incidencia.id,
                              incidencia.catalogo_servicio_id
                            )
                          }
                        >
                          Agregar categoria
                        </Button>
                      ),
                    },
                  ]}
                  dataSource={catalogo.incidencias || []}
                  expandable={{
                    expandedRowRender: (inc: HD_Incidencia) => {
                      return (
                        <div className="space-y-4">
                          {(inc.categoria || []).map((cat) => (
                            <div
                              key={cat.id}
                              className="border p-3 rounded bg-gray-50"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <strong>📂 {cat.nombre}</strong>
                                <Select
                                  defaultValue={cat.subarea?.id}
                                  style={{ width: 200 }}
                                  onChange={(subId) =>
                                    handleSubareaChange(cat.id, subId)
                                  }
                                >
                                  {subareas.map((sub) => (
                                    <Option key={sub.id} value={sub.id}>
                                      {sub.nombre}
                                    </Option>
                                  ))}
                                </Select>
                              </div>

                              <table className="table-auto w-full text-sm mt-2">
                                <thead>
                                  <tr className="text-left border-b">
                                    <th>Prioridad</th>
                                    <th>Respuesta (min)</th>
                                    <th>Resolución (min)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(cat.sla || []).map((sla) => (
                                    <tr key={sla.id} className="border-t">
                                      <td>{sla.prioridad?.nombre}</td>
                                      <td>
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
                                      <td>
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
                          ))}
                        </div>
                      );
                    },
                  }}
                />
              </>
            );
          },
        }}
      />

      {/*drawer de catalogo */}
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

      {/*drawer de incidencia  */}
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
            <Input.TextArea />
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

      {/*drawer de categoria  */}
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
    </div>
  );
}
