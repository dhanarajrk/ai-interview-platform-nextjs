//API route to get 1 question for a session

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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

  // First Find questions already attempted in this session and below we will exclude these from total to find non attempted questions
  const attempted = await prisma.attempt.findMany({
    where: { sessionId },
    select: { questionId: true },
  });

  const attemptedIds = attempted.map((a) => a.questionId);

  // Pick a question that is not attempted yet
  const q = await prisma.question.findFirst({
    where: {
      role: session.role,
      difficulty: session.difficulty,
      ...(attemptedIds.length ? { id: { notIn: attemptedIds } } : {}), // Exclude already attempted questions from questions. If no unattempted questions left then return null
    },
    select: { id: true, prompt: true, tags: true, role: true, difficulty: true },
    orderBy: { createdAt: "asc" },
  });

  //Attempted counts and Total questions to track curr question page
  const attemptedCount = attemptedIds.length;

  const total = await prisma.question.count({
    where: { role: session.role, difficulty: session.difficulty },
  });

  // If role+difficulty has zero questions (seed missing), or session exhausted
  if (!q) {
    if (total === 0) {
      return NextResponse.json(
        { error: "No questions exist for this role+difficulty. Run seed.", total, attemptedCount },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "No more questions left for this role+difficulty in this session.",
        total,
        attemptedCount,
      },
      { status: 404 }
    );
  }

  // next question number
  const questionNumber = attemptedCount + 1;

  return NextResponse.json({
    question: q,
    total,
    questionNumber,
  });
}
