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

const { Header, Sider, Content } = Layout;

const DefaultBullet = (
  <svg
    viewBox="0 0 8 8"
    aria-hidden="true"
    className="h-1.5 w-1.5 text-white/90"
  >
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
      className="block text-white font-bold whitespace-normal leading-tight"
    >
      {text}
    </Link>
  ) : (
    <span className="text-white font-bold whitespace-normal leading-tight">
      {text}
    </span>
  );

function renderModuleIcon(icon?: string, className?: string): React.ReactNode {
  if (!icon) return DefaultBullet;
  const s = icon.trim();
  if (!s.toLowerCase().endsWith(".svg")) return DefaultBullet;
  const src = s.startsWith("/") ? s : `/${s}`; // debe existir en /public
  return (
    <Image
      src={src}
      alt=""
      width={1}
      height={1}
      className={className ?? "h-4 w-4 object-contain invert"}
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
          <span className="flex items-center gap-2 px-3 pt-2 pb-1 text-[11px] font-bold tracking-wide uppercase text-white select-none">
            {renderModuleIcon(
              modIcon,
              "h-[1.2rem] w-[1.2rem] object-contain invert"
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
          icon: DefaultBullet, // <- solo bullet
        })) || [];

      if (children.length) {
        items.push({
          key: g.key,
          label: <span className="text-white font-bold">{g.label}</span>,
          icon: DefaultBullet, // <- solo bullet
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
  const [navigating, setNavigating] = useState(false); // Loader de navegación

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
    const k = findGroupKeyByPath(modules, pathname);
    setOpenKeys(k ? [k] : []);
    if (navigating) {
      const t = setTimeout(() => setNavigating(false), 100);
      return () => clearTimeout(t);
    }
  }, [modules, pathname, navigating]);

  const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
    const latest = keys.find((k) => !openKeys.includes(k as string));
    setOpenKeys(latest ? [latest as string] : []);
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
    <Layout className="min-h-screen">
      <Sider
        theme="dark"
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={270}
        collapsedWidth={76}
        className="bg-[#1e2939] border-r border-black text-white"
      >
        <div className="flex items-center justify-center gap-2 py-4 text-white">
          {!collapsed && (
            <div className="text-lg font-bold leading-none">Gestión UMA</div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={[pathname]}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={onOpenChange}
          inlineIndent={14}
          inlineCollapsed={collapsed}
          className="bg-transparent text-[14px] px-2 pb-3"
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
            <Button className="text-left">
              <span className="block font-semibold">
                {usuario?.email ?? "Usuario"}
              </span>
            </Button>
          </Dropdown>
        </Header>

        <Spin spinning={navigating} size="large">
          <Content className="m-4 p-4 bg-white rounded-lg shadow-sm min-h-[60vh]">
            {children}
          </Content>
        </Spin>
      </Layout>
    </Layout>
  );
}
