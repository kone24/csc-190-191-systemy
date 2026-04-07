"use client";

export default function LoginPage() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      position: 'relative',
      background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.30) 100%), white',
      overflow: 'hidden'
    }}>
      <div style={{
        width: 460,
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(180deg, rgba(255, 89.25, 0, 0) 0%, rgba(255, 89.25, 0, 0.20) 100%), white',
        boxShadow: '0px 4px 24px rgba(26, 26, 26, 0.15)',
        borderRadius: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 40px 40px',
        gap: 32
      }}>

        {/* Logo */}
        <img
          src="/images/logos/headword.png"
          alt="Headword logo"
          style={{ width: 90, height: 90, objectFit: 'contain' }}
        />

        {/* Heading */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: '#1a1a1a',
            fontSize: 26,
            fontFamily: 'Poppins',
            fontWeight: '700',
            marginBottom: 8,
            textShadow: '0px 2px 4px rgba(0, 0, 0, 0.10)'
          }}>
            Welcome to Headword
          </div>
          <div style={{
            color: 'rgba(26, 26, 26, 0.55)',
            fontSize: 14,
            fontFamily: 'Poppins',
            fontWeight: '400'
          }}>
            Sign in to your Headword account
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={() => { window.location.href = "http://localhost:3001/auth/google/"; }}
          style={{
            width: '100%',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            background: 'white',
            border: '1.5px solid rgba(0,0,0,0.12)',
            borderRadius: 14,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.10)',
            cursor: 'pointer',
            fontFamily: 'Poppins',
            fontSize: 16,
            fontWeight: '600',
            color: '#1a1a1a',
            transition: 'box-shadow 0.15s, border-color 0.15s'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 4px 16px rgba(255, 89, 0, 0.20)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,89,0,0.35)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0px 2px 8px rgba(0, 0, 0, 0.10)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,0.12)';
          }}
        >
          <img src="/images/logos/google.png" alt="Google" style={{ width: 26, height: 26 }} />
          Continue with Google
        </button>

        {/* Footer note */}
        <div style={{
          color: 'rgba(26, 26, 26, 0.40)',
          fontSize: 12,
          fontFamily: 'Poppins',
          textAlign: 'center',
          lineHeight: 1.6
        }}>
          Access is restricted to authorized Headword team members.
        </div>
      </div>
    </div>
  );
}