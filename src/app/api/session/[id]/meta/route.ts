//to fetch current session Meta Datas from DB

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  const uid = (await cookies()).get("ai_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Missing user cookie" }, { status: 401 });

  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId: uid },
    select: { id: true, role: true, difficulty: true, status: true, startedAt: true, endedAt: true },
  });

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  return NextResponse.json({ session });
}
