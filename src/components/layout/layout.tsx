"use client";

import { Layout, Menu, Dropdown, Button, message } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode } from "react";
import { getPermisosMe } from "@/services/admin";
import { PermisoLayout } from "@/interface/permisos";
import { useUsuario } from "@/context/UserContext";

const { Header, Sider, Content } = Layout;

export default function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [permisos, setPermisos] = useState<PermisoLayout[]>([]);
  const { usuario } = useUsuario();

  const fetchPermisos = async () => {
    try {
      const data = await getPermisosMe();
      console.log("se recargo la data de permisos del layout => ", data);
      setPermisos(data);
    } catch (error) {
      console.log("error => ", error);
      message.error("error al traer permisos");
    }
  };

  const tienePermiso = (codigo: string): boolean => {
    if (!Array.isArray(permisos)) return false;
    const existe = permisos.some((permiso) => {
      return permiso.item?.codigo === codigo;
    });

    return existe;
  };

  useEffect(() => {
    const fetch = async () => {
      console.log("usuario => ", usuario);

      await fetchPermisos();
    };
    fetch();
  }, [usuario]);

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
  };

  const userMenu = {
    items: [
      {
        key: "logout",
        label: "Cerrar sesión",
        onClick: () => {
          console.log("Cerrar sesión");
        },
      },
    ],
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      children: [
        { key: "/", label: "Inicio" },
        { key: "/resumen", label: "Resumen" },
      ],
    },
    {
      key: "Gestion de usuarios",
      icon: <UserOutlined />,
      label: "Gestion de usuarios",
      children: [
        tienePermiso("1.1")
          ? { key: "/admin/usuario", label: "Listado de usuarios" }
          : null,
        tienePermiso("1.2")
          ? { key: "/admin/permisos", label: "Permisos" }
          : null,
        tienePermiso("1.3")
          ? { key: "/admin/roles", label: "Gestión de Roles" }
          : null,
        tienePermiso("1.4")
          ? { key: "/admin/areas", label: "Gestión de Áreas" }
          : null,
      ].filter(Boolean),
    },
    {
      key: "Gestion de tickets",
      icon: <UserOutlined />,
      label: "Gestion de tickets",
      children: [
        tienePermiso("2.1")
          ? { key: "/ticket/soporte", label: "Bandeja de tickets" }
          : null,
        tienePermiso("2.2")
          ? { key: "/ticket/admin", label: "Asignar Ticket" }
          : null,
        tienePermiso("2.3") ? { key: "/ticket/", label: "Mis Ticket" } : null,
        tienePermiso("2.4")
          ? { key: "/ticket/crear", label: "Crear Ticket" }
          : null,
      ].filter(Boolean),
    },
    {
      key: "Incidencias y Categorías",
      icon: <UserOutlined />,
      label: "Incidencias y Categorías",
      children: [
        tienePermiso("3.1")
          ? { key: "/admin/incidencia", label: "Gestion de incidencias" }
          : null,
      ].filter(Boolean),
    },
    {
      key: "SLA y Prioridades",
      icon: <UserOutlined />,
      label: "SLA y Prioridades",
      children: [
        tienePermiso("4.1")
          ? { key: "/admin/sla", label: "Configuración SLA" }
          : null,
        tienePermiso("4.2")
          ? { key: "/admin/prioridad", label: "Gestión de Prioridades" }
          : null,
      ].filter(Boolean),
    },
    // {
    //   key: "Reportes y Auditoría",
    //   icon: <UserOutlined />,
    //   label: "Reportes y Auditoría",
    //   children: [
    //     tienePermiso("5.1")
    //       ? { key: "/admin/reportes", label: "Reportes Generales" }
    //       : null,
    //     tienePermiso("5.2")
    //       ? { key: "/admin/auditoria", label: "Log de Auditoría" }
    //       : null,
    //   ].filter(Boolean),
    // },
  ]
    // ⬇️ Esto asegura que no incluyas menús sin hijos
    .map((item) => (item.children.length ? item : null))
    .filter(Boolean);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="text-white text-center py-4 text-lg font-bold">
          Gestión UMA
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          onClick={handleMenuClick}
          style={{ fontSize: 12 }}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header className="bg-white px-4 flex justify-between items-center shadow">
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          />
          <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
            <Button>👋 {usuario?.nombre || "Usuario 123"}</Button>
          </Dropdown>
        </Header>

        <Content className="m-4 p-4 bg-white rounded shadow">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
