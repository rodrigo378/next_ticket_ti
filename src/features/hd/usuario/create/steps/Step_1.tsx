import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Upload, UploadFile } from "antd";
import TextArea from "antd/es/input/TextArea";

interface Props {
  fileList: UploadFile[];
  setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>;
}

export default function Step_1({ fileList, setFileList }: Props) {
  return (
    <>
      <Form.Item
        label="Descripción detallada"
        name="descripcion"
        rules={[{ required: true, message: "Describe el problema" }]}
      >
        <TextArea
          rows={5}
          placeholder="Describe con detalle (qué, cuándo, dónde, cómo impacta)"
        />
      </Form.Item>
      <Form.Item label="Adjuntar archivos (opcional)">
        <Upload
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        >
          <Button icon={<UploadOutlined />}>Seleccionar archivos</Button>
        </Upload>
        <div className="text-xs text-gray-500 mt-2">
          Máx. 10MB por archivo. Formatos: PDF, DOC/DOCX, PNG, JPG.
        </div>
      </Form.Item>
    </>
  );
}
