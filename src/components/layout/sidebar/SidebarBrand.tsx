// src/components/layout/Sidebar/SidebarBrand.tsx
"use client";

// ===================================================================================
export default function SidebarBrand({ collapsed }: { collapsed?: boolean }) {
  // ===================================================================================
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {!collapsed && (
        <div className="text-lg font-bold leading-none fixed-sider__brand">
          Gestión UMA
        </div>
      )}
    </div>
  );
}
