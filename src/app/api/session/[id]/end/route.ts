import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> } ) {
  const { id: sessionId } = await params;

  const uid = (await cookies()).get("ai_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Missing user cookie" }, { status: 401 });

  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId: uid },
    select: { id: true, status: true },
  });

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  //If already ENDED return early to prevent double ending
  if (session.status === "ENDED") {
    return NextResponse.json({ ok: true, status: "ENDED" });
  }

  //Otherwise Update the current session status as "ENDED"
  await prisma.interviewSession.update({
    where: { id: sessionId },
    data: { status: "ENDED", endedAt: new Date() },
  });

  return NextResponse.json({ ok: true, status: "ENDED" });
}
