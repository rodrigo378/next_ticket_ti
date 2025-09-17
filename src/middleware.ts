// /middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/login", "/favicon.ico", "/_next", "/assets", "/svg", "/403"];
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Rutas permitidas para Estudiante
const STUDENT_ALLOW = [
  /^\/hd\/est(\/.*)?$/, // todo lo que cuelgue de /hd/est
  /^\/logout$/,
];

// --- helpers ---
function isPublicPath(pathname: string) {
  return PUBLIC.some((p) => pathname === p || pathname.startsWith(p));
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isStudent(me: any): boolean {
  const rolId = me?.user?.rol?.id;
  const rolName = me?.user?.rol?.nombre?.toLowerCase?.();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modHD = (me?.modules ?? []).find((m: any) => m.codigo === "HD");
  return (
    rolId === 3 ||
    rolName === "estudiante" ||
    (modHD && String(modHD.role).toLowerCase() === "estudiante")
  );
}
function studentCanAccess(pathname: string) {
  return STUDENT_ALLOW.some((re) => re.test(pathname));
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1) Permite público
  if (isPublicPath(pathname)) return NextResponse.next();

  // 2) Exige cookie de sesión
  const cookieHeader = req.headers.get("cookie") || "";
  const hasAuth = /(^|;\s*)uma_auth=/.test(cookieHeader);
  if (!hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnTo", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // 3) Traer perfil reenviando la cookie al backend
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let me: any = null;
  try {
    const r = await fetch(`${API}/core/iam/context`, {
      headers: { cookie: cookieHeader, accept: "application/json" },
      cache: "no-store",
    });
    if (r.ok) {
      me = await r.json();
    } else if (r.status === 401) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("returnTo", pathname + (search || ""));
      return NextResponse.redirect(url);
    }
    // otros estados: dejamos pasar (o decide tu política)
  } catch (err) {
    console.log("error => ", err);
    // si el perfil falla por red, decide tu política (dejar pasar o mandar a login)
    // return NextResponse.redirect(new URL("/login", req.url));
  }

  // 4) Gate por rol Estudiante
  if (me && isStudent(me) && !studentCanAccess(pathname)) {
    if (pathname !== "/hd/est/mis-tickets") {
      const url = req.nextUrl.clone();
      url.pathname = "/hd/est/mis-tickets";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// No ejecutar en /api, /_next, /assets, favicon, etc.
export const config = {
  matcher: ["/((?!api|_next|assets|favicon.ico).*)"],
};
