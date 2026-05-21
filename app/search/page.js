'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import PostCard from '@/components/PostCard';
import ProtectedRoute from '@/components/ProtectedRoute';

function SearchContent() {
   const { token } = useAuth();
   const router = useRouter();
   const searchParams = useSearchParams();
   const q = searchParams.get('q') || '';
   const tagParam = searchParams.get('tag') || '';
   const [query, setQuery] = useState(q);
   const [users, setUsers] = useState([]);
   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (q) { setQuery(q); search(q); }
      if (tagParam) searchByTag(tagParam);
   }, [q, tagParam]);

   const search = async (term) => {
      setLoading(true);
      try {
         const [usersRes, postsRes] = await Promise.all([
            fetch(`/api/users/search?q=${encodeURIComponent(term)}`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`/api/posts?filter=latest`, { headers: { 'Authorization': `Bearer ${token}` } }),
         ]);
         const usersData = await usersRes.json();
         const postsData = await postsRes.json();
         setUsers(usersData.users || []);
         const termLower = term.toLowerCase();
         setPosts((postsData.posts || []).filter(p =>
            p.content.toLowerCase().includes(termLower) ||
            (p.tags && p.tags.some(t => t.includes(termLower))) ||
            (p.author?.name && p.author.name.toLowerCase().includes(termLower))
         ));
      } catch { }
      setLoading(false);
   };

   const searchByTag = async (tag) => {
      setLoading(true);
      try {
         const res = await fetch(`/api/posts?tag=${encodeURIComponent(tag)}`, { headers: { 'Authorization': `Bearer ${token}` } });
         const data = await res.json();
         setPosts(data.posts || []);
         setUsers([]);
      } catch { }
      setLoading(false);
   };

   const handleSearch = (e) => {
      e.preventDefault();
      if (query.trim()) {
         router.push(`/search?q=${encodeURIComponent(query.trim())}`);
         search(query.trim());
      }
   };

   const handleLike = async (postId) => {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isLiked: data.isLiked, likesCount: data.likesCount } : p));
   };

   const handleBookmark = async (postId) => {
      const res = await fetch(`/api/posts/${postId}/bookmark`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isBookmarked: data.isBookmarked } : p));
   };

   const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

   return (
      <>
         <Navbar />
         <div className="app-layout">
            <Sidebar />
            <main className="main-content">
               <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                     <input className="input" placeholder="Search posts, people, or tags..." value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1 }} />
                     <button className="btn btn-primary" type="submit">Search</button>
                  </div>
               </form>

               {tagParam && (
                  <div style={{ marginBottom: 20 }}>
                     <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        Posts tagged <span className="tag" style={{ fontSize: '0.9rem' }}>#{tagParam}</span>
                     </h2>
                  </div>
               )}

               {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
               ) : (
                  <>
                     {users.length > 0 && (
                        <div className="search-results-section">
                           <div className="search-title">People</div>
                           {users.slice(0, 5).map(u => (
                              <div key={u.id} className="user-card" onClick={() => router.push(`/profile/${u.id}`)}>
                                 <div className="avatar">{u.avatar ? <img src={u.avatar} alt="" /> : getInitials(u.name)}</div>
                                 <div className="user-card-info">
                                    <div className="user-card-name">{u.name}</div>
                                    <div className="user-card-dept">{u.department} {u.year && `· ${u.year}`}</div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {posts.length > 0 && (
                        <div className="search-results-section">
                           <div className="search-title">Posts ({posts.length})</div>
                           {posts.map(post => (
                              <PostCard key={post.id} post={post} onLike={handleLike} onBookmark={handleBookmark} />
                           ))}
                        </div>
                     )}

                     {!loading && (q || tagParam) && posts.length === 0 && users.length === 0 && (
                        <div className="empty-state">
                           <h3>No results found</h3>
                           <p>Try different keywords or browse trending tags</p>
                        </div>
                     )}
                  </>
               )}
            </main>
         </div>
         <MobileNav />
      </>
   );
}

export default function SearchPage() {
   return (
      <ProtectedRoute>
         <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>}>
            <SearchContent />
         </Suspense>
      </ProtectedRoute>
   );
}
