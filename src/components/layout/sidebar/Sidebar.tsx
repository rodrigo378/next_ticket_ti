// src/components/layout/Sidebar/Sidebar.tsx
"use client";
import { Layout } from "antd";
import type { MenuProps } from "antd";
import SidebarBrand from "./SidebarBrand";
import SidebarMenu from "./SidebarMenu";
import "./sidebar.styles.css";

const { Sider } = Layout;

// ===================================================================================
type SidebarProps = {
  collapsed: boolean;
  items: MenuProps["items"];
  selectedKey: string;
  openKeys: string[];
  onOpenChange: MenuProps["onOpenChange"];
  width?: number;
  collapsedWidth?: number;
};

// ===================================================================================
export default function Sidebar({
  collapsed,
  items,
  selectedKey,
  openKeys,
  onOpenChange,
  width = 270,
  collapsedWidth = 76,
}: SidebarProps) {
  // ===================================================================================
  return (
    <Sider
      theme="dark"
      collapsed={collapsed}
      width={width}
      collapsedWidth={collapsedWidth}
      breakpoint="lg"
      className="fixed-sider"
      trigger={null}
    >
      <SidebarBrand collapsed={collapsed} />
      <SidebarMenu
        items={items}
        selectedKey={selectedKey}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        inlineCollapsed={collapsed}
      />
    </Sider>
  );
}
