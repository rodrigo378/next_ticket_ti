// src/app/ClientAntdTheme.tsx
"use client";

import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "next-themes";

export default function ClientAntdTheme({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme(); // 'light' | 'dark'
  const isDark = resolvedTheme === "dark";

  return (
    <ConfigProvider
      theme={{
        // ✅ Tu configuración original (no cambia)
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#e40d5e",
          // colorPrimaryBg: "#fff0f5",
          // colorPrimaryBorder: "#f08cab",

          // ──────────────────────────────────────────────────────────────
          // 👇👇 TOKENS COMUNES (SOLO REFERENCIA) — DEJAR COMENTADOS 👇👇
          // colorText: "#0f172a",            // texto principal
          // colorTextSecondary: "#475569",   // texto secundario
          // colorBgLayout: "#f6f7fb",        // fondo general de la página
          // colorBgContainer: "#ffffff",     // fondo de Card, Input, Select
          // colorBgElevated: "#ffffff",      // fondo de popups / dropdowns
          // colorBorder: "rgba(2,6,23,0.12)",// bordes principales
          // colorBorderSecondary: "rgba(2,6,23,0.08)", // bordes sutiles
          // colorFillSecondary: "rgba(15,23,42,0.03)", // zebra/hover suave
          // controlItemBgHover: "rgba(15,23,42,0.05)",  // hover en opciones
          // controlItemBgActive: "rgba(15,23,42,0.08)", // opción seleccionada
          // borderRadius: 10,                 // radio global
          // boxShadow: "0 6px 20px rgba(0,0,0,0.08)", // sombra genérica
          // controlHeight: 36,                // altura de controles
          // ──────────────────────────────────────────────────────────────
        },

        // ──────────────────────────────────────────────────────────────
        // ⚙️ OVERRIDES DE COMPONENTES (EJEMPLOS) — DEJAR COMENTADO
        // components: {
        //   Button: {
        //     // Estado primary del botón
        //     // colorPrimary: "#e40d5e",
        //     // colorPrimaryHover: "#f1186b",
        //     // colorPrimaryActive: "#c60a52",
        //     // primaryShadow: "none",
        //     // borderRadius: 10,
        //   },
        //   Select: {
        //     // optionSelectedBg: "var(--ant-control-item-bg-active)",
        //     // optionActiveBg: "var(--ant-control-item-bg-hover)",
        //   },
        //   Table: {
        //     // headerBg: "#f7f8fb",
        //     // rowHoverBg: "rgba(15,23,42,0.03)",
        //   },
        //   Card: {
        //     // borderRadiusLG: 14,
        //     // boxShadowTertiary: "0 6px 20px rgba(0,0,0,0.06)",
        //   },
        //   Tabs: {
        //     // inkBarColor: "#e40d5e",
        //   },
        //   Modal: {
        //     // borderRadiusLG: 16,
        //   },
        //   Tag: {
        //     // defaultBg: "rgba(15,23,42,0.04)",
        //   },
        // },
        // ──────────────────────────────────────────────────────────────

        // 🔧 Variables CSS de Ant Design (útil para global.css) — DEJAR COMENTADO
        // cssVar: true,
      }}
    >
      {children}
    </ConfigProvider>
  );
}
