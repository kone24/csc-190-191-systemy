"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send/receive cookies
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log(data);

      if (res.ok && data?.ok) {
        setMessage(`Welcome, ${username}! Redirecting...`);
        router.replace("/dashboard"); // redirect after login
      } else {
        setMessage(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Error logging in:", err);
      setMessage("Login failed: Server error");
    }
  }

  return (
    <main className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      <form onSubmit={handleLogin} className="flex flex-col gap-2 items-center">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded p-2 w-64"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded p-2 w-64"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700"
        >
          Log In
        </button>
      </form>

      {message && <p className="mt-4 text-lg">{message}</p>}
    </main>
  );
}
