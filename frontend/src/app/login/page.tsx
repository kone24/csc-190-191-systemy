"use client";

import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    setLoading(true);
    try {
      // backend expects `username` and `password` (hardcoded check uses username === 'admin')
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await res.json();
      setMessage(data?.message || JSON.stringify(data));
    } catch (err: any) {
      setMessage(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-[#0b0b0b]">
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
              <span className="text-sm font-medium">Email</span>
              <input
                name="email"
                type="email"
                required
                className="mt-1 p-2 border rounded"
                aria-label="Email"
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
          <a className="text-sm text-blue-600 hover:underline" href="#">Forgot password?</a>
        </footer>
      </main>
    </div>
  );
}
