"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data?.ok) {
        setMessage(`Welcome, ${username}! Redirecting...`);
        router.replace("/dashboard");
      } else {
        setMessage(data?.message || "Invalid credentials");
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-[#0b0b0b]">
      {/* TEMP SEARCH BAR LOCATION FOR TESTING */}
      <a href="/search" className="text-blue-600 underline text-sm mt-2">
        Go to Search Bar Testing
      </a>

      {/* Page container / header */}
      <header className="w-full max-w-3xl mx-auto mb-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">HEADWORD</h1>
        </div>
      </header>

      {/* Form card */}
      <main className="w-full max-w-md mx-auto">
        <div className="bg-white/70 dark:bg-black/40 rounded-lg p-8 shadow">
          <h2 className="text-2xl font-semibold mb-4">Sign in</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col">
              <span className="text-sm font-medium">Username</span>
              <input
                name="username"
                type="text"
                required
                className="mt-1 p-2 border rounded"
                aria-label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>

            <label className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Password</span>
              </div>
              <input
                name="password"
                type="password"
                required
                className="mt-1 p-2 border rounded"
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button
              type="submit"
              className="mt-2 px-4 py-2 rounded bg-black text-white"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {message && (
            <div className="mt-4 text-center text-sm text-gray-700 dark:text-gray-200">
              {message}
            </div>
          )}
        </div>

        {/* Footer links under the card */}
        <footer className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          <a className="text-sm text-blue-600 hover:underline" href="#">
            Forgot password?
          </a>
        </footer>
      </main>
    </div>
  );
}
