// src/components/AntdThemeBridge.tsx
"use client";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useTheme } from "next-themes";

export default function AntdThemeBridge({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
}
