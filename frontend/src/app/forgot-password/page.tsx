"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import ReCAPTCHA from 'react-google-recaptcha';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [step, setStep] = useState<'request' | 'confirm'>('request');

    const handleRecaptchaChange = (token: string | null) => {
        setRecaptchaToken(token);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!recaptchaToken) {
            setMessage("Please complete the reCAPTCHA verification.");
            return;
        }

        setLoading(true);

        // 🔥 MOCK PASSWORD RESET REQUEST - Bypass backend for testing
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate successful password reset request
            console.log('Mock password reset request:', {
                email: email.trim(),
                recaptchaToken: 'mock-token'
            });

            setMessage("Password reset email sent! Please check your inbox.");
            setStep('confirm');

        } catch (err: unknown) {
            setMessage("Failed to send password reset email - please try again");
            resetRecaptcha();
        } finally {
            setLoading(false);
        }
    };

    if (step === 'confirm') {
        return (
            <div style={{ width: '100%', height: '100vh', position: 'relative', background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.30) 100%), white', overflow: 'hidden' }}>
                <div style={{
                    width: 500,
                    minHeight: 500,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    position: 'absolute',
                    background: 'white',
                    boxShadow: '0px 4px 4px rgba(26, 26, 26, 0.30)',
                    borderRadius: 20,
                    padding: '40px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: 28, fontWeight: '600', color: '#FF5900', marginBottom: 20 }}>
                        Check Your Email!
                    </div>
                    <div style={{ fontSize: 16, color: '#666', marginBottom: 30, lineHeight: '1.5' }}>
                        We've sent a password reset link to <strong>{email}</strong><br />
                        Please click the link in your email to reset your password.
                    </div>

                    {/* 🔥 TESTING SECTION */}
                    <div style={{
                        background: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '15px',
                        marginBottom: '20px',
                        fontSize: '12px',
                        color: '#666'
                    }}>
                        <div style={{ fontWeight: '600', marginBottom: '10px', color: '#333' }}>
                            🧪 TESTING MODE - Mock Password Reset Email:
                        </div>
                        <div style={{ textAlign: 'left', lineHeight: '1.4' }}>
                            <strong>Subject:</strong> Reset your password<br />
                            <strong>To:</strong> {email}<br />
                            <strong>Test Links:</strong><br />
                            • <a
                                href={`/reset-password?token=success123&email=${encodeURIComponent(email)}`}
                                style={{ color: '#10b981', textDecoration: 'underline' }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    router.push(`/reset-password?token=success123&email=${encodeURIComponent(email)}`);
                                }}
                            >
                                ✅ Valid Reset Link
                            </a><br />
                            • <a
                                href={`/reset-password?token=expired123&email=${encodeURIComponent(email)}`}
                                style={{ color: '#f59e0b', textDecoration: 'underline' }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    router.push(`/reset-password?token=expired123&email=${encodeURIComponent(email)}`);
                                }}
                            >
                                ⏰ Expired Reset Link
                            </a>
                        </div>
                    </div>

                    <div style={{ fontSize: 14, color: '#999', marginBottom: 20 }}>
                        Didn't receive the email? Check your spam folder.
                    </div>

                    {/* Buttons */}
                    <button
                        onClick={() => {
                            setMessage("Password reset email sent again!");
                            console.log("Mock: Resending password reset email to", email);
                            setTimeout(() => setMessage(null), 3000);
                        }}
                        style={{
                            padding: '12px 24px',
                            background: '#FF5900',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginRight: '10px'
                        }}
                    >
                        Resend Email
                    </button>

                    <button
                        onClick={() => router.push('/login')}
                        style={{
                            padding: '12px 24px',
                            background: 'transparent',
                            color: '#FF5900',
                            border: '2px solid #FF5900',
                            borderRadius: '10px',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        Back to Login
                    </button>

                    {message && (
                        <div style={{ marginTop: 20, color: '#10b981', fontSize: 14 }}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100vh', position: 'relative', background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.30) 100%), white', overflow: 'hidden' }}>
            <div style={{
                width: 500,
                minHeight: 650,
                maxHeight: '95vh',
                paddingLeft: 25,
                paddingRight: 25,
                paddingTop: 20,
                paddingBottom: 30,
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
                <div style={{ textAlign: 'center', color: 'black', fontSize: 25, fontFamily: 'Inter', fontWeight: '600', wordWrap: 'break-word', textShadow: '0px 4px 4px rgba(0, 0, 0, 0.20)' }}>
                    Reset Your Password
                </div>

                <div style={{ textAlign: 'center', color: '#666', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word', marginBottom: 10 }}>
                    Enter your email address and we'll send you a link to reset your password.
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ width: 401, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 25, display: 'flex' }}>

                    {/* Email Input */}
                    <div style={{ position: 'relative', alignSelf: 'stretch', height: 60 }}>
                        <div style={{ alignSelf: 'stretch', height: 60, background: 'rgba(217, 217, 217, 0.15)', borderRadius: 20 }} />
                        <img style={{ width: 40, height: 40, left: 14.50, top: 10, position: 'absolute' }} src="/images/icons/email.png" />
                        <input
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email..."
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
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 10, marginBottom: 15 }}>
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                        onChange={handleRecaptchaChange}
                        size="normal"
                        theme="light"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                    }}
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
                >
                    <div style={{ textAlign: 'center', color: 'white', fontSize: 30, fontFamily: 'Inter', fontWeight: '600' }}>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </div>
                </button>

                {/* Message Display */}
                <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    {message && (
                        <div style={{
                            textAlign: 'center',
                            color: message.includes('sent') ? '#10b981' : '#ef4444',
                            fontSize: 15,
                            fontFamily: 'Inter',
                            fontWeight: '600',
                            maxWidth: '90%'
                        }}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Back to Login Link */}
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <span style={{ color: '#666', fontSize: 14 }}>Remember your password? </span>
                    <a href="/login" style={{ color: '#FF5900', textDecoration: 'none', fontSize: 14, fontWeight: '600' }}>
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
}