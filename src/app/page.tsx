"use client"; //converting to client component since we are using react hooks to interact 

import { useState } from "react";

const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer"] as const; //as const is set to make it read-only and also have exact element name
const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

export default function Home() {
  //only accepts typeof above option arrays for type safety.   useState<(typeof WHICH_ARRAY)[indices]>("InitialValue")
  const [role, setRole] = useState<(typeof ROLES)[number]>(ROLES[0]);
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>(DIFFICULTIES[0]);

  //loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  //Fake API mimic for testing UI states and loading purpose
  async function start(){
    setError(""); //clearing any previous error
    setLoading(true); 

    // Simulate an API call
    setTimeout(() => {
      setLoading(false);
      console.log("Starting session with:", { role, difficulty });
    }, 2000);
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
                    onChange={(e)=>setRole(e.target.value as any)}
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
                    onChange={(e)=>setDifficulty(e.target.value as any)}
                    disabled={loading}>
              {DIFFICULTIES.map((d)=>(
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

          <button className="h-11 rounded-xl bg-black text-white"
                  onClick={start}
                  disabled={loading}>
            {loading ? "Starting..." : "Start Session"}
          </button>

          {/* Footer note */}
          <p className="text-xs text-neutral-500">
            v1 uses an anonymous cookie user id (yet to implement login)
          </p>
      </div>
     </div>
    </main>
  );
}
