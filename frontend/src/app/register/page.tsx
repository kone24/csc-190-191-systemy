"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import ReCAPTCHA from 'react-google-recaptcha';

export default function RegisterPage() {
    const router = useRouter();
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [step, setStep] = useState<'register' | 'confirm'>('register');

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!recaptchaToken) {
            setMessage("Please complete the reCAPTCHA verification.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match.");
            resetRecaptcha();
            return;
        }

        setLoading(true);

        // try {
        //     const res = await fetch("http://localhost:3000/auth/register", {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify({
        //             email: formData.email.trim(),
        //             username: formData.username.trim(),
        //             password: formData.password.trim(),
        //             recaptchaToken: recaptchaToken
        //         }),
        //     });

        //     const data = await res.json();

        //     if (res.ok && data?.ok) {
        //         setMessage("Registration successful! Please check your email for confirmation.");
        //         setStep('confirm');
        //     } else {
        //         setMessage(data?.message || "Registration failed");
        //         resetRecaptcha();
        //     }
        // } catch (err: unknown) {
        //     setMessage(err instanceof Error ? err.message : "Registration failed");
        //     resetRecaptcha();
        // } finally {
        //     setLoading(false);
        // }

        // 🔥 MOCK REGISTRATION - Bypass backend for testing
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulate successful registration
            console.log('Mock registration data:', {
                email: formData.email.trim(),
                username: formData.username.trim(),
                password: '[HIDDEN]',
                recaptchaToken: 'mock-token'
            });

            setMessage("Registration successful! Please check your email for confirmation.");
            setStep('confirm');

        } catch (err: unknown) {
            setMessage("Registration failed - please try again");
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
                    minHeight: 400,
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
                        We've sent a confirmation link to <strong>{formData.email}</strong><br />
                        Please click the link in your email to verify your account.
                    </div>
                    <div style={{ fontSize: 14, color: '#999', marginBottom: 20 }}>
                        Didn't receive the email? Check your spam folder.
                    </div>
                    <button
                        onClick={() => {
                            // Simulate resending confirmation email
                            setMessage("Confirmation email sent again!");
                            console.log("Mock: Resending email to", formData.email)
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
                        Go to Login
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
                minHeight: 850,
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
                    Create Your Account
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ width: 401, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'flex' }}>

                    {/* Email Input */}
                    <div style={{ position: 'relative', alignSelf: 'stretch', height: 60 }}>
                        <div style={{ alignSelf: 'stretch', height: 60, background: 'rgba(217, 217, 217, 0.15)', borderRadius: 20 }} />
                        <img style={{ width: 40, height: 40, left: 14.50, top: 10, position: 'absolute' }} src="/images/icons/email.png" />
                        <input
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email address..."
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

                    {/* Username Input */}
                    <div style={{ position: 'relative', alignSelf: 'stretch', height: 60 }}>
                        <div style={{ alignSelf: 'stretch', height: 60, background: 'rgba(217, 217, 217, 0.15)', borderRadius: 20 }} />
                        <img style={{ width: 40, height: 40, left: 14.50, top: 10, position: 'absolute' }} src="/images/icons/user-icon.webp" />
                        <input
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Username..."
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

                    {/* Password Input */}
                    <div style={{ position: 'relative', alignSelf: 'stretch', height: 60 }}>
                        <div style={{ alignSelf: 'stretch', height: 60, background: 'rgba(217, 217, 217, 0.15)', borderRadius: 20 }} />
                        <img style={{ width: 40, height: 40, left: 14.50, top: 10, position: 'absolute' }} src="/images/icons/lock.png" />
                        <input
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
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

                    {/* Confirm Password Input */}
                    <div style={{ position: 'relative', alignSelf: 'stretch', height: 60 }}>
                        <div style={{ alignSelf: 'stretch', height: 60, background: 'rgba(217, 217, 217, 0.15)', borderRadius: 20 }} />
                        <img style={{ width: 40, height: 40, left: 14.50, top: 10, position: 'absolute' }} src="/images/icons/lock.png" />
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm password..."
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

                {/* Register Button */}
                <button
                    type="submit"
                    onClick={(e) => {
                        e.preventDefault();
                        if (!recaptchaToken) {
                            setMessage("Please complete the reCAPTCHA verification.");
                            return;
                        }
                        handleSubmit(e);
                    }}
                    disabled={loading}
                    style={{
                        width: 401,
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
                        {loading ? "Creating Account..." : "Create Account"}
                    </div>
                </button>

                {/* Message Display */}
                <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    {message && (
                        <div style={{
                            textAlign: 'center',
                            color: message.includes('successful') ? '#10b981' : '#ef4444',
                            fontSize: 15,
                            fontFamily: 'Inter',
                            fontWeight: '600',
                            maxWidth: '90%'
                        }}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Login Link */}
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <span style={{ color: '#666', fontSize: 14 }}>Already have an account? </span>
                    <a href="/login" style={{ color: '#FF5900', textDecoration: 'none', fontSize: 14, fontWeight: '600' }}>
                        Sign In
                    </a>
                </div>
            </div>
        </div>
    );
}