import { Core_Usuario } from "@/interface/core/core_usuario";
import { EyeOutlined } from "@ant-design/icons";
import { Button, Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";

interface Props {
  usuarios: Core_Usuario[];
  showDrawerAdministrativo: (usuario_id: number) => void;
}

export default function TableUsuarioAdministrativo({
  usuarios,
  showDrawerAdministrativo,
}: Props) {
  const columnas: ColumnsType<Core_Usuario> = [
    {
      title: "Usuario",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      render: (text, record) => (
        <div className="">
          <p className="font-semibold text-slate-700">{record.nombre}</p>
          <p className="text-sm text-slate-500">{record.email}</p>
        </div>
      ),
    },
    {
      title: "Grado",
      dataIndex: "grado",
      key: "grado",
      sorter: (a, b) => a.grado.localeCompare(b.grado),
    },
    {
      title: "Rol",
      dataIndex: ["rol", "nombre"],
      key: "rol",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado: string) => {
        const color = estado === "A" ? "green" : "volcano";
        const label = estado === "A" ? "Activo" : "Inactivo";
        return <Tag color={color}>{label}</Tag>;
      },
      sorter: (a, b) => a.estado.localeCompare(b.estado),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (record: Core_Usuario) => (
        <div className="flex gap-2">
          <Button
            icon={<EyeOutlined />}
            onClick={() => showDrawerAdministrativo(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columnas}
      dataSource={usuarios}
      pagination={{ pageSize: 20 }}
      bordered
    />
  );
}
