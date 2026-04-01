import { HD_Area, HD_CatalogoServicio, HD_Incidencia } from "@interfaces/hd";
import { Col, Form, FormInstance, Row, Select, Spin } from "antd";

interface Props {
  form: FormInstance;
  areas: HD_Area[];
  incidencias: HD_Incidencia[];
  catalogo: HD_CatalogoServicio[];
  fetchCatalogo: (area_id: number) => void;
  // nuevas props de carga
  loadingAreas: boolean;
  loadingCatalogo: boolean;
  loadingIncidencias: boolean;
}

export default function Step_0({
  form,
  areas,
  incidencias,
  catalogo,
  fetchCatalogo,
  loadingAreas,
  loadingCatalogo,
  loadingIncidencias,
}: Props) {
  const catalogo_id = Form.useWatch<number | undefined>(
    "catalogo_servicio_id",
    form,
  );
  const tipo = Form.useWatch<string | undefined>("tipo", form);
  const incidencia_id = Form.useWatch<number | undefined>(
    "incidencia_id",
    form,
  );

  const handleAreaChange = (area_id: number) => {
    form.setFieldsValue({
      catalogo_servicio_id: undefined,
      tipo: undefined,
      incidencia_id: undefined,
      categoria_id: undefined,
    });
    fetchCatalogo(area_id);
  };

  const handleCatalogoChange = () => {
    form.setFieldsValue({
      tipo: undefined,
      incidencia_id: undefined,
      categoria_id: undefined,
    });
  };

  const labelIncidenciaRequerimiento =
    tipo === "incidencia"
      ? "Incidencia"
      : tipo === "requerimiento"
        ? "Requerimiento"
        : "Detalle";

  return (
    <>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          {/* Select de área */}
          <Form.Item
            label="Área"
            name="area_id"
            rules={[{ required: true, message: "Selecciona el área" }]}
          >
            <Select
              placeholder="Selecciona el área"
              onChange={handleAreaChange}
              allowClear
              size="large"
              showSearch
              optionFilterProp="label"
              className="w-full"
              loading={loadingAreas}
              notFoundContent={
                loadingAreas ? (
                  <div className="py-3 text-center">
                    <Spin size="small" /> Cargando áreas...
                  </div>
                ) : null
              }
            >
              {areas
                .filter((a) => [1, 11, 12].includes(a.id))
                .map((area) => (
                  <Select.Option
                    key={area.id}
                    value={area.id}
                    label={area.nombre}
                  >
                    {area.nombre}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          {/* Select de catálogo */}
          <Form.Item
            label="Catálogo de Servicio"
            name="catalogo_servicio_id"
            rules={[{ required: true, message: "Selecciona catálogo" }]}
          >
            <Select
              placeholder="Selecciona catálogo"
              size="large"
              disabled={!form.getFieldValue("area_id") || loadingCatalogo}
              loading={loadingCatalogo}
              onChange={handleCatalogoChange}
              showSearch
              optionFilterProp="label"
              notFoundContent={
                loadingCatalogo ? (
                  <div className="py-3 text-center">
                    <Spin size="small" /> Cargando catálogo...
                  </div>
                ) : null
              }
            >
              {catalogo.map((cat) => (
                <Select.Option key={cat.id} value={cat.id} label={cat.nombre}>
                  {cat.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          {/* Select tipo */}
          <Form.Item label="Tipo de solicitud" required>
            <div className="mb-2 text-gray-500 text-sm">
              <span className="italic">
                📌 <strong>Incidencia</strong>: problema o falla técnica.
                &nbsp;|&nbsp; 📌 <strong>Requerimiento</strong>: instalación,
                acceso o configuración.
              </span>
            </div>
            <Form.Item
              name="tipo"
              noStyle
              rules={[{ required: true, message: "Selecciona tipo" }]}
            >
              <Select
                placeholder="Selecciona tipo"
                size="large"
                disabled={!catalogo_id || loadingIncidencias || loadingCatalogo}
              >
                <Select.Option value="incidencia">Incidencia</Select.Option>
                <Select.Option value="requerimiento">
                  Requerimiento
                </Select.Option>
              </Select>
            </Form.Item>
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          {/* Select incidencia/requerimiento */}
          <Form.Item
            label={labelIncidenciaRequerimiento}
            name="incidencia_id"
            rules={[
              {
                required: true,
                message: `Selecciona ${labelIncidenciaRequerimiento}`,
              },
            ]}
          >
            <Select
              placeholder={`Selecciona ${labelIncidenciaRequerimiento}`}
              size="large"
              disabled={!tipo || loadingIncidencias}
              loading={loadingIncidencias}
              showSearch
              optionFilterProp="label"
              notFoundContent={
                loadingIncidencias ? (
                  <div className="py-3 text-center">
                    <Spin size="small" /> Cargando{" "}
                    {labelIncidenciaRequerimiento.toLowerCase()}...
                  </div>
                ) : null
              }
            >
              {incidencias.map((i) => (
                <Select.Option key={i.id} value={i.id} label={i.nombre}>
                  {i.nombre}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          {/* Select categoría */}
          <Form.Item
            label={
              <div className="flex items-center gap-2">
                <span>Categoría</span>
              </div>
            }
            name="categoria_id"
            rules={[{ required: true, message: "Selecciona categoría" }]}
          >
            <Select
              placeholder="Selecciona categoría"
              size="large"
              disabled={!incidencia_id || loadingIncidencias}
              showSearch
              optionFilterProp="label"
            >
              {incidencias
                .find((i) => i.id === incidencia_id)
                ?.categoria?.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id} label={cat.nombre}>
                    {cat.nombre}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}
