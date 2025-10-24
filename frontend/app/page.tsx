"use client";

import { useState } from "react";

export default function HomePage() {
  const [username, setUsername] = useState(""); // input state
  const [password, setPassword] = useState(""); // input state
  const [message, setMessage] = useState("");   // result message

  // handles form submission
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); // prevent page reload

    try {        // added try/catch to handle errors
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      console.log(data);

      if (data.token) {
        localStorage.setItem("token", data.token); // store JWT
        setMessage(`Login successful! Welcome, ${username}`);
      } else {
        setMessage(data.message || "Invalid credentials"); // failed login
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

      <p className="mt-6 text-gray-500">
        Press 'F12' and select 'Console' to see login test logs.
      </p>
    </main>
  );
}