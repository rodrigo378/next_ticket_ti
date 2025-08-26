"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Layout, Menu, Dropdown, Button, message } from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SafetyOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { useUsuario } from "@/context/UserContext";
import {
  IamMenuGroup,
  IamMenuItem,
  IamMenuModule,
} from "@/interface/core/layout";
import { getFullMenu } from "@/services/core/iam";

const { Header, Sider, Content } = Layout;

const BRAND = "#ec244f";

// Iconos desde backend
const ICONS: Record<string, React.ReactNode> = {
  UserOutlined: <UserOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  DashboardOutlined: <DashboardOutlined />,
};

// Bullet por defecto para evitar letras al colapsar
const DefaultBullet = <span className="menu-dot" />;

const byOrder = <T extends { order?: number }>(a: T, b: T) =>
  (a.order ?? 9999) - (b.order ?? 9999);

const asLabel = (text: string) => (
  <span className="menu-label" title={text}>
    {text}
  </span>
);

// Transforma /iam/menu → items de AntD
function toAntdItems(mods: IamMenuModule[]): MenuProps["items"] {
  const items: Required<MenuProps>["items"] = [];
  const sorted = [...mods].sort(byOrder);

  sorted.forEach((mod, idx) => {
    if (idx > 0) items.push({ type: "divider" });
    // Título de sección (no clickeable)
    items.push({
      key: `${mod.key}__section`,
      label: <span className="menu-section-title">{mod.label}</span>,
      disabled: true,
    });
    (mod.groups ?? []).sort(byOrder).forEach((g: IamMenuGroup) => {
      const children =
        (g.children ?? []).sort(byOrder).map((it: IamMenuItem) => ({
          key: it.path,
          label: asLabel(it.label),
          // icono real o bullet por defecto
          icon: it.icon ? ICONS[it.icon] ?? DefaultBullet : DefaultBullet,
        })) || [];
      if (children.length) {
        items.push({
          key: g.key,
          label: g.label,
          icon: DefaultBullet, // <- para que al colapsar no aparezca la letra del grupo
          children,
        } as never);
      }
    });
  });
  return items;
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario } = useUsuario();

  const [collapsed, setCollapsed] = useState(false);
  const [modules, setModules] = useState<IamMenuModule[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const items = useMemo(() => toAntdItems(modules), [modules]);

  useEffect(() => {
    console.log("del contex => ", usuario);

    (async () => {
      try {
        const data: IamMenuModule[] = await getFullMenu();
        setModules(data);
        // abrir grupos por defecto
        const keys: string[] = [];
        for (const m of data) for (const g of m.groups ?? []) keys.push(g.key);
        setOpenKeys(keys);
      } catch (err) {
        console.error("Error menú:", err);
        message.error("No se pudo cargar el menú");
      }
    })();
  }, [usuario]);

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (typeof key === "string" && key.startsWith("/")) router.push(key);
  };

  const userMenu = {
    items: [
      {
        key: "logout",
        label: "Cerrar sesión",
        onClick: () => {
          localStorage.removeItem("token");
          router.push("/login");
        },
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme="dark"
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={270}
        collapsedWidth={76}
        style={{ background: BRAND }}
      >
        {/* Brand */}
        <div className="brand-wrap">
          <div className="brand-icon">UMA</div>
          <div className="brand-text">Gestión UMA</div>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={items}
          onClick={handleMenuClick}
          selectedKeys={[pathname]}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={(keys) => setOpenKeys(keys as string[])}
          inlineIndent={14}
          inlineCollapsed={collapsed} // <- importante
          style={{ fontSize: 14, padding: "4px 10px 14px" }}
        />
      </Sider>

      <Layout>
        <Header className="bg-white px-4 flex justify-between items-center shadow-sm">
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          />
          <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
            <Button>{usuario?.email}</Button>
          </Dropdown>
        </Header>

        <Content className="m-4 p-4 bg-white rounded-lg shadow-sm">
          {children}
        </Content>
      </Layout>

      {/* Estilos */}
      <style jsx global>{`
        .ant-layout-sider,
        .ant-menu-dark,
        .ant-menu-dark .ant-menu-sub,
        .ant-menu-dark .ant-menu-inline {
          background: ${BRAND} !important;
        }

        /* ===== Brand ===== */
        .brand-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 14px 10px;
          color: #fff;
        }
        .brand-icon {
          width: 36px;
          height: 36px;
          line-height: 36px;
          text-align: center;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.18);
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .brand-text {
          font-size: 16px;
          font-weight: 700;
          line-height: 1.1;
        }
        /* Ocultar textos al colapsar */
        .ant-layout-sider-collapsed .brand-text {
          display: none;
        }
        .ant-layout-sider-collapsed .brand-wrap {
          justify-content: center;
        }

        /* ===== Secciones y divisores ===== */
        .menu-section-title {
          display: block;
          padding: 10px 12px 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
          user-select: none;
        }
        .ant-menu-dark.ant-menu-inline .ant-menu-item-divider {
          height: 1px;
          margin: 8px 12px;
          background: rgba(255, 255, 255, 0.25);
        }
        /* Ocultar encabezados/divisores al colapsar */
        .ant-layout-sider-collapsed .menu-section-title,
        .ant-layout-sider-collapsed .ant-menu-item-divider {
          display: none;
        }

        /* ===== Submenús (grupos) ===== */
        .ant-menu-inline .ant-menu-submenu .ant-menu-submenu-title {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
          border-radius: 8px;
          padding: 10px 12px !important;
          margin: 2px 6px 2px;
        }
        .ant-menu-submenu-title:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        /* ===== Items ===== */
        .ant-menu-inline .ant-menu-sub .ant-menu-item {
          padding-left: 22px !important;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
          border-radius: 8px;
          margin: 2px 6px;
          color: #fff;
        }

        /* Label multilinea */
        .menu-label,
        .ant-menu-title-content {
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
          line-height: 1.32;
        }

        /* Hover / selected */
        .ant-menu-dark .ant-menu-item:hover {
          background: rgba(255, 255, 255, 0.16) !important;
          color: #fff !important;
        }
        .ant-menu-dark .ant-menu-item-selected {
          background: rgba(255, 255, 255, 0.26) !important;
          color: #fff !important;
          font-weight: 600;
        }

        /* ===== Icono por defecto (bullet) ===== */
        .menu-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.14) inset;
        }

        /* Ajustes cuando está colapsado: centra ítems e iconos */
        .ant-layout-sider-collapsed .ant-menu-inline .ant-menu-item,
        .ant-layout-sider-collapsed
          .ant-menu-inline
          .ant-menu-submenu
          > .ant-menu-submenu-title {
          padding-left: 12px !important;
          padding-right: 12px !important;
          text-align: center;
        }
      `}</style>
    </Layout>
  );
}
