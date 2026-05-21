'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

function VerifyContent() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const { login } = useAuth();
   const userId = searchParams.get('userId');
   const demoOtp = searchParams.get('otp');
   const [otp, setOtp] = useState('');
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
         const res = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, otp }),
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         setSuccess('Email verified! Redirecting...');
         login(data.token, data.user);
         setTimeout(() => router.push('/'), 1500);
      } catch (err) {
         setError(err.message);
      }
      setLoading(false);
   };

   return (
      <div className="auth-container">
         <div className="auth-card">
            <h1 className="auth-title">Verify Email</h1>
            <p className="auth-subtitle">Enter the verification code sent to your college email</p>
            {demoOtp && (
               <div className="auth-success">
                  <strong>Demo Mode:</strong> Your OTP is <strong>{demoOtp}</strong>
               </div>
            )}
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            <form onSubmit={handleSubmit}>
               <div className="form-group">
                  <label>Verification Code</label>
                  <input
                     className="input"
                     placeholder="Enter 6-digit code"
                     value={otp}
                     onChange={e => setOtp(e.target.value)}
                     maxLength={6}
                     style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem', fontWeight: 700 }}
                     required
                  />
               </div>
               <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                  {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : 'Verify'}
               </button>
            </form>
         </div>
      </div>
   );
}

export default function VerifyEmailPage() {
   return (
      <Suspense fallback={<div className="auth-container"><div className="spinner" /></div>}>
         <VerifyContent />
      </Suspense>
   );
}
