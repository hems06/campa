'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import TrendingSidebar from '@/components/TrendingSidebar';
import PostCard from '@/components/PostCard';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const { token } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('latest');
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?filter=${filter}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch { }
    setLoading(false);
  }, [filter, token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isLiked: data.isLiked, likesCount: data.likesCount } : p));
    } catch { }
  };

  const handleBookmark = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isBookmarked: data.isBookmarked } : p));
    } catch { }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch { }
  };

  return (
    <>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          {/* Create post CTA */}
          <div className="create-post-card" onClick={() => router.push('/create')}>
            <div className="avatar avatar-sm" style={{ background: 'var(--accent-gradient)' }}>✍️</div>
            <input className="input" placeholder="What's on your mind? Share with your campus..." readOnly />
          </div>

          {/* Feed tabs */}
          <div className="feed-tabs">
            {['latest', 'trending'].map(f => (
              <button
                key={f}
                className={`feed-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'latest' ? '🕐 Latest' : '🔥 Trending'}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" />
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              <h3>No posts yet</h3>
              <p>Be the first to share something with your campus community!</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => router.push('/create')}>Create First Post</button>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onDelete={handleDelete}
              />
            ))
          )}
        </main>
        <TrendingSidebar />
      </div>
      <button className="fab" onClick={() => router.push('/create')} title="Create Post">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </button>
      <MobileNav />
    </>
  );
}
