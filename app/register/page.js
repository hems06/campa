'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
   const router = useRouter();
   const [form, setForm] = useState({ name: '', email: '', password: '', department: '', year: '' });
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);

   const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology', 'AI & Data Science', 'Biomedical', 'Other'];
   const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'];

   const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
         const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         // Pass OTP info for demo
         router.push(`/verify-email?userId=${data.userId}&otp=${data.otp}`);
      } catch (err) {
         setError(err.message);
      }
      setLoading(false);
   };

   const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

   return (
      <div className="auth-container">
         <div className="auth-card">
            <h1 className="auth-title">Join CampusConnect</h1>
            <p className="auth-subtitle">Create your account with your college email</p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
               <div className="form-group">
                  <label>Full Name</label>
                  <input className="input" placeholder="Your full name" value={form.name} onChange={update('name')} required />
               </div>
               <div className="form-group">
                  <label>College Email</label>
                  <input className="input" type="email" placeholder="you@ksrce.ac.in" value={form.email} onChange={update('email')} required />
               </div>
               <div className="form-group">
                  <label>Password</label>
                  <input className="input" type="password" placeholder="Create a strong password" value={form.password} onChange={update('password')} required minLength={6} />
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                     <label>Department</label>
                     <select className="select" value={form.department} onChange={update('department')}>
                        <option value="">Select...</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                  </div>
                  <div className="form-group">
                     <label>Year</label>
                     <select className="select" value={form.year} onChange={update('year')}>
                        <option value="">Select...</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                     </select>
                  </div>
               </div>
               <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                  {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : 'Create Account'}
               </button>
            </form>
            <div className="auth-footer">
               Already have an account? <a href="/login" onClick={e => { e.preventDefault(); router.push('/login'); }}>Sign In</a>
            </div>
         </div>
      </div>
   );
}
