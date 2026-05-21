'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
   const { login } = useAuth();
   const router = useRouter();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
         const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
         });
         const data = await res.json();
         if (!res.ok) {
            if (res.status === 403 && data.userId) {
               router.push(`/verify-email?userId=${data.userId}`);
               return;
            }
            throw new Error(data.error);
         }
         login(data.token, data.user);
         router.push('/');
      } catch (err) {
         setError(err.message);
      }
      setLoading(false);
   };

   return (
      <div className="auth-container">
         <div className="auth-card">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your CampusConnect account</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
               <div className="form-group">
                  <label>College Email</label>
                  <input className="input" type="email" placeholder="you@ksrce.ac.in" value={email} onChange={e => setEmail(e.target.value)} required />
               </div>
               <div className="form-group">
                  <label>Password</label>
                  <input className="input" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
               </div>
               <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                  {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : 'Sign In'}
               </button>
            </form>
            <div className="auth-footer">
               Don&apos;t have an account? <a href="/register" onClick={e => { e.preventDefault(); router.push('/register'); }}>Sign Up</a>
            </div>
         </div>
      </div>
   );
}
