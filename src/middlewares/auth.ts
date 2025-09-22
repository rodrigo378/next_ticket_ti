// src/middlewares/auth.ts
import { NextResponse } from "next/server";
import type { Mw } from "./types";

const PUBLIC = ["/login", "/favicon.ico", "/_next", "/assets", "/svg", "/403"];

const isPublicPath = (p: string) =>
  PUBLIC.some((x) => p === x || p.startsWith(x));

export const authMw: Mw = (req) => {
  const { pathname, search } = req.nextUrl;
  if (isPublicPath(pathname)) return;

  const cookie = req.headers.get("cookie") || "";
  const hasAuth = /(^|;\s*)uma_auth=/.test(cookie);
  if (!hasAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnTo", pathname + (search || ""));
    return NextResponse.redirect(url);
  }
};
