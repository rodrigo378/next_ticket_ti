import { HD_Area } from "@/interface/hd/hd_area";
import { HD_Incidencia } from "@/interface/hd/hd_incidencia";
import { Descriptions, Form, FormInstance, UploadFile } from "antd";
import Title from "antd/es/typography/Title";
import Link from "next/link";

interface Props {
  form: FormInstance;
  areas: HD_Area[];
  incidencias: HD_Incidencia[];
  fileList: UploadFile[];
}

export default function Step_2({ form, areas, incidencias, fileList }: Props) {
  const tipo = Form.useWatch<string | undefined>("tipo", form);
  const labelIncidenciaRequerimiento =
    tipo === "incidencia"
      ? "Incidencia"
      : tipo === "requerimiento"
      ? "Requerimiento"
      : "Detalle";

  const values = form.getFieldsValue(true);
  const area = areas.find((a) => a.id === values.area_id)?.nombre ?? "-";
  const incidencia =
    incidencias.find((i) => i.id === values.incidencia_id)?.nombre ?? "-";
  const categoria =
    incidencias
      .find((i) => i.id === values.incidencia_id)
      ?.categoria?.find((c) => c.id === values.categoria_id)?.nombre ?? "-";

  return (
    <>
      <Title level={4}>✅ Confirma tu ticket</Title>
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Área">{area}</Descriptions.Item>
        <Descriptions.Item label="Tipo de solicitud">
          {values.tipo || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={labelIncidenciaRequerimiento}>
          {incidencia}
        </Descriptions.Item>
        <Descriptions.Item label="Categoría">{categoria}</Descriptions.Item>
        <Descriptions.Item label="Descripción">
          {values.descripcion || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Archivos adjuntos">
          {fileList.length > 0 ? (
            <ul style={{ paddingLeft: "1rem" }}>
              {fileList.map((file) => (
                <li key={file.uid}>
                  <Link
                    href={URL.createObjectURL(file.originFileObj!)}
                    target="_blank"
                  >
                    {file.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            "— (ninguno)"
          )}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
}
