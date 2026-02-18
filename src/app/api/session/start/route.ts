// src/app/api/session/start/route.ts
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

//POST REQ: To Create (User + Interview Session)
export async function POST(req: Request) {
  const uid = (await cookies()).get("ai_uid")?.value;
  if (!uid) {
    return NextResponse.json({ error: "Missing user cookie" }, { status: 401 });
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

  return NextResponse.json({ sessionId: session.id });
}
