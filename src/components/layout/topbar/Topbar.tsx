// src/components/layout/Topbar/Topbar.tsx
"use client";
import { Layout, Button } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import ThemeToggle from "@/components/ThemeToggle";
import UserDropdown from "./UserDropdown";

const { Header } = Layout;

// ===================================================================================
type TopbarProps = {
  isDesktop: boolean;
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenDrawer: () => void;
  usuarioEmail?: string;
  onLogout: () => void;
};

// ===================================================================================
export default function Topbar({
  isDesktop,
  collapsed,
  onToggleSidebar,
  onOpenDrawer,
  usuarioEmail,
  onLogout,
}: TopbarProps) {
  // ===================================================================================
  return (
    <Header className="px-4 flex justify-between items-center bg-background text-foreground border-b border-black/5 dark:border-white/10">
      <Button
        type="text"
        onClick={() => (isDesktop ? onToggleSidebar() : onOpenDrawer())}
        icon={
          isDesktop ? (
            collapsed ? (
              <MenuUnfoldOutlined />
            ) : (
              <MenuFoldOutlined />
            )
          ) : (
            <MenuUnfoldOutlined />
          )
        }
        className="text-foreground"
      />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserDropdown email={usuarioEmail} onLogout={onLogout} />
      </div>
    </Header>
  );
}
