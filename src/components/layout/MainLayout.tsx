// src/components/layout/MainLayout.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Layout, Spin, Grid, message } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { useUsuario } from "@/context/UserContext";
import type { MenuProps } from "antd";
import type { IamMenuModule } from "@interfaces/core/layout";

import { toAntdItems, mapPathToMenuKey } from "./sidebar/menu-utils";
import Sidebar from "./sidebar/Sidebar";
import Topbar from "./topbar/Topbar";
import MobileSidebarDrawer from "./sidebar/MobileSidebarDrawer";
import { useLogout } from "./hook/useLogout";
import { useIamMenu } from "./hook/useIamMenu";

const { Content } = Layout;
const { useBreakpoint } = Grid;

// ===================================================================================
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ===================================================================================
  const router = useRouter();
  const pathname = usePathname();
  const { usuario } = useUsuario();
  const screens = useBreakpoint();
  const isDesktop = screens.lg ?? false;

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [navigating, setNavigating] = useState(false);

  const {
    data: modules = [],
    isFetching: isFetchingMenu,
    isError: isMenuError,
    error: menuError,
  } = useIamMenu(usuario?.id);

  // ===================================================================================
  useEffect(() => {
    if (isMenuError) {
      console.error("Error menú:", menuError);
      message.error("No se pudo cargar el menú");
    }
  }, [isMenuError, menuError]);

  // ===================================================================================
  const items: MenuProps["items"] = useMemo(
    () =>
      toAntdItems(modules, {
        collapsed: isDesktop ? collapsed : false,
        onNavigateStart: () => {
          setNavigating(true);
          if (!isDesktop) setDrawerOpen(false);
        },
      }),
    [modules, collapsed, isDesktop]
  );

  // ===================================================================================
  const selectedKey = useMemo(() => mapPathToMenuKey(pathname), [pathname]);

  // ===================================================================================
  useEffect(() => {
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

    const k = findGroupKeyByPath(modules, selectedKey);
    setOpenKeys(k ? [k] : []);
    if (navigating) {
      const t = setTimeout(() => setNavigating(false), 120);
      return () => clearTimeout(t);
    }
  }, [modules, selectedKey, navigating]);

  // ===================================================================================
  const onOpenChange: MenuProps["onOpenChange"] = (keys) => {
    setOpenKeys((prev) => {
      const latest = keys.find((k) => !prev.includes(k as string));
      return latest ? [latest as string] : [];
    });
  };

  // ===================================================================================
  const logoutMut = useLogout();
  const onLogout = async () => {
    try {
      await logoutMut.mutateAsync();
    } catch (e) {
      // no bloquear logout si falla red
      console.warn("logout error (continuamos):", e);
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  // ===================================================================================
  return (
    <Layout className="min-h-screen bg-background text-foreground">
      {isDesktop && (
        <Sidebar
          collapsed={collapsed}
          items={items}
          selectedKey={selectedKey}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
        />
      )}

      <Layout
        style={{
          marginLeft: isDesktop ? (collapsed ? 76 : 270) : 0,
          transition: "margin-left .2s ease",
        }}
      >
        <Topbar
          isDesktop={isDesktop}
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed((c) => !c)}
          onOpenDrawer={() => setDrawerOpen(true)}
          usuarioEmail={usuario?.email ?? "Usuario"}
          onLogout={onLogout}
        />

        <Spin spinning={navigating || isFetchingMenu} size="large">
          <Content className="m-4 p-4 rounded-lg shadow-sm min-h-[60vh] bg-background text-foreground">
            {children}
          </Content>
        </Spin>
      </Layout>

      {!isDesktop && (
        <MobileSidebarDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          items={items}
          selectedKey={selectedKey}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
        />
      )}
    </Layout>
  );
}
