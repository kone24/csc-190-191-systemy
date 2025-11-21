"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import ReCAPTCHA from 'react-google-recaptcha';
import { LOGIN_ERRORS } from "../../../../backend/src/auth/loginErrors";

type Message = { type: "error" | "success"; text: string } | null;

export default function LoginPage() {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [mounted, setMounted] = useState(false); // for client-only reCAPTCHA
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (token) setMessage(null);
  };

  const resetRecaptcha = () => {
    setRecaptchaToken(null);
    recaptchaRef.current?.reset();
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (!recaptchaToken) {
      setMessage({ type: "error", text: "Please complete the reCAPTCHA verification." });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          recaptchaToken,
        }),
      });

      const data = await res.json();

      if (res.ok && data?.ok) {
        setMessage({ type: "success", text: `Welcome, ${username}! Redirecting...` });   
        router.replace("/dashboard");
      } else {
        let errorMessage = LOGIN_ERRORS.DEFAULT;

        // Map backend message to error
        if (username !== "admin") {
          errorMessage = LOGIN_ERRORS.INVALID_EMAIL;
          setUsername("");
          setPassword("");
        } else if (password !== "1234") {
          errorMessage = LOGIN_ERRORS.INCORRECT_PASSWORD;
          setUsername("");
          setPassword("");
        }

        setMessage({ type: "error", text: errorMessage }); // <-- text must be set here  
        resetRecaptcha();
      }

    } catch (err: unknown) {
      setUsername("");
      setPassword("");
      setMessage({ type: "error", text: err instanceof Error ? err.message : String(err) });
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.30) 100%), white', overflow: 'hidden' }}>

      {/* TEMP SEARCH BAR */}
      <a href="/search" style={{ position: 'absolute', top: '20px', right: '20px', color: '#3b82f6', textDecoration: 'underline', fontSize: '14px', zIndex: 10 }}>
        Go to Search Bar Testing
      </a>

      {/* CONTAINER */}
      <div style={{
        width: 500,
        minHeight: 750,
        maxHeight: '95vh',
        padding: 25,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'absolute',
        background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.20) 100%), white',
        boxShadow: '0px 4px 4px rgba(26, 26, 26, 0.30)',
        borderRadius: 20,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 20,
        display: 'flex',
        overflow: 'auto'
      }}>

        {/* Logo */}
        <div style={{ width: 100, height: 100, position: 'relative' }}>
          <img style={{ width: 98.63, height: 98.63, left: 0, top: 1.38, position: 'absolute', transform: 'rotate(-1deg)', transformOrigin: 'top left' }} src="/images/logos/headword.png" />
        </div>

        {/* Title */}
        <div style={{ width: 275, padding: 10, justifyContent: 'center', alignItems: 'center', gap: 10, display: 'flex' }}>
          <div style={{ textAlign: 'center', color: 'black', fontSize: 25, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.20)' }}>Sign in with email</div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            width: "90%",
            padding: "15px 20px",
            borderRadius: 15,
            backgroundColor: message.type === "error" ? "#FEE2E2" : "#DCFCE7",
            color: message.type === "error" ? "#B91C1C" : "#047857",
            fontWeight: 600,
            fontSize: 15,
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            marginBottom: 20
          }}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ width: 401, height: 145, position: 'relative', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 25, display: 'flex' }}>

          {/* Email */}
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

          {/* Password */}
          <div style={{ position: 'relative', alignSelf: 'stretch', height: 60 }}>
            <div style={{ alignSelf: 'stretch', height: 60, background: 'rgba(217, 217, 217, 0.15)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)', borderRadius: 20 }} />
            <img style={{ width: 40, height: 40, left: 14.50, top: 10, position: 'absolute' }} src="/images/icons/lock.png" />
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

          {/* reCAPTCHA */}
          {mounted && (
            <div style={{ alignSelf: 'center', marginTop: 280, marginBottom: 10, display: 'flex', justifyContent: 'center', width: '100%' }}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                onChange={handleRecaptchaChange}
                size="normal"
                theme="light"
              />
            </div>
          )}
        </form>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading || !recaptchaToken}
          style={{
            width: 450,
            height: 75,
            background: loading || !recaptchaToken ? 'rgba(255, 158, 77, 0.15)' : 'rgba(255, 158, 77, 0.30)',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.40)',
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            border: 'none',
            cursor: loading || !recaptchaToken ? 'not-allowed' : 'pointer'
          }}
          onClick={(e) => {
            e.preventDefault();
            const formEvent = { preventDefault: () => {}, currentTarget: { username: { value: username }, password: { value: password } } } as any;
            handleSubmit(formEvent);
          }}
        >
          <div style={{ textAlign: 'center', color: 'white', fontSize: 30, fontFamily: 'Inter', fontWeight: '600' }}>
            {loading ? "Signing in..." : "Login"}
          </div>
        </button>

        {/* Registration & Forgot Password */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ color: '#666', fontSize: 14 }}>Don't have an account? </span>
          <a href="/register" style={{ color: '#FF5900', textDecoration: 'none', fontSize: 14, fontWeight: '600' }}>Create Account</a>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <a href="/forgot-password" style={{ color: '#FF5900', textDecoration: 'none', fontSize: 14, fontWeight: '500' }}>Forgot your password?</a>
        </div>



        {/* Alternative Sign In */}
        <div style={{ textAlign: 'center', paddingTop: 100, color: 'rgba(255, 158, 77, 0.50)', fontSize: 15, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word', marginTop: 10 }}>
          or sign in with
        </div>
        <div style={{ width: 75, height: 75, padding: 15, background: 'rgba(255, 102, 0, 0.20)', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.50)', borderRadius: 20, justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer', marginBottom: 10 }}>
          <img style={{ width: 45, height: 45 }} src="/images/logos/google.png" />
        </div>

          {/* Loading Spinner */}
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
              borderRadius: 20
            }}>
            <div style={{
              width: 50,
              height: 50,
              border: '5px solid rgba(0,0,0,0.1)',
              borderTop: '5px solid #FF5900',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}

      </div>
    </div>
  );
}
