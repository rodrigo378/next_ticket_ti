import { Usuario } from "@/interface/usuario";
import { EyeOutlined } from "@ant-design/icons";
import { Button, Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";

interface Props {
  usuarios: Usuario[];
  showDrawerAdministrativo: (usuario_id: number) => void;
}

export default function TableUsuarioAdministrativo({
  usuarios,
  showDrawerAdministrativo,
}: Props) {
  const columnas: ColumnsType<Usuario> = [
    {
      title: "Usuario",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700">
              {record.nombre}
            </span>
            <span className="text-sm text-slate-500">{record.email}</span>
          </div>
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
      title: "Área",
      key: "area",
      render: (record: Usuario) => {
        return record.subarea?.area?.nombre || "—";
      },
    },
    {
      title: "Subarea",
      dataIndex: ["subarea", "nombre"],
      key: "subarea",
    },
    {
      title: "Áreas Administradas",
      key: "areas_admin",
      render: (record: Usuario) => {
        if (record.rol?.nivel === 5) {
          return <Tag color="geekblue">Todas las áreas</Tag>;
        }
        if (record.rol?.nivel === 4) {
          return (
            <div className="flex flex-wrap gap-1">
              {record.UsuarioArea?.length
                ? record.UsuarioArea.map((ua) => (
                    <Tag key={ua.area?.id} color="blue">
                      {ua.area?.nombre}
                    </Tag>
                  ))
                : "—"}
            </div>
          );
        }
        return "—";
      },
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
      render: (record: Usuario) => (
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
