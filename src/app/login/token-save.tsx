"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TokenSaver() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Si el middleware te envió ?returnTo=..., úsalo; si no, al home.
    const returnTo = searchParams.get("returnTo") || "/";
    router.replace(returnTo);
  }, [router, searchParams]);

  // Loader simple
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          color: "#0f172a",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "2px solid rgba(0,0,0,.2)",
            borderTopColor: "#2563eb",
            animation: "spin .7s linear infinite",
          }}
        />
        Iniciando sesión…
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
