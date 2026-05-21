'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import PostCard from '@/components/PostCard';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BookmarksPage() {
   return <ProtectedRoute><BookmarksContent /></ProtectedRoute>;
}

function BookmarksContent() {
   const { token } = useAuth();
   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetch('/api/bookmarks', { headers: { 'Authorization': `Bearer ${token}` } })
         .then(r => r.json())
         .then(d => setPosts(d.posts || []))
         .catch(() => { })
         .finally(() => setLoading(false));
   }, [token]);

   const handleLike = async (postId) => {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isLiked: data.isLiked, likesCount: data.likesCount } : p));
   };

   const handleBookmark = async (postId) => {
      const res = await fetch(`/api/posts/${postId}/bookmark`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setPosts(prev => prev.filter(p => p.id !== postId));
   };

   return (
      <>
         <Navbar />
         <div className="app-layout">
            <Sidebar />
            <main className="main-content">
               <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 20 }}>🔖 Saved Posts</h2>
               {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
               ) : posts.length === 0 ? (
                  <div className="empty-state">
                     <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                     <h3>No saved posts</h3>
                     <p>Bookmark posts you want to revisit later</p>
                  </div>
               ) : (
                  posts.map(post => <PostCard key={post.id} post={post} onLike={handleLike} onBookmark={handleBookmark} />)
               )}
            </main>
         </div>
         <MobileNav />
      </>
   );
}
