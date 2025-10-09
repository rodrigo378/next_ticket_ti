// src/components/layout/Topbar/UserDropdown.tsx
"use client";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";

// ===================================================================================
type Props = {
  email?: string;
  onLogout: () => void;
};

// ===================================================================================
export default function UserDropdown({ email, onLogout }: Props) {
  // ===================================================================================
  const userMenu: MenuProps = {
    items: [{ key: "logout", label: "Cerrar sesión", onClick: onLogout }],
  };

  // ===================================================================================
  return (
    <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
      <Button className="text-left">
        <span className="block font-semibold">{email ?? "Usuario"}</span>
      </Button>
    </Dropdown>
  );
}
