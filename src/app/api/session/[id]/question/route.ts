//API route to get 1 question for a session

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET( _req: Request, { params }: { params: Promise<{ id: string }> } ) {
  const { id: sessionId } = await params;

  //cookie check and also to get stored user id from cookie
  const uid = (await cookies()).get("ai_uid")?.value;
  if (!uid) {
    return NextResponse.json({ error: "Missing user cookie" }, { status: 401 });
  }

  // Ensure session belongs to user
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId: uid },
    select: { id: true, role: true, difficulty: true, status: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status !== "ACTIVE") {
    return NextResponse.json({ error: "Session is not active" }, { status: 400 });
  }

  // For v1, only return 1 question that matches session.role and session.difficulty
  const q = await prisma.question.findFirst({
    where: { role: session.role, difficulty: session.difficulty },
    select: { id: true, prompt: true, tags: true, role: true, difficulty: true },
    orderBy: { createdAt: "asc" },
  });

  if (!q) {
    return NextResponse.json(
      { error: "No questions found for this role+difficulty. Run seed." },
      { status: 404 }
    );
  }

  return NextResponse.json({ question: q });
}
