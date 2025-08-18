import type { UploadFile } from "antd/es/upload/interface";

interface TicketFormValues {
  descripcion: string;
  incidencia_id: string | number;
  area_id: string | number;
  categoria_id?: string | number;
}

export function buildFormData(
  values: TicketFormValues,
  fileList: UploadFile[]
): FormData {
  const formData = new FormData();

  formData.append("descripcion", values.descripcion);
  formData.append("incidencia_id", String(values.incidencia_id));
  formData.append("area_id", String(values.area_id));

  if (values.categoria_id) {
    formData.append("categoria_id", String(values.categoria_id));
  }

  fileList.forEach((file) => {
    if (file.originFileObj) {
      formData.append("archivos", file.originFileObj as Blob);
    }
  });

  return formData;
}
