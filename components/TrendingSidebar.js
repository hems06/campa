'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrendingSidebar() {
   const [tags, setTags] = useState([]);
   const router = useRouter();

   useEffect(() => {
      fetch('/api/tags')
         .then(r => r.json())
         .then(d => setTags(d.tags || []))
         .catch(() => { });
   }, []);

   const suggestedTags = [
      { name: 'exams', emoji: '📝' },
      { name: 'placements', emoji: '💼' },
      { name: 'mentalhealth', emoji: '🧠' },
      { name: 'projects', emoji: '🚀' },
      { name: 'hostellife', emoji: '🏠' },
      { name: 'internships', emoji: '🎯' },
      { name: 'coding', emoji: '💻' },
      { name: 'motivation', emoji: '🔥' },
   ];

   return (
      <aside className="sidebar-right">
         <div className="trending-section">
            <div className="trending-title">🔥 Trending Tags</div>
            {tags.length > 0 ? (
               tags.slice(0, 10).map(tag => (
                  <div key={tag.name} className="trending-tag" onClick={() => router.push(`/search?tag=${tag.name}`)}>
                     <span className="trending-tag-name">#{tag.name}</span>
                     <span className="trending-tag-count">{tag.count} posts</span>
                  </div>
               ))
            ) : (
               <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No trending tags yet. Start posting!
               </div>
            )}
         </div>

         <div className="trending-section">
            <div className="trending-title">💡 Popular Topics</div>
            {suggestedTags.map(tag => (
               <div key={tag.name} className="trending-tag" onClick={() => router.push(`/search?tag=${tag.name}`)}>
                  <span className="trending-tag-name">{tag.emoji} #{tag.name}</span>
               </div>
            ))}
         </div>

         <div className="card" style={{ marginTop: 16, padding: 16 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
               🎓 <strong style={{ color: 'var(--text-secondary)' }}>CampusConnect</strong> — A safe space for college students to connect, share, and support each other.
            </p>
         </div>
      </aside>
   );
}
