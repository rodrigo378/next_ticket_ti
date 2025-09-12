"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Layout, Menu, Dropdown, Button, message, Spin } from "antd";
import type { MenuProps } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { useUsuario } from "@/context/UserContext";
import {
  IamMenuGroup,
  IamMenuItem,
  IamMenuModule,
} from "@/interface/core/layout";
import { getFullMenu } from "@/services/core/iam";
import { logout } from "@/services/core/auth";
import ThemeToggle from "@/components/ThemeToggle";

const { Header, Sider, Content } = Layout;

/* ---------- colores fijos del sidebar ---------- */
const SIDER = {
  bg: "#1f2937", // slate-800
  bgHover: "#243447",
  bgActive: "#334155", // slate-700
  border: "rgba(255,255,255,0.06)",
  text: "#cbd5e1", // slate-300
  textMuted: "#94a3b8", // slate-400
  textActive: "#ffffff",
};
/* ---------------------------------------------- */

const DefaultBullet = (
  <svg viewBox="0 0 8 8" aria-hidden="true" className="h-1.5 w-1.5">
    <circle cx="4" cy="4" r="3" fill="currentColor" />
  </svg>
);

const byOrder = <T extends { order?: number }>(a: T, b: T) =>
  (a.order ?? 99999) - (b.order ?? 99999);

const ItemLabel = ({
  text,
  href,
  onNavigateStart,
}: {
  text: string;
  href?: string;
  onNavigateStart?: () => void;
}) =>
  href ? (
    <Link
      href={href}
      prefetch
      onClick={onNavigateStart}
      className="block font-semibold whitespace-normal leading-tight fixed-sider__link"
    >
      {text}
    </Link>
  ) : (
    <span className="font-semibold whitespace-normal leading-tight fixed-sider__link">
      {text}
    </span>
  );

function renderModuleIcon(icon?: string, className?: string): React.ReactNode {
  if (!icon) return DefaultBullet;
  const s = icon.trim();
  if (!s.toLowerCase().endsWith(".svg")) return DefaultBullet;
  const src = s.startsWith("/") ? s : `/${s}`;
  return (
    <Image
      src={src}
      alt=""
      width={1}
      height={1}
      className={className ?? "h-4 w-4 object-contain fixed-sider__icon"}
      priority={false}
    />
  );
}

function toAntdItems(
  mods: IamMenuModule[],
  opts?: { collapsed?: boolean; onNavigateStart?: () => void }
): MenuProps["items"] {
  const items: Required<MenuProps>["items"] = [];
  const sorted = [...mods].sort(byOrder);
  const isCollapsed = !!opts?.collapsed;

  sorted.forEach((mod, idx) => {
    const modIcon = mod.icono;

    if (!isCollapsed) {
      if (idx > 0) items.push({ type: "divider" });
      items.push({
        key: `${mod.key}__section`,
        label: (
          <span className="flex items-center gap-2 px-3 pt-2 pb-1 text-[11px] font-bold tracking-wide uppercase select-none fixed-sider__section">
            {renderModuleIcon(
              modIcon,
              "h-[1.2rem] w-[1.2rem] object-contain fixed-sider__icon"
            )}
            <span>{mod.label}</span>
          </span>
        ),
        disabled: true,
      });
    }

    (mod.groups ?? []).sort(byOrder).forEach((g: IamMenuGroup) => {
      const children =
        (g.children ?? []).sort(byOrder).map((it: IamMenuItem) => ({
          key: it.path ?? it.key,
          label: (
            <ItemLabel
              text={String(it.label)}
              href={
                it.path ??
                (it.key?.toString().startsWith("/")
                  ? (it.key as string)
                  : undefined)
              }
              onNavigateStart={opts?.onNavigateStart}
            />
          ),
          icon: DefaultBullet,
        })) || [];

      if (children.length) {
        items.push({
          key: g.key,
          label: (
            <span className="font-bold fixed-sider__group">{g.label}</span>
          ),
          icon: DefaultBullet,
          children,
        } as never);
      }
    });
  });

  return items;
}

/* --- mapeo rutas hijas → clave de menú --- */
const routeMap: Array<{ test: RegExp; key: string }> = [
  { test: /^\/hd\/ticket\/\d+$/, key: "/hd/ticket" },
];
function mapPathToMenuKey(pathname: string): string {
  const hit = routeMap.find((r) => r.test.test(pathname));
  return hit?.key ?? pathname;
}
/* ----------------------------------------- */

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
  const [navigating, setNavigating] = useState(false);

  const findGroupKeyByPath = (mods: IamMenuModule[], path: string) => {
    for (const m of mods) {
      for (const g of m.groups ?? []) {
        if (
          (g.children ?? []).some((it) => it.path === path || it.key === path)
        ) {
          return g.key;
        }
      }
    }
    return undefined;
  };

  const items = useMemo(
    () =>
      toAntdItems(modules, {
        collapsed,
        onNavigateStart: () => setNavigating(true),
      }),
    [modules, collapsed]
  );

  const selectedKey = useMemo(() => mapPathToMenuKey(pathname), [pathname]);

  useEffect(() => {
    (async () => {
      try {
        const data: IamMenuModule[] = await getFullMenu();
        setModules(data);
      } catch (err) {
        console.error("Error menú:", err);
        message.error("No se pudo cargar el menú");
      }
    })();
  }, [usuario]);

  useEffect(() => {
    const k = findGroupKeyByPath(modules, selectedKey);
    setOpenKeys(k ? [k] : []);
    if (navigating) {
      const t = setTimeout(() => setNavigating(false), 120);
      return () => clearTimeout(t);
    }
  }, [modules, selectedKey, navigating]);

  const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
    const latest = keys.find((k) => !openKeys.includes(k as string));
    setOpenKeys(latest ? [latest as string] : []);
  };

  const onLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn("logout error (continuamos):", e);
    } finally {
      message.success("Sesión cerrada");
      router.push("/login");
      router.refresh();
    }
  };

  const userMenu: MenuProps = {
    items: [{ key: "logout", label: "Cerrar sesión", onClick: onLogout }],
  };

  return (
    <Layout className="min-h-screen bg-background text-foreground">
      {/* Sidebar fijo (NO depende del tema) */}
      {/* Sidebar fijo (NO depende del tema) */}
      <Sider
        theme="dark"
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={270}
        collapsedWidth={76}
        className="fixed-sider"
      >
        <div className="flex items-center justify-center gap-2 py-4">
          {!collapsed && (
            <div className="text-lg font-bold leading-none fixed-sider__brand">
              Gestión UMA
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={[selectedKey]}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={onOpenChange}
          inlineIndent={14}
          inlineCollapsed={collapsed}
          className="px-2 pb-3 fixed-sider__menu"
        />
      </Sider>

      {/* Topbar + contenido: SIGUEN el tema */}
      <Layout>
        <Header className="px-4 flex justify-between items-center bg-background text-foreground border-b border-black/5 dark:border-white/10">
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            className="text-foreground"
          />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Dropdown
              menu={userMenu}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button className="text-left">
                <span className="block font-semibold">
                  {usuario?.email ?? "Usuario"}
                </span>
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Spin spinning={navigating} size="large">
          <Content className="m-4 p-4 rounded-lg shadow-sm min-h-[60vh] bg-background text-foreground">
            {children}
          </Content>
        </Spin>
      </Layout>

      {/* Estilos fijos SOLO para el sidebar */}
      <style jsx global>{`
        .fixed-sider {
          background: ${SIDER.bg} !important;
          border-right: 1px solid ${SIDER.border};
        }
        .fixed-sider .ant-layout-sider-trigger {
          background: ${SIDER.bgActive} !important;
          color: ${SIDER.text};
          border-top: 1px solid ${SIDER.border};
        }
        .fixed-sider__brand {
          color: ${SIDER.textActive};
        }
        .fixed-sider__menu,
        .fixed-sider .ant-menu-dark,
        .fixed-sider .ant-menu {
          background: ${SIDER.bg} !important;
        }
        .fixed-sider .ant-menu-item,
        .fixed-sider .ant-menu-submenu-title {
          color: ${SIDER.text} !important;
        }
        .fixed-sider .ant-menu-item:hover,
        .fixed-sider .ant-menu-submenu-title:hover {
          background: ${SIDER.bgHover} !important;
          color: ${SIDER.textActive} !important;
        }
        .fixed-sider .ant-menu-item-selected {
          background: ${SIDER.bgActive} !important;
          color: ${SIDER.textActive} !important;
        }
        .fixed-sider .ant-menu-item-selected .fixed-sider__link {
          color: ${SIDER.textActive} !important;
        }
        .fixed-sider__link {
          color: ${SIDER.text} !important;
        }
        .fixed-sider__icon {
          filter: invert(0.86);
        }
        .fixed-sider__section {
          color: ${SIDER.textMuted};
        }
        .fixed-sider__group {
          color: ${SIDER.text};
        }
      `}</style>
    </Layout>
  );
}
