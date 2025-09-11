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
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#e40d5e",
          colorPrimaryBg: "#fff0f5",
          colorPrimaryBorder: "#f08cab",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
