// src/middlewares/allowedRoutes.ts
import { NextResponse } from "next/server";
import type { Mw } from "./types";

const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;

const PUBLIC = [
  "/",
  "/login",
  "/403",
  "/favicon.ico",
  "/_next",
  "/assets",
  "/svg",
];
const isPublicPath = (p: string) =>
  PUBLIC.some((x) => p === x || p.startsWith(x));

const ALLOWED_COOKIE = "iam_allowed_paths";
const COOKIE_TTL_SECONDS = 60;

function normPath(p: string) {
  try {
    const u = new URL(p, "http://x");
    p = u.pathname;
  } catch {}
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

function withWildcardMatch(pathname: string, allowed: string[]) {
  pathname = normPath(pathname);
  if (allowed.includes(pathname)) return true;
  return allowed.some(
    (ap) => ap.endsWith("*") && pathname.startsWith(normPath(ap.slice(0, -1)))
  );
}

export const allowedRoutesMw: Mw = async (req) => {
  const { pathname, search } = req.nextUrl;
  if (isPublicPath(pathname)) return;

  let allowedPaths: string[] | null = null;
  try {
    const cached = req.cookies.get(ALLOWED_COOKIE)?.value;
    if (cached) allowedPaths = JSON.parse(cached);
  } catch {}

  if (!allowedPaths) {
    if (!API_INTERNAL_URL) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("returnTo", pathname + (search || ""));
      return NextResponse.redirect(url);
    }

    try {
      const r = await fetch(`${API_INTERNAL_URL}/core/permiso/allowed`, {
        headers: { cookie: req.headers.get("cookie") ?? "" },
        credentials: "include",
        cache: "no-store",
      });

      if (r.status === 401 || r.status === 403) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("returnTo", pathname + (search || ""));
        return NextResponse.redirect(url);
      }

      if (!r.ok) {
        const url = req.nextUrl.clone();
        url.pathname = "/403";
        return NextResponse.rewrite(url);
      }

      const data = await r.json();

      allowedPaths = Array.isArray(data?.allowedPaths) ? data.allowedPaths : [];
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = "/403";
      return NextResponse.rewrite(url);
    }
  }

  if (req.nextUrl.searchParams.get("_debugPerms") === "1") {
    return new NextResponse(
      JSON.stringify(
        {
          pathname,
          allowedPaths,
          match: withWildcardMatch(pathname, allowedPaths!),
        },
        null,
        2
      ),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }

  const can = withWildcardMatch(pathname, allowedPaths!);
  if (!can) {
    const url = req.nextUrl.clone();
    url.pathname = "/403";
    return NextResponse.rewrite(url);
  }

  const res = NextResponse.next();
  res.cookies.set(ALLOWED_COOKIE, JSON.stringify(allowedPaths), {
    maxAge: COOKIE_TTL_SECONDS,
    path: "/",
    sameSite: "lax",
  });
  return res;
};
