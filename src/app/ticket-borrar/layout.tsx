// app/layout.tsx

import "antd/dist/reset.css";
import "../../globals.css";
import { ReactNode } from "react";
import LayoutSecundario from "@/components/layout/layout_secundario";

export const metadata = {
  title: "Mi App",
  description: "Aplicación Next.js con Ant Design y layout global",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <LayoutSecundario>{children}</LayoutSecundario>
      </body>
    </html>
  );
}
