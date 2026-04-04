// // src/app/layout.tsx
// import type { Metadata, Viewport } from "next";
// import { Inter, JetBrains_Mono } from "next/font/google";
// import { ThemeProvider } from "next-themes";

// import "antd/dist/reset.css";
// import "./globals.css";

// import ClientAntdTheme from "./ClientAntdTheme";
// import { UserProvider } from "@/context/UserContext";
// import Providers from "./providers";

// const inter = Inter({
//   variable: "--font-ui",
//   subsets: ["latin"],
//   display: "swap",
// });
// const jbMono = JetBrains_Mono({
//   variable: "--font-mono",
//   subsets: ["latin"],
//   display: "swap",
// });

// export const metadata: Metadata = {
//   title: "Mesa de Ayuda UMA",
//   description: "Gestión de tickets y SLA",
// };
// export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="es-PE" suppressHydrationWarning>
//       <body className={`${inter.variable} ${jbMono.variable} antialiased`}>
//         <Providers>
//           <ThemeProvider
//             attribute="class"
//             defaultTheme="light"
//             enableSystem={false}
//             disableTransitionOnChange
//           >
//             <ClientAntdTheme>
//               <UserProvider>{children}</UserProvider>
//             </ClientAntdTheme>
//           </ThemeProvider>
//         </Providers>
//       </body>
//     </html>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import type { Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [seconds, setSeconds] = useState(90); // 1:30

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isMaintenance = seconds > 0;

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
              <UserProvider>
                {/* 🔥 Pantalla de mantenimiento */}
                {isMaintenance ? (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black text-white">
                    <div className="text-center space-y-6">
                      <h1 className="text-3xl font-bold tracking-wide">
                        🚧 Sistema en mantenimiento
                      </h1>

                      <p className="text-gray-400 max-w-md mx-auto">
                        Estamos actualizando la plataforma de tickets para
                        mejorar tu experiencia.
                      </p>

                      {/* ⏱ Contador */}
                      {/* <div className="text-5xl font-mono font-bold tracking-widest">
                        {format}
                      </div> */}

                      {/* <p className="text-gray-500 text-sm">
                        Tiempo estimado de regreso
                      </p> */}

                      {/* Barra animada */}
                      {/* <div className="w-64 h-1 bg-gray-700 mx-auto rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{
                            width: `${(seconds / 90) * 100}%`,
                          }}
                        />
                      </div> */}
                    </div>
                  </div>
                ) : (
                  children
                )}
              </UserProvider>
            </ClientAntdTheme>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
