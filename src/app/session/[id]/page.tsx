//After start session, will be redirected to this page
"use client";

import { useEffect, useMemo, useState } from "react";
import { use } from "react"; //since params is a Promise and this is client component, we cannot use async await in client component. We must use { use } from "react" and instead of await we type use(params);

type Question = {
  id: string;
  prompt: string;
  role: string;
  difficulty: string;
  tags: any;
}

//to extract dynamic [id] from path we destruct { params }
export default function SessionPage({ params }: { params: Promise<{ id: string }> }) { //In Nextjs 15+ params content becomes a Promise so we have to use Async Await to get params
  const { id: sessionId } = use(params); //destruct id from params: { id: "123"} as sessionId

  const [loadingQ, setLoadingQ] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null); //this state is either a fully loaded Question object, or null (not yet loaded since loadingQ is still true).
  const [qError, setQError] = useState("");

  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string>("");

  const [evaluation, setEvaluation] = useState<any>(null);
  const [cacheHit, setCacheHit] = useState<boolean | null>(null);

  const canSubmit = useMemo(() => answer.trim().length >= 3 && !!question, [answer, question]); //canSubmit=true only when answeris longer than 3 chars and question does exist

  //to load respective question once session page loads, this will trigger get question route
  useEffect(() => {
    let cancelled = false; //flag to track whether this effect has been abandoned. for safety purpose just in case sessionId got changed during fetching process the cleanup function will set cancelled=true

    async function load() {
      setLoadingQ(true);
      setQError("");
      setSubmitMsg("");
      try {
        const res = await fetch(`/api/session/${sessionId}/question`, { method: "GET" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load question");
        if (!cancelled) setQuestion(data.question);
      } catch (e: any) {
        if (!cancelled) setQError(e?.message ?? "Error");
      } finally {
        if (!cancelled) setLoadingQ(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  //submit attempt func triggers attempt POST api
  async function submit() {
    if (!question) return;
    setSubmitting(true);
    setSubmitMsg("");

    try {
      setEvaluation(null);
      setCacheHit(null);
      const res = await fetch(`/api/session/${sessionId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answerText: answer }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit answer");

      setCacheHit(Boolean(data.cacheHit));
      setEvaluation(data.evaluation);
      setSubmitMsg(data.cacheHit ? "Evaluated (cache hit)" : "Evaluated (fresh) -cache missed");
    }
    catch (e: any) {
      setSubmitMsg(`Error: ${e?.message ?? "Something went wrong"}`);
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-black">Interview Session</h1>
            <p className="mt-1 text-sm text-neutral-600">Session ID: {sessionId}</p>
          </div>
        </div>

        <div className="mt-6">
          {loadingQ ? (
            <div className="rounded-xl border bg-neutral-50 p-4 text-sm text-neutral-700">
              Loading question...
            </div>
          ) : qError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {qError}
              <div className="mt-2 text-xs text-red-600">
                If this says “Run seed”, run: <code className="px-1">npx tsx prisma/seed.ts</code>
              </div>
            </div>
          ) : question ? (
            <div className="rounded-xl border bg-neutral-50 p-4">
              <div className="text-xs text-neutral-500">
                {question.role} • {question.difficulty}
              </div>
              <div className="mt-2 text-base font-medium text-neutral-900">{question.prompt}</div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3">
          <label className="grid gap-2">
            <span className="text-sm text-gray-700 font-medium">Your answer</span>
            <textarea
              className="min-h-35 rounded-xl border p-3 text-gray-400"
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={!question || submitting}
            />
          </label>

          <button
            onClick={submit}
            disabled={!canSubmit || submitting}
            className="h-11 rounded-xl bg-black text-white disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Answer"}
          </button>

          {submitMsg ? (
            <div className="rounded-xl border bg-white p-3 text-sm text-neutral-800">
              {submitMsg}
            </div>
          ) : null}

          {evaluation ? (
            <div className="mt-3 rounded-xl border bg-neutral-50 p-4">
              <div className="text-sm font-bold text-black">Evaluation</div>
              <div className="mt-2 text-sm text-green-600">
                <div><span className="font-medium">Score:</span> {evaluation.score}/10</div>
                <div className="mt-2"><span className="font-medium">Feedback:</span> {evaluation.feedback}</div>
                <div className="mt-2"><span className="font-medium">Ideal Answer:</span> {evaluation.idealAnswer}</div>
                <div className="mt-2"><span className="font-medium">Tags:</span> {Array.isArray(evaluation.tags) ? evaluation.tags.join(", ") : ""}</div>
                {cacheHit !== null ? (
                  <div className="mt-2 text-xs text-neutral-600">
                    Cache: {cacheHit ? "HIT" : "MISS"}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          
        </div>
      </div>
    </main>
  );
}