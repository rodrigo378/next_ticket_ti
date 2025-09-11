// src/app/login/login-client.tsx
"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export default function LoginClient() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);

  // Slider superior (loader)
  const [booting, setBooting] = useState(true);
  const [progress, setProgress] = useState(0);

  // Gate de estilos: no mostramos UI hasta que Tailwind esté cargado
  const [styled, setStyled] = useState(false);
  useEffect(() => {
    const testStylesReady = () => {
      const el = document.createElement("div");
      el.className = "hidden";
      document.body.appendChild(el);
      const ok = getComputedStyle(el).display === "none";
      el.remove();
      setStyled(ok);
    };
    requestAnimationFrame(testStylesReady);
    const t = setTimeout(() => setStyled(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(95, p + (10 + Math.random() * 20));
      setProgress(p);
    }, 180);
    const finish = () => {
      setProgress(100);
      setTimeout(() => setBooting(false), 350);
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish);
    return () => {
      clearInterval(id);
      window.removeEventListener("load", finish);
    };
  }, []);

  const handleMicrosoftLogin = () => {
    if (loading) return;
    setLoading(true);

    // El middleware ya puso ?returnTo=... cuando te mandó a /login
    const rt = searchParams.get("returnTo") || "/";
    const url = `${API_BASE}/auth/login?returnTo=${encodeURIComponent(rt)}`;
    window.location.href = url; // → backend hace OAuth, setea cookie y redirige al front
  };

  return (
    <>
      {/* Slider superior */}
      {booting && (
        <div className="fixed top-0 left-0 right-0 z-[1000] h-1">
          <div
            className="h-full transition-[width] duration-200 ease-out overflow-hidden shadow-sm"
            style={{ width: `${progress}%` }}
          >
            <div className="h-full w-full bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600" />
          </div>
        </div>
      )}

      {/* Gate de estilos */}
      <div
        style={{
          visibility: styled ? "visible" : "hidden",
          minHeight: "100vh",
        }}
      >
        {/* Fondo */}
        <div className="relative min-h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center bg-[url('/assets/fondo_login.jfif')]">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Card centrada */}
          <div className="relative z-10 w-full max-w-xl px-6 py-10 sm:px-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8 sm:p-10">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center pb-4">
                Ingrese con su correo institucional
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                Use su cuenta <strong>@uma.edu.pe</strong>. Presione el botón
                para continuar con Microsoft.
              </p>

              {/* Botón grande Outlook */}
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                disabled={loading}
                aria-busy={loading}
                className="mt-7 w-full h-14 rounded-full font-semibold tracking-wide
                           bg-red-600 text-white shadow-lg hover:bg-red-700
                           transition-colors disabled:opacity-80 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-red-300"
                title="Ingresar con su correo institucional"
                aria-label="Ingresar con su correo institucional"
              >
                {loading ? (
                  <span
                    className="inline-block align-middle h-6 w-6 rounded-full border-2 border-white/70 border-t-transparent animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="inline-flex items-center justify-center gap-3">
                    <Image
                      src="/svg/outlook.svg"
                      alt="Microsoft"
                      width={28}
                      height={28}
                      priority
                    />
                    <span className="text-base sm:text-lg">
                      Ingresar con Microsoft
                    </span>
                  </span>
                )}
              </button>

              <div className="mt-5 flex items-center justify-between text-sm text-slate-600">
                <span />
                <a href="#" className="hover:underline">
                  Ingresar con cuenta local
                </a>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-white/80">
              Mesa de Ayuda UMA
            </div>
          </div>
        </div>
      </div>

      {/* Fallback ultra simple (por si styled=false unos ms) */}
      {!styled && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "#ffffff",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "3px solid rgba(0,0,0,0.18)",
              borderTopColor: "transparent",
              animation: "spin .8s linear infinite",
            }}
          />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </>
  );
}
