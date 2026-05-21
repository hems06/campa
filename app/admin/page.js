'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminPage() {
   return <ProtectedRoute><AdminContent /></ProtectedRoute>;
}

function AdminContent() {
   const { token, user } = useAuth();
   const [reports, setReports] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetch('/api/admin/reports', { headers: { 'Authorization': `Bearer ${token}` } })
         .then(r => r.json())
         .then(d => setReports(d.reports || []))
         .catch(() => { })
         .finally(() => setLoading(false));
   }, [token]);

   const handleAction = async (reportId, action) => {
      try {
         await fetch(`/api/admin/reports/${reportId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ action }),
         });
         setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action === 'remove_post' ? 'resolved' : 'dismissed' } : r));
      } catch { }
   };

   if (user?.role !== 'admin') {
      return (
         <>
            <Navbar />
            <div className="empty-state" style={{ marginTop: 100 }}>
               <h3>Access Denied</h3>
               <p>You need admin privileges to access this page.</p>
            </div>
         </>
      );
   }

   return (
      <>
         <Navbar />
         <div className="app-layout">
            <Sidebar />
            <main className="main-content">
               <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>🛡️ Reports Dashboard</h2>
               {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
               ) : reports.length === 0 ? (
                  <div className="empty-state">
                     <h3>No reports</h3>
                     <p>Everything looks good! No posts have been reported.</p>
                  </div>
               ) : (
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                     <table className="admin-table">
                        <thead>
                           <tr>
                              <th>Post</th>
                              <th>Reporter</th>
                              <th>Reason</th>
                              <th>Status</th>
                              <th>Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {reports.map(r => (
                              <tr key={r.id}>
                                 <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {r.post?.content || 'Deleted'}
                                 </td>
                                 <td>{r.reporter?.name || 'Unknown'}</td>
                                 <td>{r.reason}</td>
                                 <td><span className={`badge badge-${r.status === 'pending' ? 'pending' : 'resolved'}`}>{r.status}</span></td>
                                 <td>
                                    {r.status === 'pending' && (
                                       <div style={{ display: 'flex', gap: 6 }}>
                                          <button className="btn btn-danger btn-sm" onClick={() => handleAction(r.id, 'remove_post')}>Remove</button>
                                          <button className="btn btn-secondary btn-sm" onClick={() => handleAction(r.id, 'dismiss')}>Dismiss</button>
                                       </div>
                                    )}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </main>
         </div>
         <MobileNav />
      </>
   );
}
