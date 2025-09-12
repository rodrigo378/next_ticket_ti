// /middleware.ts (en la raíz del proyecto)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/login", "/favicon.ico", "/_next", "/assets", "/svg"];

export function middleware(req: NextRequest) {
  // console.log("=============================================================");
  // console.log("se ejecuto middleware");

  const { pathname, search } = req.nextUrl;
  // console.log("pathname => ", pathname);
  // console.log("search => ", search);

  // deja pasar rutas públicas (login y estáticos)
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(p));
  if (isPublic) return NextResponse.next();
  // console.log("isPublic => ", isPublic);

  // exige cookie de sesión
  const hasAuth = Boolean(req.cookies.get("uma_auth")?.value);
  // console.log("hasAuth => ", hasAuth);
  if (!hasAuth) {
    // console.log("entro se redirije ");

    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnTo", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // console.log("no se redirije");
  // console.log("=============================================================");
  return NextResponse.next();
}

// no ejecutar en /api, /_next, /assets, favicon, etc.
export const config = {
  matcher: ["/((?!api|_next|assets|favicon.ico).*)"],
};
