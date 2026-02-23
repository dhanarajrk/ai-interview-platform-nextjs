import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { consumeDailySessionQuota } from "@/lib/quota";

//zod is used to validate req body during runtime. (zod validates any data that comes from outside world like API req. But TypeScript cannot check outside world data content like res.json() format since it only checks on compile-time while zod check on run-time which is perfect for checking funcs like res.json() which executes on runtime)
const BodySchema = z.object({
  role: z.string().min(2).max(80),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
});

const COOKIE_NAME = "ai_uid";

//POST REQ: To Create (User + Interview Session)
export async function POST(req: Request) {
  const cookieStore = await cookies();
  let uid = cookieStore.get(COOKIE_NAME)?.value;

  //Fallback: if middleware didn't set cookie(sometimes in production mode, middle might never run), so we create cookie manually using fallback
  const res = NextResponse.next(); //NextResponse.next() provides .cookie.set() function for res

  if (!uid) {
    uid = crypto.randomUUID();
    res.cookies.set(COOKIE_NAME, uid, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const json = await req.json().catch(() => null); //intentionally return null instead of error cause zod Body.Schema parse will handle success or unsuccess later.
  const parsed = BodySchema.safeParse(json); //zod safeParse() the received json data and Validate using BodySchema
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  //Quota check for 3 sessions/day/user
  const quota = await consumeDailySessionQuota(uid);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: "Daily quota reached (3 sessions/day). Try again tomorrow.",
        quota: { used: quota.used, remaining: quota.remaining },
      },
      { status: 429 }
    );
  }

  // ensure user exists, upsert means update if user exists otherwise create new user in db
  await prisma.user.upsert({
    where: { id: uid },
    update: {},        //update none if user exists
    create: { id: uid }, //create if user didn't exist
  });

  //create interview session in db and return session id only 
  const session = await prisma.interviewSession.create({
    data: {
      userId: uid,
      role: parsed.data.role,
      difficulty: parsed.data.difficulty,
    },
    select: { id: true },
  });

  // Production Update: Return JSON, and include cookies if we set them
  const jsonRes = NextResponse.json({
    sessionId: session.id,
    quota: { used: quota.used, remaining: quota.remaining }, //small improvement: could show something like "2 of 3 sessions used today." But I haven't use it on frontend
  });

  // copy cookie from res to jsonRes if set (only when uid was missing)
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) jsonRes.headers.set("set-cookie", setCookie); //we manually paste cookie on jsonRes.header because NextResponse.next() —> res doesn't carry your actual data like sessionId and quota 

  return jsonRes; //The main idea is just to manually create cookie and return, just in case middleware was not run at Start of the page(due to weird cache in production env)
}
