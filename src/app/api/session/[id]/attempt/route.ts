//POST API to create Attempt

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sha256 } from "@/lib/hash";
import { evaluateAnswer, PROMPT_VERSION } from "@/lib/gemini";
import { getCachedEval, setCachedEval } from "@/lib/evalCache";

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
    select: { id: true, status: true, role: true, difficulty: true },
  });
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.status !== "ACTIVE") {
    return NextResponse.json({ error: "Session is not active" }, { status: 400 });
  }

  // Ensure question exists
  const q = await prisma.question.findUnique({
    where: { id: parsed.data.questionId },
    select: { id: true, prompt: true },
  });
  if (!q) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  // Create/Record the attempt in db to have attempt history
  const attempt = await prisma.attempt.create({
    data: {
      sessionId,
      questionId: q.id,
      answerText: parsed.data.answerText,
    },
    select: { id: true, createdAt: true },
  });

  // Cache hash (same question+answer+prompt version => same evaluation) this will avoid repeated gemini evaluation if same question and answer was already in redis cache
  const evalHash = sha256(`${PROMPT_VERSION}|${parsed.data.questionId}|${parsed.data.answerText}`);

  // Check Redis cache
  const cached = await getCachedEval(evalHash); //will get data object or NULL 

  let evaluation = cached;
  let cacheHit = true; //will become false if evaluation, i mean cached data object is NULL

  if (!evaluation) { //if cached missed then, send to gemini.ts to generate evaluation an also store evaluated using setCachedEval() in evalCache.ts
    cacheHit = false;
    evaluation = await evaluateAnswer({
      role: session.role,
      difficulty: session.difficulty,
      questionPrompt: q.prompt,
      answerText: parsed.data.answerText,
    });
    await setCachedEval(evalHash, evaluation);
  }

  // Record the evaluation into the attempt record
  await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      evalHash,
      score: evaluation.score,
      feedback: evaluation.feedback,
      idealAnswer: evaluation.idealAnswer,
      tags: evaluation.tags,
    },
  });

  //return evaluated info to show in src/app/session/[id]/page.tsx
  return NextResponse.json({ 
    attemptId: attempt.id, 
    createdAt: attempt.createdAt,
    cacheHit,
    evaluation });

}


