/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useMemo } from "react";
import {
  Form,
  Radio,
  AutoComplete,
  Typography,
  Spin,
  Card,
  Descriptions,
  Space,
  Button,
  Tag,
  Input,
  TreeSelect,
  Select,
} from "antd";
import { useBuscarEstudiante } from "./hooks/buscarUsuario";
import { useArbolIncidenciasQuery } from "./hooks/useArbolIncidenciasQuery";
import { UserOutlined, ReloadOutlined } from "@ant-design/icons";
import { useGetAreas } from "./hooks/areaQuery";

const { Text, Title } = Typography;
const { TextArea } = Input;

const optionsRol = [
  { label: "Estudiante", value: "estudiante" },
  { label: "Administrativo", value: "administrativo" },
];

type Estudiante = {
  c_codalu: string;
  nombres: string;
  paterno: string;
  materno: string;
  c_email_institucional: string;
  facultad: string;
  c_codesp: string;
  semestre: string;
};

type Area = { id: number; nombre: string };

export default function RegularizarView() {
  const [rol, setRol] = useState<"estudiante" | "administrativo">("estudiante");
  const [form] = Form.useForm();

  // Autocomplete
  const [texto, setTexto] = useState("");
  const [seleccion, setSeleccion] = useState<Estudiante | null>(null);

  // Helpdesk: área, categoría y descripción
  const [areaId, setAreaId] = useState<number | undefined>(undefined);
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [descripcion, setDescripcion] = useState("");

  // Datos
  const { data, isFetching } = useBuscarEstudiante(texto);
  const resultados = (data as Estudiante[] | undefined) ?? [];

  // Áreas
  const { data: areasData, isLoading: loadingAreas } = useGetAreas();
  const areasOptions = useMemo(
    () =>
      ((areasData as Area[] | undefined) ?? []).map((a) => ({
        label: a.nombre,
        value: a.id,
      })),
    [areasData]
  );

  // Árbol por área
  const { data: treeData, isFetching: loadingArbol } =
    useArbolIncidenciasQuery(areaId);

  // Opciones del AutoComplete
  const options = useMemo(
    () =>
      resultados.map((al) => {
        const nombre = `${al.nombres} ${al.paterno} ${al.materno}`.trim();
        return {
          value: al.c_codalu,
          label: (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 600 }}>{nombre}</span>
              <span>
                <Text type="secondary">{al.c_codalu}</Text> ·{" "}
                {al.c_email_institucional}
              </span>
              <Text type="secondary">
                {al.facultad} — {al.c_codesp} — {al.semestre}
              </Text>
            </div>
          ),
          _row: al,
        };
      }),
    [resultados]
  );

  const onSearch = (val: string) => {
    if (seleccion) return;
    setTexto(val);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSelect = (_value: string, option: any) => {
    const al: Estudiante = option._row;
    setSeleccion(al);
    const nombre = `${al.nombres} ${al.paterno} ${al.materno}`.trim();
    setTexto(`${al.c_codalu} · ${nombre}`);
    form.setFieldsValue({
      codalu: al.c_codalu,
      email: al.c_email_institucional,
    });
  };

  const resetSeleccion = () => {
    setSeleccion(null);
    setTexto("");
    form.resetFields(["codalu", "email"]);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Title level={4} style={{ margin: 0 }}>
        Regularizar View
      </Title>

      <Radio.Group
        options={optionsRol}
        onChange={(e) => setRol(e.target.value)}
        value={rol}
        optionType="button"
        buttonStyle="solid"
      />

      {rol === "estudiante" ? (
        <>
          {/* Búsqueda y ficha del estudiante */}
          <Card
            title={
              <Space align="center">
                <UserOutlined />
                <span>Información del Estudiante</span>
              </Space>
            }
            styles={{ body: { paddingTop: 12 } }}
          >
            <Form layout="vertical" form={form}>
              <Form.Item label="Buscar estudiante">
                <Space.Compact style={{ width: "100%" }}>
                  <AutoComplete
                    value={texto}
                    onSearch={onSearch}
                    onChange={(v) => !seleccion && setTexto(v)}
                    onSelect={onSelect}
                    options={seleccion ? [] : options}
                    style={{ width: "100%" }}
                    placeholder="Correo, código o DNI de estudiante"
                    filterOption={false}
                    notFoundContent={
                      isFetching ? (
                        <Spin size="small" />
                      ) : (
                        <Text type="secondary">Sin resultados</Text>
                      )
                    }
                    disabled={!!seleccion}
                  />
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={resetSeleccion}
                    disabled={!seleccion && !texto}
                  >
                    Cambiar
                  </Button>
                </Space.Compact>
              </Form.Item>

              {/* Campos ocultos */}
              <Form.Item name="codalu" style={{ display: "none" }}>
                <input />
              </Form.Item>
              <Form.Item name="email" style={{ display: "none" }}>
                <input />
              </Form.Item>
            </Form>

            {seleccion && (
              <Card
                size="small"
                style={{ marginTop: 8 }}
                bordered
                bodyStyle={{ paddingTop: 8 }}
              >
                <Descriptions
                  size="small"
                  column={{ xs: 1, sm: 2, md: 3 }}
                  items={[
                    {
                      key: "cod",
                      label: "Código",
                      children: <Text strong>{seleccion.c_codalu}</Text>,
                    },
                    {
                      key: "nom",
                      label: "Nombre",
                      children: (
                        <span>
                          {seleccion.nombres} {seleccion.paterno}{" "}
                          {seleccion.materno}
                        </span>
                      ),
                    },
                    {
                      key: "mail",
                      label: "Correo institucional",
                      children: <Text>{seleccion.c_email_institucional}</Text>,
                    },
                    {
                      key: "fac",
                      label: "Facultad",
                      children: <Text>{seleccion.facultad}</Text>,
                    },
                    {
                      key: "esp",
                      label: "Especialidad",
                      children: <Tag color="blue">{seleccion.c_codesp}</Tag>,
                    },
                    {
                      key: "sem",
                      label: "Semestre",
                      children: <Tag>{seleccion.semestre}</Tag>,
                    },
                  ]}
                />
              </Card>
            )}
          </Card>

          {/* Detalle de la solicitud — mismo diseño del TreeSelect del drawer */}
          <Card
            size="small"
            className="rounded-lg border border-dashed"
            title={
              <span className="font-semibold">
                📚 Clasificación de servicio
              </span>
            }
            extra={
              <Tag color="processing" style={{ borderRadius: 999 }}>
                Selecciona catálogo
              </Tag>
            }
          >
            <div className="text-xs text-gray-500 mb-2">
              Selecciona: <strong>Catálogo → Incidencia → Categoría</strong>
            </div>

            <Form layout="vertical">
              <Form.Item
                label="Área"
                tooltip="Selecciona el área para filtrar el árbol de incidencias"
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Selecciona un área"
                  value={areaId}
                  onChange={(val) => {
                    setCategoriaId(undefined);
                    setAreaId(val as number | undefined);
                  }}
                  options={areasOptions}
                  loading={loadingAreas}
                  optionFilterProp="label"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Tipo/Categoría (árbol)"
                tooltip="Solo las categorías son seleccionables; Catálogo e Incidencia agrupan."
              >
                <TreeSelect
                  style={{ width: "100%" }}
                  value={categoriaId}
                  treeData={treeData}
                  treeLine
                  showSearch
                  allowClear
                  listHeight={400}
                  placeholder={
                    areaId
                      ? "Selecciona una categoría"
                      : "Selecciona un Área para cargar el árbol"
                  }
                  disabled={!areaId}
                  filterTreeNode={(input, node) =>
                    String(node?.title ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  notFoundContent={
                    loadingArbol ? (
                      <Spin size="small" />
                    ) : (
                      <Text type="secondary">Sin datos</Text>
                    )
                  }
                  onChange={(value) => setCategoriaId(value as number)}
                />
              </Form.Item>

              <Form.Item label="Descripción del caso">
                <TextArea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe la incidencia o requerimiento con el mayor detalle posible…"
                  rows={5}
                  maxLength={1500}
                  showCount
                />
              </Form.Item>
            </Form>

            <div className="text-[11px] text-gray-500 mt-2">
              Solo las <strong>categorías</strong> son seleccionables; los
              niveles de
              <em> Catálogo</em> e <em> Incidencia</em> sirven para agrupar.
            </div>
          </Card>
        </>
      ) : (
        <Card title="Información del Personal Administrativo">
          <Text type="secondary">
            Registro de incidencias, permisos, reportes…
          </Text>
        </Card>
      )}
    </div>
  );
}
