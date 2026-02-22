//middleware.ts is a fixed Nextjs file name
//nextjs will search for file called "middleware.ts" and run it first before a request is completed

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "ai_uid";

//func name must be "middleware"-old way , "proxy"-new way  - its a fixed nextjs rule 
export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const existing = req.cookies.get(COOKIE_NAME)?.value;
  if (!existing) {
    const uid = crypto.randomUUID(); // stable per browser
    //set cookie "ai_uid" : "123456f" as uid which will later use to create or check a user's uid is existed or not in api/session/start/route.ts
    res.cookies.set(COOKIE_NAME, uid, { 
      httpOnly: true,        //JS in the browser cannot read it (security)
      sameSite: "lax",       //Sent on normal navigation, helps CSRF protection
      secure: process.env.NODE_ENV === "production", //Only over HTTPS in production
      path: "/",             //Available across the whole site
      maxAge: 60 * 60 * 24 * 365, // 1 year persistence
    });
  }

  return res; //return orignal cookie if existing else resposne newly created cookie
}

//matcher allows us to filter Middleware to run on specific paths.
//This avoid runnig middleware on every static asset request like chunks, image, icons and its wasteful cause they dont need cookie set 
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};