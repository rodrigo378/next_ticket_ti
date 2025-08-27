import { HD_Area } from "@/interface/hd/hd_area";
import { HD_CatalogoServicio } from "@/interface/hd/hd_catalogoServicio";
import { HD_Incidencia } from "@/interface/hd/hd_incidencia";
import { Col, Form, FormInstance, Row, Select } from "antd";

interface Props {
  form: FormInstance;
  areas: HD_Area[];
  incidencias: HD_Incidencia[];
  catalogo: HD_CatalogoServicio[];
  fetchCatalogo: (area_id: number) => void;
}

export default function Step_0({
  form,
  areas,
  incidencias,
  catalogo,
  fetchCatalogo,
}: Props) {
  const catalogo_id = Form.useWatch<number | undefined>(
    "catalogo_servicio_id",
    form
  );
  const tipo = Form.useWatch<string | undefined>("tipo", form);
  const incidencia_id = Form.useWatch<number | undefined>(
    "incidencia_id",
    form
  );

  const handleAreaChange = (area_id: number) => {
    form.setFieldsValue({
      catalogo_servicio_id: undefined,
      tipo: undefined,
      incidencia_id: undefined,
      categoria_id: undefined,
    });
    fetchCatalogo(area_id);
    console.log("form => ", form.getFieldValue);
  };

  const handleCatalogoChange = () => {
    form.setFieldsValue({
      tipo: undefined,
      incidencia_id: undefined,
      categoria_id: undefined,
    });
  };

  // const handleIncidenciaChange = () => {
  //   form.setFieldsValue({ categoria_id: undefined });
  // };

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
          {/* Select de area */}
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
            >
              {areas.map((area) => (
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
          {/* select de catalogo */}
          <Form.Item
            label="Catálogo de Servicio"
            name="catalogo_servicio_id"
            rules={[{ required: true, message: "Selecciona catálogo" }]}
          >
            <Select
              placeholder="Selecciona catálogo"
              size="large"
              disabled={!form.getFieldValue("area_id")}
              onChange={handleCatalogoChange}
              showSearch
              optionFilterProp="label"
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
                disabled={!catalogo_id}
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
              disabled={!tipo}
              // onChange={handleIncidenciaChange}
              showSearch
              optionFilterProp="label"
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
              disabled={!incidencia_id}
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
