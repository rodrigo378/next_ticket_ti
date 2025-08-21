import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

// IMPORTA PRIMERO EL RESET DE ANTD
import "antd/dist/reset.css";
// LUEGO TUS ESTILOS GLOBALES
import "./globals.css";

import { UserProvider } from "@/context/UserContext";

const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});
const jbMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mesa de Ayuda UMA",
  description: "Gestión de tickets y SLA",
  // Opcional: ícono y metadatos adicionales
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE">
      <body className={`${inter.variable} ${jbMono.variable} antialiased`}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
