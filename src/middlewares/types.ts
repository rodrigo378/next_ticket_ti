// src/middlewares/types.ts
import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

export type Mw = (
  req: NextRequest
) =>
  | NextResponse
  | Response
  | void
  | null
  | Promise<NextResponse | Response | void | null>;
