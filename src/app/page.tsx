"use client"; //converting to client component since we are using react hooks to interact 

import { useState } from "react";
import { useRouter } from "next/navigation"; //to redirect to another page

const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer"] as const; //as const is set to make it read-only and also have exact element name
const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export default function Home() {
  const router = useRouter();

  //only accepts typeof above option arrays for type safety.   useState<(typeof WHICH_ARRAY)[indices]>("InitialValue")
  const [role, setRole] = useState<(typeof ROLES)[number]>(ROLES[0]);
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>(DIFFICULTIES[0]);

  //loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  //Start button sends roles and difficulty info to start session API endpoint
  async function start() {
    setError(""); //clearing any previous error
    setLoading(true);

    try {
      const res = await fetch("api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, difficulty }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to start session");
      }

      router.push(`/session/${data.sessionId}`);  // Redirect to the session page after getting res.ok status 

    } catch (e: any) { //error can be of any type 
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-400">AI Interview Platform</h1>
        <p className="text-sm text-neutral-600 mt-3">
          Pick a role and difficulty level to start and interview session
        </p>

        <div className="mt-6 grid gap-4 text-neutral-600">
          {/* Role dropdown */}
          <label className="grid gap-2">
            <span className="text-sm font-medium">Role</span>
            <select className="h-11 rounded-xl border px-3"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              disabled={loading}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          {/* Difficulty dropdown */}
          <label className="grid gap-2">
            <span className="text-sm font-medium">Difficulty</span>
            <select className="h-11 rounded-xl border px-3"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              disabled={loading}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          {/* Error message display */}
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button className="h-11 rounded-xl bg-black text-white hover:bg-neutral-700"
            onClick={start}
            disabled={loading}>
            {loading ? "Starting..." : "Start Session"}
          </button>

          <div className="flex gap-2">
            <a href="/history" className="flex-1 h-11 rounded-xl border text-sm grid place-items-center hover:bg-neutral-100">
              History
            </a>
            <a href="/analytics" className="flex-1 h-11 rounded-xl border text-sm grid place-items-center hover:bg-neutral-100">
              Analytics
            </a>
          </div>


          {/* Footer note */}
          <p className="text-xs text-neutral-500">
            v1 uses an anonymous cookie user id (yet to implement login)
          </p>
        </div>
      </div>
    </main>
  );
}
