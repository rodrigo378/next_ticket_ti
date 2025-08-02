"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Button,
  Tag,
  Input,
  Drawer,
  message,
  Input as AntInput,
  Select,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { getIncidencias } from "@/services/incidencias";
import { getAreas } from "@/services/area";
import { Area, Subarea } from "@/interface/area";
import { Incidencia } from "@/interface/incidencia";

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function Page() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [filtro, setFiltro] = useState("");
  const [open, setOpen] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState<number | null>(null);
  const [subareaSeleccionada, setSubareaSeleccionada] = useState<number | null>(
    null
  );
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(null);
  const [editingSLA, setEditingSLA] = useState<{
    [id: number]: { tiempo_respuesta: number; tiempo_resolucion: number };
  }>({});

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  const fetchIncidencias = async () => {
    try {
      const data = await getIncidencias();
      setIncidencias(data);
    } catch (error) {
      console.error(error);
      message.error("Error al obtener las incidencias");
    }
  };

  const fetchAreas = async () => {
    try {
      const data = await getAreas();
      setAreas(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchIncidencias();
    fetchAreas();
  }, []);

  const onAreaChange = (areaId: number) => {
    setAreaSeleccionada(areaId);
    setSubareaSeleccionada(null);
    const area = areas.find((a) => a.id === areaId);
    setSubareas(area?.Subarea || []);
  };

  const handleSLAChange = (
    id: number,
    field: "tiempo_respuesta" | "tiempo_resolucion",
    value: number
  ) => {
    setEditingSLA((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSaveSLA = async (slaId: number) => {
    const data = editingSLA[slaId];
    if (!data) return;
    try {
      // await updateSLA({ id: slaId, ...data });
      message.success("SLA actualizado");
      fetchIncidencias();
    } catch (error) {
      console.error(error);
      message.error("Error al actualizar SLA");
    }
  };

  const columnas: ColumnsType<Incidencia> = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "Catálogo",
      dataIndex: ["catalogo_servicio", "nombre"],
      key: "catalogo",
      render: (nombre: string) => <Tag color="blue">{nombre}</Tag>,
    },
    {
      title: "Área",
      dataIndex: ["catalogo_servicio", "area", "nombre"],
      key: "area_id",
      render: (nombre: string) => <Tag color="volcano">{nombre}</Tag>,
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo: string) => (
        <Tag color={tipo === "incidencia" ? "red" : "green"}>
          {tipo.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4}>Gestión de Incidencias</Title>
          <Paragraph type="secondary">
            Visualiza y administra las incidencias registradas
          </Paragraph>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Buscar..."
            prefix={<SearchOutlined />}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="w-64"
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={showDrawer}>
            Nueva Incidencia
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Select
          placeholder="Filtrar por Área"
          allowClear
          value={areaSeleccionada || undefined}
          onChange={onAreaChange}
        >
          {areas.map((area) => (
            <Option key={area.id} value={area.id}>
              {area.nombre}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Filtrar por Subárea"
          allowClear
          value={subareaSeleccionada || undefined}
          onChange={(subId) => setSubareaSeleccionada(subId)}
          disabled={!areaSeleccionada}
        >
          {subareas.map((sub) => (
            <Option key={sub.id} value={sub.id}>
              {sub.nombre}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Filtrar por Tipo"
          allowClear
          value={tipoSeleccionado || undefined}
          onChange={(tipo) => setTipoSeleccionado(tipo)}
        >
          <Option value="incidencia">Incidencia</Option>
          <Option value="requerimiento">Requerimiento</Option>
        </Select>
      </div>

      <Table
        rowKey="id"
        columns={columnas}
        dataSource={incidencias.filter((i) => {
          const matchTexto = `${i.nombre} ${i.descripcion}`
            .toLowerCase()
            .includes(filtro.toLowerCase());
          const matchArea = areaSeleccionada
            ? i.catalogo_servicio?.area?.id === areaSeleccionada
            : true;
          const matchSubarea = subareaSeleccionada
            ? i.categoria?.some((cat) => cat.subarea_id === subareaSeleccionada)
            : true;
          const matchTipo = tipoSeleccionado
            ? i.tipo === tipoSeleccionado
            : true;
          return matchTexto && matchArea && matchSubarea && matchTipo;
        })}
        bordered
        expandable={{
          expandedRowRender: (record) => (
            <div className="space-y-4">
              {record.categoria?.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-gray-50 p-3 rounded border space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <strong>📂 {cat.nombre}</strong>
                    <Select
                      size="small"
                      style={{ width: 200 }}
                      defaultValue={cat.subarea?.nombre}
                      onChange={async (newSubId) => {
                        // await updateCategoriaSubarea(cat.id, newSubId)
                        message.success("Subárea actualizada");
                        fetchIncidencias();
                      }}
                    >
                      {subareas.map((s) => (
                        <Option key={s.id} value={s.id}>
                          {s.nombre}
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
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.SLA?.map((sla) => (
                        <tr key={sla.id} className="border-t">
                          <td>P{sla.prioridad_id}</td>
                          <td>
                            <AntInput
                              type="number"
                              defaultValue={sla.tiempo_respuesta}
                              onChange={(e) =>
                                handleSLAChange(
                                  sla.id,
                                  "tiempo_respuesta",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </td>
                          <td>
                            <AntInput
                              type="number"
                              defaultValue={sla.tiempo_resolucion}
                              onChange={(e) =>
                                handleSLAChange(
                                  sla.id,
                                  "tiempo_resolucion",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </td>
                          <td>
                            <Button
                              type="link"
                              onClick={() => handleSaveSLA(sla.id)}
                            >
                              Guardar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ),
        }}
      />

      <Drawer
        title="Registrar Incidencia"
        placement="right"
        width={500}
        onClose={onClose}
        open={open}
      >
        <p>Formulario pendiente...</p>
      </Drawer>
    </div>
  );
}
