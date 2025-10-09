// src/components/layout/Sidebar/SidebarMenu.tsx
"use client";
import { Menu } from "antd";
import type { MenuProps } from "antd";

// ===================================================================================
type SidebarMenuProps = {
  items: MenuProps["items"];
  selectedKey: string;
  openKeys: string[];
  onOpenChange: MenuProps["onOpenChange"];
  inlineCollapsed?: boolean;
  className?: string;
};

// ===================================================================================
export default function SidebarMenu({
  items,
  selectedKey,
  openKeys,
  onOpenChange,
  inlineCollapsed,
  className,
}: SidebarMenuProps) {
  // ===================================================================================
  return (
    <Menu
      theme="dark"
      mode="inline"
      items={items}
      selectedKeys={[selectedKey]}
      openKeys={inlineCollapsed ? [] : openKeys}
      onOpenChange={onOpenChange}
      inlineIndent={14}
      inlineCollapsed={inlineCollapsed}
      className={className ?? "px-2 pb-3 fixed-sider__menu"}
    />
  );
}
