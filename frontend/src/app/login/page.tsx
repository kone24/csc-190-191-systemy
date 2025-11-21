"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import ReCAPTCHA from 'react-google-recaptcha';

export default function LoginPage() {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    // clear any previous error messages
    if (token) {
      setMessage(null);
    }
  };

  const resetRecaptcha = () => {
    setRecaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (!recaptchaToken) {
      setMessage("Please complete the reCAPTCHA verification.");
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
          recaptchaToken: recaptchaToken // add reCAPTCHA token. 
        }),
      });

      const data = await res.json();

      if (res.ok && data?.ok) {
        setMessage(`Welcome, ${username}! Redirecting...`);
        router.replace("/dashboard");
      } else {
        setMessage(data?.message || "Invalid credentials");
        resetRecaptcha(); // reset reCAPTCHA token on failure
      }
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : String(err));
      resetRecaptcha(); // reset reCAPTCHA token on error
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

      {/* EXPANDED CONTAINER */}
      <div style={{
        width: 500,
        minHeight: 750, // Increased height
        maxHeight: '95vh',
        paddingLeft: 25,
        paddingRight: 25,
        paddingTop: 20,
        paddingBottom: 30, // More bottom padding
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
        gap: 20, // Increased gap
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

        {/* Message Display - moved here to avoid overlap */}
        {message && (
          <div style={{
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            marginBottom: 10
          }}>
            <div style={{
              textAlign: 'center',
              color: message.includes('Welcome') ? '#10b981' : '#ef4444',
              fontSize: 15,
              fontFamily: 'Inter',
              fontWeight: '600',
              wordWrap: 'break-word',
              maxWidth: '100%',
              padding: '10px 15px',
              backgroundColor: message.includes('Welcome') ? '#f0fdf4' : '#fef2f2',
              borderRadius: 10,
              border: message.includes('Welcome') ? '1px solid #10b981' : '1px solid #ef4444'
            }}>
              {message}
              {message !== "Please complete the reCAPTCHA verification." && (
                <div style={{ marginTop: 5, fontSize: 12, color: 'rgba(0, 0, 0, 0.60)' }}>
                  Please try again.
                </div>
              )}
            </div>
          </div>
        )}

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

        {/* reCAPTCHA */}
        <div style={{
          alignSelf: 'center',
          marginTop: 30,
          marginBottom: 30,
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }}>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
            onChange={handleRecaptchaChange}
            size="normal"
            theme="light"
          />
        </div>

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
          disabled={loading || !recaptchaToken} // disable if loading or reCAPTCHA not completed
          style={{
            width: 450,
            height: 75,
            paddingLeft: 209,
            paddingRight: 209,
            paddingTop: 19,
            paddingBottom: 19,
            background: loading || !recaptchaToken ? 'rgba(255, 158, 77, 0.15)' : 'rgba(255, 158, 77, 0.30)',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.40)',
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            display: 'flex',
            border: 'none',
            cursor: loading || !recaptchaToken ? 'not-allowed' : 'pointer'
          }}
        >
          <div style={{ textAlign: 'center', color: 'white', fontSize: 30, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word' }}>
            {loading ? "Signing in..." : "Login"}
          </div>
        </button>

        {/* Registration Link - ADD THIS */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <span style={{ color: '#666', fontSize: 14 }}>Don't have an account? </span>
          <a href="/register" style={{ color: '#FF5900', textDecoration: 'none', fontSize: 14, fontWeight: '600' }}>
            Create Account
          </a>
        </div>

        {/* 🔥 ADD FORGOT PASSWORD LINK */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <a href="/forgot-password" style={{
            color: '#FF5900',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: '500'
          }}>
            Forgot your password?
          </a>
        </div>

        {/* Alternative Sign In Text */}
        <div style={{
          textAlign: 'center',
          paddingTop: 40,
          color: 'rgba(255, 158, 77, 0.50)',
          fontSize: 15,
          fontFamily: 'Inter',
          fontWeight: '600',
          wordWrap: 'break-word',
          marginTop: 20
        }}>
          or sign in with
        </div>
        {/* Google Sign In Button */}
        <div style={{
          width: 75,
          height: 75,
          padding: 15,
          background: 'rgba(255, 102, 0, 0.20)',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.50)',
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          display: 'flex',
          cursor: 'pointer',
          marginBottom: 10
        }}>
          <img style={{ width: 45, height: 45 }} src="/images/logos/google.png" />
        </div>
      </div>
    </div>
  );
}
