//Server component since datas are fetched directly from DB

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
    const uid = (await cookies()).get("ai_uid")?.value; //get user id from cookies 

    if (!uid) {
        return (
            <main className="min-h-screen p-6">
                <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6">
                    <h1 className="text-xl font-semibold">History</h1>
                    <p className="mt-2 text-sm text-neutral-600">Missing user cookie.</p>
                </div>
            </main>
        );
    }

    const sessions = await prisma.interviewSession.findMany({
        where: { userId: uid },
        orderBy: { startedAt: "desc" },
        include: {
            attempts: {
                orderBy: { createdAt: "desc" },
                include: { question: true },
            },
        },
        take: 20,
    });

    return (
        <main className="min-h-screen p-6">
            <div className="mx-auto w-full max-w-3xl">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">History</h1>
                    <a className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50" href="/">
                        New Session
                    </a>
                </div>

                <div className="mt-4 grid gap-4">
                    {sessions.length === 0 ? (
                        <div className="rounded-2xl border bg-white p-6 text-sm text-neutral-600">
                            No sessions yet.
                        </div>
                    ) : (
                        sessions.map((s) => (
                            <div key={s.id} className="rounded-2xl border bg-white p-6 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-sm text-neutral-500">
                                            {s.role} • {s.difficulty} •{" "}
                                            <span className="font-medium text-neutral-800">{s.status}</span>
                                        </div>
                                        <div className="mt-1 text-xs text-neutral-500">
                                            {new Date(s.startedAt).toLocaleString()}
                                        </div>
                                    </div>

                                    {s.status !== "ENDED" &&
                                    (<a
                                        className="rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                                        href={`/session/${s.id}`}
                                    >
                                        Open
                                    </a>)}
                                    
                                </div>

                                <div className="mt-4 grid gap-3">
                                    {s.attempts.length === 0 ? (
                                        <div className="rounded-xl border bg-neutral-50 p-3 text-sm text-neutral-600">
                                            No attempts in this session.
                                        </div>
                                    ) : (
                                        s.attempts.map((a) => (
                                            <div key={a.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                                                <div className="text-sm font-medium text-neutral-900">Q: {a.question.prompt}</div>
                                                <div className="mt-2 text-sm">
                                                    <span className="font-medium text-neutral-900">Answer:</span>{" "}
                                                    <span className="text-neutral-700">{a.answerText}</span>
                                                </div>

                                                {a.score !== null ? (
                                                    <div className="mt-3 text-sm">
                                                        <div>
                                                            <span className="font-medium text-neutral-900">Score:</span>{" "}
                                                            <span className="text-neutral-700">{a.score}/10</span>
                                                        </div>
                                                        {a.feedback ? (
                                                            <div className="mt-1">
                                                                <span className="font-medium text-neutral-900">Feedback:</span>{" "}
                                                                <span className="text-neutral-700">{a.feedback}</span>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    <div className="mt-3 text-sm text-neutral-500">
                                                        Not evaluated yet.
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}