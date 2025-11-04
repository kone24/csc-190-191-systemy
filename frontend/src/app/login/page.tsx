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
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.30) 100%), white', overflow: 'hidden' }}>

      {/* TEMP SEARCH BAR LOCATION FOR TESTING */}
      <a href="/search" style={{ position: 'absolute', top: '20px', right: '20px', color: '#3b82f6', textDecoration: 'underline', fontSize: '14px', zIndex: 10 }}>
        Go to Search Bar Testing
      </a>

      <div style={{ width: 500, minHeight: 600, maxHeight: '90vh', paddingLeft: 25, paddingRight: 25, paddingTop: 18, paddingBottom: 18, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', position: 'absolute', background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.20) 100%), white', boxShadow: '0px 4px 4px rgba(26, 26, 26, 0.30)', borderRadius: 20, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 18, display: 'flex', overflow: 'auto' }}>

        {/* Logo */}
        <div style={{ width: 100, height: 100, position: 'relative' }}>
          <img style={{ width: 98.63, height: 98.63, left: 0, top: 1.38, position: 'absolute', transform: 'rotate(-1deg)', transformOrigin: 'top left' }} src="/images/logos/headword.png" />
        </div>

        {/* Title */}
        <div style={{ width: 275, padding: 10, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
          <div style={{ textAlign: 'center', color: 'black', fontSize: 25, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.20)' }}>Sign in with email</div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ width: 401, height: 145, position: 'relative', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 25, display: 'flex' }}>

          {/* Email Input Field */}
          <div style={{ position: 'relative', alignSelf: 'stretch', height: 60 }}>
            <div style={{ alignSelf: 'stretch', height: 60, background: 'rgba(217, 217, 217, 0.15)', borderRadius: 20 }} />
            <img style={{ width: 40, height: 40, left: 14.50, top: 10, position: 'absolute' }} src="/images/icons/email.png" />
            <input
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Company email..."
              style={{
                position: 'absolute',
                left: 54.50,
                top: 15,
                width: 'calc(100% - 70px)',
                height: 30,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'rgba(26, 26, 26, 0.80)',
                fontSize: 15,
                fontFamily: 'Inter',
                fontWeight: '600'
              }}
            />
          </div>

          {/* Password Input Field */}
          <div style={{ position: 'relative', alignSelf: 'stretch', height: 60 }}>
            <div style={{ alignSelf: 'stretch', height: 60, background: 'rgba(217, 217, 217, 0.15)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)', borderRadius: 20 }} />
            <img style={{ width: 40, height: 40, left: 14.50, top: 10, position: 'absolute', transform: 'rotate(0deg)' }} src="/images/icons/lock.png" />
            <input
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password..."
              style={{
                position: 'absolute',
                left: 54.50,
                top: 15,
                width: 'calc(100% - 70px)',
                height: 30,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'rgba(26, 26, 26, 0.80)',
                fontSize: 15,
                fontFamily: 'Inter',
                fontWeight: '600'
              }}
            />
          </div>
        </form>

        {/* Login Button */}
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            const formEvent = {
              preventDefault: () => { },
              currentTarget: {
                username: { value: username },
                password: { value: password }
              }
            } as any;
            handleSubmit(formEvent);
          }}
          disabled={loading}
          style={{
            width: 450,
            height: 75,
            paddingLeft: 209,
            paddingRight: 209,
            paddingTop: 19,
            paddingBottom: 19,
            background: loading ? 'rgba(255, 158, 77, 0.15)' : 'rgba(255, 158, 77, 0.30)',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.40)',
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            display: 'flex',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <div style={{ textAlign: 'center', color: 'white', fontSize: 30, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>
            {loading ? "Signing in..." : "Login"}
          </div>
        </button>

        {/* Message Display - Fixed Height Area */}
        <div style={{
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          marginTop: 5,
          marginBottom: 5
        }}>
          {message && (
            <div style={{
              textAlign: 'center',
              color: message.includes('Welcome') ? '#10b981' : '#ef4444',
              fontSize: 15,
              fontFamily: 'Inter',
              fontWeight: '600',
              wordWrap: 'break-word',
              maxWidth: '90%'
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Alternative Sign In Text */}
        <div style={{ textAlign: 'center', color: 'rgba(255, 158, 77, 0.50)', fontSize: 15, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>or sign in with</div>

        {/* Google Sign In Button */}
        <div style={{ width: 75, height: 75, padding: 15, background: 'rgba(255, 102, 0, 0.20)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.50)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex', cursor: 'pointer' }}>
          <img style={{ width: 45, height: 45 }} src="/images/logos/google.png" />
        </div>
      </div>
    </div>
  );
}
