
export default function Home() {
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
            <select className="h-11 rounded-xl border px-3">
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
            </select>
          </label>

          {/* Difficulty dropdown */}
          <label className="grid gap-2">
            <span className="text-sm font-medium">Difficulty</span>
            <select className="h-11 rounded-xl border px-3">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </label>

          <button className="h-11 rounded-xl bg-black text-white">
            Start Session
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
