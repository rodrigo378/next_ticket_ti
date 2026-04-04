// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import "antd/dist/reset.css";
import "./globals.css";

import ClientAntdTheme from "./ClientAntdTheme";
import { UserProvider } from "@/context/UserContext";
import Providers from "./providers";

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
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-PE" suppressHydrationWarning>
      <body className={`${inter.variable} ${jbMono.variable} antialiased`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ClientAntdTheme>
              <UserProvider>{children}</UserProvider>
            </ClientAntdTheme>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
