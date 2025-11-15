"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'valid' | 'expired' | 'invalid'>('loading');
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const userEmail = searchParams.get('email');

        if (userEmail) setEmail(userEmail);

        if (!token) {
            setStatus('invalid');
            setMessage('Invalid reset link');
            return;
        }

        // 🔥 MOCK TOKEN VALIDATION - Simulate backend verification
        const validateToken = async () => {
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1500));

                console.log('Mock token validation:', { token, email: userEmail });

                // Test different token scenarios
                if (token.includes('expired')) {
                    setStatus('expired');
                    setMessage('Reset link has expired');
                } else if (token === '' || !token) {
                    setStatus('invalid');
                    setMessage('Invalid reset token');
                } else {
                    // Valid token
                    setStatus('valid');
                    setMessage('');
                }
            } catch (error) {
                setStatus('invalid');
                setMessage('Network error occurred');
            }
        };

        validateToken();
    }, [searchParams]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        if (formData.password.length < 6) {
            setMessage("Password must be at least 6 characters.");
            return;
        }

        setSubmitting(true);

        // 🔥 MOCK PASSWORD RESET - Simulate backend update
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Mock password reset:', {
                email: email,
                token: searchParams.get('token'),
                newPassword: '[HIDDEN]'
            });

            setMessage("Password reset successfully! Redirecting to login...");

            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (error) {
            setMessage("Failed to reset password. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (status === 'loading') {
        return (
            <div style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.30) 100%), white'
            }}>
                <div style={{
                    width: 500,
                    padding: '40px',
                    background: 'white',
                    borderRadius: 20,
                    boxShadow: '0px 4px 4px rgba(26, 26, 26, 0.30)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: 60, marginBottom: 20 }}>⏳</div>
                    <div style={{ fontSize: 24, fontWeight: '600', color: '#666', fontFamily: 'Inter' }}>
                        Verifying reset link...
                    </div>
                </div>
            </div>
        );
    }

    if (status !== 'valid') {
        return (
            <div style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.30) 100%), white'
            }}>
                <div style={{
                    width: 500,
                    padding: '40px',
                    background: 'white',
                    borderRadius: 20,
                    boxShadow: '0px 4px 4px rgba(26, 26, 26, 0.30)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: 60, marginBottom: 20 }}>
                        {status === 'expired' ? '⏰' : '❌'}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: '600', color: status === 'expired' ? '#f59e0b' : '#ef4444', marginBottom: 20, fontFamily: 'Inter' }}>
                        {status === 'expired' ? 'Link Expired' : 'Invalid Link'}
                    </div>
                    <div style={{ fontSize: 16, color: '#666', marginBottom: 30, lineHeight: '1.5', fontFamily: 'Inter' }}>
                        {message}
                    </div>

                    <button
                        onClick={() => router.push('/forgot-password')}
                        style={{
                            padding: '12px 24px',
                            background: '#FF5900',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            marginRight: '10px',
                            fontFamily: 'Inter'
                        }}
                    >
                        Request New Link
                    </button>

                    <button
                        onClick={() => router.push('/login')}
                        style={{
                            padding: '12px 24px',
                            background: 'transparent',
                            color: '#FF5900',
                            border: '2px solid #FF5900',
                            borderRadius: '10px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontFamily: 'Inter'
                        }}
                    >
                        Back to Login
                    </button>
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
                    Set New Password
                </div>

                {email && (
                    <div style={{ textAlign: 'center', color: '#666', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', wordWrap: 'break-word', marginBottom: 10 }}>
                        for {email}
                    </div>
                )}

                {/* 🔥 TESTING INFO */}
                <div style={{
                    background: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '10px',
                    fontSize: '12px',
                    color: '#666',
                    textAlign: 'left',
                    width: '90%'
                }}>
                    <div style={{ fontWeight: '600', marginBottom: '10px', color: '#333' }}>
                        🧪 Testing Info:
                    </div>
                    <div style={{ lineHeight: '1.4' }}>
                        <strong>Token:</strong> {searchParams.get('token')}<br />
                        <strong>Email:</strong> {email}<br />
                        <strong>Status:</strong> Valid reset link ✅
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ width: 401, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'flex' }}>

                    {/* New Password Input */}
                    <div style={{ position: 'relative', alignSelf: 'stretch', height: 60 }}>
                        <div style={{ alignSelf: 'stretch', height: 60, background: 'rgba(217, 217, 217, 0.15)', borderRadius: 20 }} />
                        <img style={{ width: 40, height: 40, left: 14.50, top: 10, position: 'absolute' }} src="/images/icons/lock.png" />
                        <input
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="New password..."
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

                    {/* Confirm New Password Input */}
                    <div style={{ position: 'relative', alignSelf: 'stretch', height: 60 }}>
                        <div style={{ alignSelf: 'stretch', height: 60, background: 'rgba(217, 217, 217, 0.15)', borderRadius: 20 }} />
                        <img style={{ width: 40, height: 40, left: 14.50, top: 10, position: 'absolute' }} src="/images/icons/lock.png" />
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm new password..."
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

                {/* Reset Password Button */}
                <button
                    type="submit"
                    onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                    }}
                    disabled={submitting}
                    style={{
                        width: 450,
                        height: 75,
                        background: submitting ? 'rgba(255, 158, 77, 0.15)' : 'rgba(255, 158, 77, 0.30)',
                        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.40)',
                        borderRadius: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        border: 'none',
                        cursor: submitting ? 'not-allowed' : 'pointer'
                    }}
                >
                    <div style={{ textAlign: 'center', color: 'white', fontSize: 30, fontFamily: 'Inter', fontWeight: '600' }}>
                        {submitting ? "Updating..." : "Update Password"}
                    </div>
                </button>

                {/* Message Display */}
                <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    {message && (
                        <div style={{
                            textAlign: 'center',
                            color: message.includes('successfully') ? '#10b981' : '#ef4444',
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

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.30) 100%), white',
                fontSize: 20,
                fontFamily: 'Inter'
            }}>
                Loading reset form...
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}