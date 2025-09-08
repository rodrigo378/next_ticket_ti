// src/app/login/login-client.tsx
"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);

  // Slider superior (tu loader)
  const [booting, setBooting] = useState(true);
  const [progress, setProgress] = useState(0);

  // ✅ Gate de estilos: no mostramos UI hasta que Tailwind esté cargado
  const [styled, setStyled] = useState(false);
  useEffect(() => {
    const testStylesReady = () => {
      const el = document.createElement("div");
      el.className = "hidden"; // clase de Tailwind
      document.body.appendChild(el);
      const ok = getComputedStyle(el).display === "none";
      el.remove();
      setStyled(ok);
    };
    // 1er frame del cliente
    requestAnimationFrame(testStylesReady);

    // Fallback por si algo se demora (no se queda “invisible”)
    const t = setTimeout(() => setStyled(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    console.log("api_Base => ", API_BASE);
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

  // Si ya hay token, sal de /login
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("token")) router.push("/");
  }, [router]);

  // Captura ?token=... y redirige
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    const returnTo = searchParams.get("returnTo") || "/";
    if (typeof window === "undefined" || !tokenFromUrl) return;

    localStorage.setItem("token", tokenFromUrl);

    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    url.searchParams.delete("returnTo");
    const qs = url.searchParams.toString();
    window.history.replaceState({}, "", url.pathname + (qs ? `?${qs}` : ""));

    router.replace(returnTo);
  }, [router, searchParams]);

  const handleMicrosoftLogin = () => {
    if (loading) return;
    setLoading(true);

    const current =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/";
    const url = `${API_BASE}/auth/login?returnTo=${encodeURIComponent(
      current || "/"
    )}`;
    window.location.href = url;
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

      {/* 🔒 Gate de estilos: oculto hasta que Tailwind esté listo */}
      <div
        style={{
          visibility: styled ? "visible" : "hidden",
          minHeight: "100vh", // evita saltos de layout
        }}
      >
        <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-no-repeat bg-cover bg-center bg-[url('/assets/fondo_login.jfif')]">
          <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
          <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl z-10">
            <div className="text-center">
              <h2 className="text-[34px] text-[black]">Welcom Back!</h2>
              <p className="mt-2 text-sm text-gray-600">
                Please sign in to your account
              </p>
            </div>

            <div className="flex flex-row justify-center items-center space-x-3">
              <button
                type="button"
                onClick={handleMicrosoftLogin}
                disabled={loading}
                aria-busy={loading}
                className="w-11 h-11 inline-flex items-center justify-center rounded-full bg-blue-600 hover:shadow-lg transition ease-in duration-200 disabled:opacity-80 disabled:cursor-not-allowed"
                title="Continuar con Microsoft"
                aria-label="Continuar con Microsoft"
              >
                {loading ? (
                  <span
                    className="block h-6 w-6 rounded-full border-2 border-white/70 border-t-transparent animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Image
                    src="/svg/outlook.svg"
                    alt="Microsoft"
                    width={50}
                    height={50}
                    priority
                  />
                )}
              </button>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <span className="h-px w-16 bg-gray-300"></span>
              <span className="text-gray-500 font-normal">OR</span>
              <span className="h-px w-16 bg-gray-300"></span>
            </div>

            {/* Form decorativo */}
            <form
              className="mt-8 space-y-6"
              action="#"
              method="POST"
              onSubmit={(e) => e.preventDefault()}
            >
              <input type="hidden" name="remember" value="true" readOnly />
              <div className="relative">
                <div className="absolute right-0 mt-4">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <label className="text-sm font-bold text-gray-700 tracking-wide">
                  Email
                </label>
                <input
                  type="text"
                  className=" w-full text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                  style={{ background: "white", color: "black" }}
                  placeholder="mail@gmail.com"
                  value="mail@gmail.com"
                  readOnly
                />
              </div>
              <div className="mt-8 content-center">
                <label className="text-sm font-bold text-gray-700 tracking-wide">
                  Password
                </label>
                <input
                  type="text"
                  className="w-full content-center text-base py-2 border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                  style={{ background: "white", color: "black" }}
                  placeholder="Enter your password"
                  value="*****"
                  readOnly
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 bg-indigo-500 focus:ring-indigo-400 "
                    style={{ border: "1px solid red !important" }}
                    readOnly
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-indigo-500 hover:text-indigo-500"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>
              <div>
                <button
                  type="button"
                  className="w-full flex justify-center bg-indigo-500 text-gray-100 p-4  rounded-full tracking-wide
                                  font-semibold  focus:outline-none focus:shadow-outline hover:bg-indigo-600 shadow-lg cursor-pointer transition ease-in duration-300"
                >
                  Sign in
                </button>
              </div>
            </form>
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
