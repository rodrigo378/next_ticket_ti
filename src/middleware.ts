// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authMw } from "./middlewares/auth";
import { studentGateMw } from "./middlewares/studentGate";
import { Mw } from "./middlewares/types";

function chain(middlewares: Mw[]): (req: NextRequest) => Promise<NextResponse> {
  return async (req) => {
    for (const mw of middlewares) {
      const res = await mw(req);
      if (res) return res as NextResponse;
    }
    return NextResponse.next();
  };
}

export const middleware = chain([
  authMw, //
  studentGateMw,
]);

export const config = {
  matcher: ["/((?!api|_next|assets|favicon.ico).*)"],
};
