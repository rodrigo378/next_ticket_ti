// src/components/layout/Sidebar/MobileSidebarDrawer.tsx
"use client";
import { Drawer } from "antd";
import type { MenuProps } from "antd";
import SidebarMenu from "./SidebarMenu";
import { SIDER } from "./menu-utils";
import "./sidebar.styles.css";

// ===================================================================================
type MobileSidebarDrawerProps = {
  open: boolean;
  onClose: () => void;
  items: MenuProps["items"];
  selectedKey: string;
  openKeys: string[];
  onOpenChange: MenuProps["onOpenChange"];
};

// ===================================================================================
export default function MobileSidebarDrawer({
  open,
  onClose,
  items,
  selectedKey,
  openKeys,
  onOpenChange,
}: MobileSidebarDrawerProps) {
  // ===================================================================================
  return (
    <Drawer
      placement="left"
      width={280}
      open={open}
      onClose={onClose}
      className="fixed-sider__drawer"
      styles={{
        header: { display: "none" },
        content: {
          background: SIDER.bg,
          borderRight: `1px solid ${SIDER.border}`,
        },
        body: { padding: 0, background: SIDER.bg },
        mask: { backgroundColor: "rgba(0,0,0,0.45)" },
      }}
    >
      <div
        className="flex items-center justify-center gap-2 py-4"
        style={{ background: SIDER.bg }}
      >
        <div className="text-lg font-bold leading-none fixed-sider__brand">
          Gestión UMA
        </div>
      </div>
      <SidebarMenu
        items={items}
        selectedKey={selectedKey}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
      />
    </Drawer>
  );
}
