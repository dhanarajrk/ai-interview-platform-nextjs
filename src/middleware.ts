//middleware.ts is a fixed Nextjs file name
//nextjs will search for file called "middleware.ts" and run it first before a request is completed

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "crypto";

const COOKIE_NAME = "ai_uid";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const existing = req.cookies.get(COOKIE_NAME)?.value;
  if (!existing) {
    const uid = randomUUID(); // stable per browser
    res.cookies.set(COOKIE_NAME, uid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};