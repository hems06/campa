'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useState } from 'react';

function timeAgo(date) {
   const s = Math.floor((Date.now() - new Date(date)) / 1000);
   if (s < 60) return 'just now';
   if (s < 3600) return `${Math.floor(s / 60)}m ago`;
   if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
   if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
   return new Date(date).toLocaleDateString();
}

export default function PostCard({ post, onLike, onBookmark, onDelete }) {
   const router = useRouter();
   const { user, token } = useAuth();
   const [showMenu, setShowMenu] = useState(false);
   const [reporting, setReporting] = useState(false);

   const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

   const handleReport = async () => {
      setReporting(true);
      try {
         await fetch(`/api/posts/${post.id}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ reason: 'Reported by user' }),
         });
         alert('Post reported. Our team will review it.');
      } catch { }
      setReporting(false);
      setShowMenu(false);
   };

   return (
      <article className="post-card">
         <div className="post-header">
            <div
               className="avatar"
               onClick={() => post.author?.id && router.push(`/profile/${post.author.id}`)}
               style={{ cursor: post.author?.id ? 'pointer' : 'default' }}
            >
               {post.author?.avatar ? <img src={post.author.avatar} alt="" /> : getInitials(post.author?.name)}
            </div>
            <div className="post-author-info">
               <div
                  className="post-author-name"
                  onClick={() => post.author?.id && router.push(`/profile/${post.author.id}`)}
               >
                  {post.author?.name || 'Anonymous'}
                  {post.isAnonymous && <span className="badge badge-anon" style={{ marginLeft: 8 }}>Anonymous</span>}
               </div>
               <div className="post-meta">
                  {post.author?.department && <span>{post.author.department}</span>}
                  {post.author?.department && <span>·</span>}
                  <span>{timeAgo(post.createdAt)}</span>
               </div>
            </div>
            <div className="dropdown">
               <button className="btn-icon" onClick={() => setShowMenu(!showMenu)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
               </button>
               {showMenu && (
                  <div className="dropdown-menu">
                     {user?.id === post.authorId && (
                        <button className="dropdown-item danger" onClick={() => { onDelete?.(post.id); setShowMenu(false); }}>
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                           Delete
                        </button>
                     )}
                     <button className="dropdown-item" onClick={handleReport} disabled={reporting}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
                        Report
                     </button>
                  </div>
               )}
            </div>
         </div>

         <div className="post-content" onClick={() => router.push(`/post/${post.id}`)} style={{ cursor: 'pointer' }}>
            {post.content}
         </div>

         {post.image && (
            <img src={post.image} alt="" className="post-image" onClick={() => router.push(`/post/${post.id}`)} style={{ cursor: 'pointer' }} />
         )}

         {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
               {post.tags.map(tag => (
                  <span key={tag} className="tag" onClick={() => router.push(`/search?tag=${tag}`)}>#{tag}</span>
               ))}
            </div>
         )}

         <div className="post-actions">
            <button className={`post-action ${post.isLiked ? 'liked' : ''}`} onClick={() => onLike?.(post.id)}>
               <svg width="16" height="16" viewBox="0 0 24 24" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
               {post.likesCount || 0}
            </button>
            <button className="post-action" onClick={() => router.push(`/post/${post.id}`)}>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
               {post.commentsCount || 0}
            </button>
            <button className={`post-action ${post.isBookmarked ? 'bookmarked' : ''}`} onClick={() => onBookmark?.(post.id)}>
               <svg width="16" height="16" viewBox="0 0 24 24" fill={post.isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            </button>
         </div>
      </article>
   );
}
