//Analytics API route to generate interview performance statistics for a logged-in user.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const uid = (await cookies()).get("ai_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Missing user cookie" }, { status: 401 });

  // Overall avg score for this user
  const overall = await prisma.attempt.aggregate({    //aggregate filters table using where condition
    where: { session: { userId: uid }, score: { not: null } },
    _avg: { score: true },  //calculate avg of filtered table scores
    _count: { score: true }, //counts of filtered table score rows
  });

  // Grouping sessions by role
  const byRole = await prisma.interviewSession.groupBy({
    by: ["role"],
    where: { userId: uid },
    _count: { id: true },
  });

  // Compute avg per role
  const roleAverages = await Promise.all(
    byRole.map(async (r) => {
      const agg = await prisma.attempt.aggregate({
        where: {
          session: { userId: uid, role: r.role },
          score: { not: null },
        },
        _avg: { score: true },
        _count: { score: true },
      });

      return {
        role: r.role,
        sessions: r._count.id,
        avgScore: agg._avg.score ?? null,
        scoredAttempts: agg._count.score,
      };
    })
  );

  return NextResponse.json({
    overall: {
      avgScore: overall._avg.score ?? null,
      scoredAttempts: overall._count.score,
    },
    roleAverages,
  });
}