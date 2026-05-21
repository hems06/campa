'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';

function timeAgo(date) {
   const s = Math.floor((Date.now() - new Date(date)) / 1000);
   if (s < 60) return 'just now';
   if (s < 3600) return `${Math.floor(s / 60)}m ago`;
   if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
   if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
   return new Date(date).toLocaleDateString();
}

export default function PostDetailPage() {
   const { id } = useParams();
   const { token, user } = useAuth();
   const router = useRouter();
   const [post, setPost] = useState(null);
   const [loading, setLoading] = useState(true);
   const [comment, setComment] = useState('');
   const [anonComment, setAnonComment] = useState(false);
   const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
      if (!token) return;
      fetch(`/api/posts/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
         .then(r => r.json())
         .then(d => setPost(d.post))
         .catch(() => { })
         .finally(() => setLoading(false));
   }, [id, token]);

   const handleLike = async () => {
      const res = await fetch(`/api/posts/${id}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setPost(prev => ({ ...prev, isLiked: data.isLiked, likesCount: data.likesCount }));
   };

   const handleBookmark = async () => {
      const res = await fetch(`/api/posts/${id}/bookmark`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setPost(prev => ({ ...prev, isBookmarked: data.isBookmarked }));
   };

   const handleComment = async (e) => {
      e.preventDefault();
      if (!comment.trim()) return;
      setSubmitting(true);
      try {
         const res = await fetch(`/api/posts/${id}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content: comment, isAnonymous: anonComment }),
         });
         const data = await res.json();
         setPost(prev => ({
            ...prev,
            comments: [...(prev.comments || []), data.comment],
            commentsCount: (prev.commentsCount || 0) + 1,
         }));
         setComment('');
      } catch { }
      setSubmitting(false);
   };

   const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

   if (loading) return (
      <>
         <Navbar />
         <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      </>
   );

   if (!post) return (
      <>
         <Navbar />
         <div className="empty-state"><h3>Post not found</h3></div>
      </>
   );

   return (
      <>
         <Navbar />
         <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px', position: 'relative', zIndex: 1 }}>
            <button className="btn btn-ghost" onClick={() => router.back()} style={{ marginBottom: 16 }}>
               ← Back
            </button>
            <article className="card" style={{ padding: 28 }}>
               <div className="post-header">
                  <div className="avatar" onClick={() => post.author?.id && router.push(`/profile/${post.author.id}`)} style={{ cursor: post.author?.id ? 'pointer' : 'default' }}>
                     {post.author?.avatar ? <img src={post.author.avatar} alt="" /> : getInitials(post.author?.name)}
                  </div>
                  <div className="post-author-info">
                     <div className="post-author-name" onClick={() => post.author?.id && router.push(`/profile/${post.author.id}`)}>
                        {post.author?.name || 'Anonymous'}
                        {post.isAnonymous && <span className="badge badge-anon" style={{ marginLeft: 8 }}>Anonymous</span>}
                     </div>
                     <div className="post-meta">
                        {post.author?.department && <span>{post.author.department}</span>}
                        {post.author?.department && <span>·</span>}
                        <span>{timeAgo(post.createdAt)}</span>
                     </div>
                  </div>
               </div>

               <div className="post-content" style={{ fontSize: '1rem', lineHeight: 1.8 }}>{post.content}</div>
               {post.image && <img src={post.image} alt="" className="post-image" />}
               {post.tags?.length > 0 && (
                  <div className="post-tags">
                     {post.tags.map(tag => <span key={tag} className="tag" onClick={() => router.push(`/search?tag=${tag}`)}>#{tag}</span>)}
                  </div>
               )}

               <div className="post-actions">
                  <button className={`post-action ${post.isLiked ? 'liked' : ''}`} onClick={handleLike}>
                     <svg width="18" height="18" viewBox="0 0 24 24" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                     {post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}
                  </button>
                  <button className={`post-action ${post.isBookmarked ? 'bookmarked' : ''}`} onClick={handleBookmark}>
                     <svg width="18" height="18" viewBox="0 0 24 24" fill={post.isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                     {post.isBookmarked ? 'Saved' : 'Save'}
                  </button>
               </div>
            </article>

            {/* Comments */}
            <div className="card" style={{ marginTop: 16, padding: 24 }}>
               <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
                  💬 Comments ({post.comments?.length || 0})
               </h3>

               <form className="comment-form" onSubmit={handleComment}>
                  <div className="avatar avatar-sm">{getInitials(user?.name)}</div>
                  <div style={{ flex: 1 }}>
                     <input className="input" placeholder="Write a comment..." value={comment} onChange={e => setComment(e.target.value)} />
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        <div className="toggle-wrapper" onClick={() => setAnonComment(!anonComment)} style={{ fontSize: '0.78rem' }}>
                           <div className={`toggle ${anonComment ? 'active' : ''}`} style={{ width: 32, height: 18 }} />
                           <span className="toggle-label">Anonymous</span>
                        </div>
                        <button className="btn btn-primary btn-sm" type="submit" disabled={submitting || !comment.trim()}>
                           {submitting ? '...' : 'Reply'}
                        </button>
                     </div>
                  </div>
               </form>

               <div className="comments-section" style={{ marginTop: 20 }}>
                  {(!post.comments || post.comments.length === 0) ? (
                     <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>
                        No comments yet. Be the first to share your thoughts!
                     </p>
                  ) : (
                     post.comments.map(c => (
                        <div key={c.id} className="comment">
                           <div className="avatar avatar-sm">{getInitials(c.author?.name)}</div>
                           <div className="comment-body">
                              <span className="comment-author">{c.author?.name || 'Anonymous'}</span>
                              <p className="comment-text">{c.content}</p>
                              <span className="comment-time">{timeAgo(c.createdAt)}</span>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
         <MobileNav />
      </>
   );
}
