"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [err, setErr] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadAnalytics() {
            setErr("");
            try {
                const res = await fetch("/api/analytics");
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Failed to load analytics");
                if (!cancelled) setData(data);
            } catch (e: any) {
                if (!cancelled) setErr(e?.message ?? "Error");
            }
        }

        loadAnalytics();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="min-h-screen bg-neutral-100 p-6">
            <div className="mx-auto w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                    <h1 className="text-xl font-bold text-neutral-900">Analytics</h1>
                    <div className="flex gap-2">
                        <a className="rounded-xl border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200" href="/history">
                            History
                        </a>
                        <a className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700" href="/">
                            New Session
                        </a>
                    </div>
                </div>

                {err ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {err}
                    </div>
                ) : !data ? (
                    <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-500">
                        Loading...
                    </div>
                ) : (
                    <div className="mt-6 grid gap-6">
                        {/* Overall Card */}
                        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
                            <div className="text-sm text-neutral-500">Overall Average Score</div>
                            <div className="mt-1 text-3xl font-bold text-neutral-900">
                                {data.overall.avgScore === null ? "—" : data.overall.avgScore.toFixed(2)}
                            </div>
                            <div className="mt-1 text-xs text-neutral-400">
                                Scored attempts: {data.overall.scoredAttempts}
                            </div>
                        </div>

                        {/* Role Breakdown */}
                        <div>
                            <div className="text-sm font-semibold text-neutral-700">Average by Role</div>
                            <div className="mt-3 grid gap-3">
                                {data.roleAverages.map((r: any) => (
                                    <div key={r.role} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="font-medium text-neutral-800">{r.role}</div>
                                            <div className="rounded-lg bg-white border border-neutral-200 px-3 py-1 text-sm font-semibold text-neutral-700">
                                                {r.avgScore === null ? "—" : r.avgScore.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-neutral-400">
                                            Sessions: {r.sessions} • Scored attempts: {r.scoredAttempts}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
