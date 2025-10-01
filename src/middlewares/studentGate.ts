// src/middlewares/studentGate.ts
import { NextResponse } from "next/server";
import type { Mw } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const STUDENT_ALLOW = [/^\/hd\/est(\/.*)?$/, /^\/logout$/];

const studentCanAccess = (p: string) => STUDENT_ALLOW.some((re) => re.test(p));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isStudent = (me: any) => {
  const rolId = me?.user?.rol?.id;
  const rolName = me?.user?.rol?.nombre?.toLowerCase?.();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modHD = (me?.modules ?? []).find((m: any) => m.codigo === "HD");
  return (
    rolId === 3 ||
    rolName === "estudiante" ||
    (modHD && String(modHD.role).toLowerCase() === "estudiante")
  );
};

export const studentGateMw: Mw = async (req) => {
  const { pathname } = req.nextUrl;

  // console.log("===========================");
  // console.log("pathname => ", pathname);
  // console.log("===========================");

  // Solo aplica a rutas no públicas y no API
  if (!pathname.startsWith("/hd") && pathname !== "/") return;

  const cookieHeader = req.headers.get("cookie") || "";
  try {
    const r = await fetch(`${API}/core/iam/context`, {
      headers: { cookie: cookieHeader, accept: "application/json" },
      cache: "no-store",
    });
    if (!r.ok) return; // deja pasar (o redirige si quieres endurecer)
    const me = await r.json();

    if (isStudent(me) && !studentCanAccess(pathname)) {
      if (pathname !== "/hd/est/mis-tickets") {
        const url = req.nextUrl.clone();
        url.pathname = "/hd/est/mis-tickets";
        return NextResponse.redirect(url);
      }
    }
  } catch {
    // silencio o política de fallback
  }
};
