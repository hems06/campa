'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function EditProfilePage() {
   return <ProtectedRoute><EditContent /></ProtectedRoute>;
}

function EditContent() {
   const { user, token, updateUser } = useAuth();
   const router = useRouter();
   const [form, setForm] = useState({ name: '', bio: '', department: '', year: '', skills: '', interests: '' });
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState('');
   const [error, setError] = useState('');

   useEffect(() => {
      if (user) {
         setForm({
            name: user.name || '',
            bio: user.bio || '',
            department: user.department || '',
            year: user.year || '',
            skills: (user.skills || []).join(', '),
            interests: (user.interests || []).join(', '),
         });
      }
   }, [user]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');
      try {
         const res = await fetch('/api/users/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
               name: form.name,
               bio: form.bio,
               department: form.department,
               year: form.year,
               skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
               interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
            }),
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data.error);
         updateUser(data.user);
         setSuccess('Profile updated!');
      } catch (err) {
         setError(err.message);
      }
      setLoading(false);
   };

   const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology', 'AI & Data Science', 'Biomedical', 'Other'];
   const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'];
   const update = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }));

   return (
      <>
         <Navbar />
         <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px', position: 'relative', zIndex: 1 }}>
            <button className="btn btn-ghost" onClick={() => router.back()} style={{ marginBottom: 16 }}>← Back</button>
            <div className="card" style={{ padding: 32 }}>
               <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 24 }}>Edit Profile</h2>
               {error && <div className="auth-error">{error}</div>}
               {success && <div className="auth-success">{success}</div>}
               <form onSubmit={handleSubmit}>
                  <div className="form-group"><label>Name</label><input className="input" value={form.name} onChange={update('name')} required /></div>
                  <div className="form-group"><label>Bio</label><textarea className="textarea" placeholder="Tell us about yourself..." value={form.bio} onChange={update('bio')} style={{ minHeight: 80 }} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                     <div className="form-group"><label>Department</label><select className="select" value={form.department} onChange={update('department')}><option value="">Select...</option>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                     <div className="form-group"><label>Year</label><select className="select" value={form.year} onChange={update('year')}><option value="">Select...</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                  </div>
                  <div className="form-group"><label>Skills (comma-separated)</label><input className="input" placeholder="React, Python, ML, UI/UX..." value={form.skills} onChange={update('skills')} /></div>
                  <div className="form-group"><label>Interests (comma-separated)</label><input className="input" placeholder="Web Dev, Robotics, Music..." value={form.interests} onChange={update('interests')} /></div>
                  <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                     {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : 'Save Changes'}
                  </button>
               </form>
            </div>
         </div>
         <MobileNav />
      </>
   );
}
