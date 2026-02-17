//POST API to create Attempt

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BodySchema = z.object({
  questionId: z.string().min(5),
  answerText: z.string().min(3).max(8000),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;

  const uid = (await cookies()).get("ai_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Missing user cookie" }, { status: 401 });

  //validate with attempt POST data content with zod schema
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // Ensure session belongs to user and is active
  const session = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId: uid },
    select: { id: true, status: true },
  });
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.status !== "ACTIVE") {
    return NextResponse.json({ error: "Session is not active" }, { status: 400 });
  }

  // Ensure question exists
  const q = await prisma.question.findUnique({
    where: { id: parsed.data.questionId },
    select: { id: true },
  });
  if (!q) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  // Finally Create/Record the attempt in db
  const attempt = await prisma.attempt.create({
    data: {
      sessionId,
      questionId: q.id,
      answerText: parsed.data.answerText,
    },
    select: { id: true, createdAt: true },
  });

  //return attempt id (auto generated) and its created time
  return NextResponse.json({ attemptId: attempt.id, createdAt: attempt.createdAt });
}


