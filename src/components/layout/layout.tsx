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

const { Header, Sider, Content } = Layout;

export default function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const fetchPermisos = async () => {
    try {
      const data = await getPermisosMe();
      console.log("data => ", data);
    } catch (error) {
      console.log("error => ", error);
      message.error("error al traer permisos");
    }
  };

  useEffect(() => {
    console.log("inicio de layout");
    const fetch = async () => {
      await fetchPermisos();
    };
    fetch();
  });

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
          items={[
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
              key: "usuarios",
              icon: <UserOutlined />,
              label: "Usuarios",
              children: [
                { key: "/admin/usuario", label: "Listado de usuarios" },
                { key: "/admin/permisos", label: "Permisos" },
              ],
            },
            {
              key: "ticket_ti",
              icon: <UserOutlined />,
              label: "Ticket Ti",
              children: [
                { key: "/ticket_ti/ticket", label: "Listado Tickets" },
                { key: "/ticket_ti/ticket/crear", label: "Crear Ticket" },
              ],
            },
          ]}
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
            <Button shape="circle" icon={<UserOutlined />} />
          </Dropdown>
        </Header>

        <Content className="m-4 p-4 bg-white rounded shadow">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
