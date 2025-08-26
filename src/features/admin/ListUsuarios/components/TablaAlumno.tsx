import { Core_Usuario } from "@/interface/core/core_usuario";
import { Table } from "antd";
import { ColumnsType } from "antd/es/table";

interface Props {
  usuarios: Core_Usuario[];
}

export default function TableUsuarioAlumno({ usuarios }: Props) {
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
