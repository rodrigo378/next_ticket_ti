// app/layout.tsx

import "antd/dist/reset.css";
import "../globals.css";
import { ReactNode } from "react";
import MainLayout from "@/components/layout/layout";

export const metadata = {
  title: "Mi App",
  description: "Aplicación Next.js con Ant Design y layout global",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <MainLayout>{children}</MainLayout>
    </div>
  );
}
