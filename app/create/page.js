'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import ProtectedRoute from '@/components/ProtectedRoute';

const SUGGESTED_TAGS = ['exams', 'placements', 'mentalhealth', 'projects', 'hostellife', 'internships', 'coding', 'motivation', 'studytips', 'events', 'clubs', 'sports', 'achievements'];

export default function CreatePostPage() {
   return (
      <ProtectedRoute>
         <CreateContent />
      </ProtectedRoute>
   );
}

function CreateContent() {
   const { token } = useAuth();
   const router = useRouter();
   const [content, setContent] = useState('');
   const [tags, setTags] = useState([]);
   const [tagInput, setTagInput] = useState('');
   const [isAnonymous, setIsAnonymous] = useState(false);
   const [image, setImage] = useState(null);
   const [imagePreview, setImagePreview] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const addTag = (tag) => {
      const t = tag.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (t && !tags.includes(t) && tags.length < 5) {
         setTags(prev => [...prev, t]);
      }
      setTagInput('');
   };

   const removeTag = (tag) => {
      setTags(prev => prev.filter(t => t !== tag));
   };

   const handleTagKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ',') {
         e.preventDefault();
         addTag(tagInput);
      }
      if (e.key === 'Backspace' && !tagInput && tags.length) {
         setTags(prev => prev.slice(0, -1));
      }
   };

   const handleImageChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
         setImage(file);
         setImagePreview(URL.createObjectURL(file));
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!content.trim()) { setError('Write something to share!'); return; }
      setError('');
      setLoading(true);

      try {
         let imageUrl = '';
         if (image) {
            const formData = new FormData();
            formData.append('file', image);
            const uploadRes = await fetch('/api/upload', {
               method: 'POST',
               headers: { 'Authorization': `Bearer ${token}` },
               body: formData,
            });
            const uploadData = await uploadRes.json();
            if (uploadRes.ok) imageUrl = uploadData.url;
         }

         const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content, image: imageUrl, tags, isAnonymous }),
         });

         if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error);
         }

         router.push('/');
      } catch (err) {
         setError(err.message);
      }
      setLoading(false);
   };

   return (
      <>
         <Navbar />
         <div className="app-layout">
            <Sidebar />
            <main className="main-content" style={{ maxWidth: 640, margin: '0 auto' }}>
               <div className="card" style={{ padding: 32 }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 24 }}>Create Post</h2>
                  {error && <div className="auth-error">{error}</div>}
                  <form onSubmit={handleSubmit}>
                     <div className="form-group">
                        <textarea
                           className="textarea"
                           placeholder="What's on your mind? Share your experience, ask for help, or motivate someone..."
                           value={content}
                           onChange={e => setContent(e.target.value)}
                           style={{ minHeight: 150 }}
                        />
                     </div>

                     {/* Image upload */}
                     <div className="form-group">
                        <label>Image (optional)</label>
                        <div className={`image-upload ${imagePreview ? 'has-image' : ''}`} onClick={() => document.getElementById('img-input').click()}>
                           {imagePreview ? (
                              <img src={imagePreview} alt="Preview" />
                           ) : (
                              <>
                                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                 <p style={{ marginTop: 8, fontSize: '0.85rem' }}>Click to upload an image</p>
                              </>
                           )}
                        </div>
                        <input id="img-input" type="file" accept="image/*" onChange={handleImageChange} hidden />
                        {imagePreview && <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => { setImage(null); setImagePreview(''); }}>Remove image</button>}
                     </div>

                     {/* Tags */}
                     <div className="form-group">
                        <label>Tags (max 5)</label>
                        <div className="tag-input-wrapper">
                           {tags.map(tag => (
                              <span key={tag} className="tag">#{tag}<button type="button" onClick={() => removeTag(tag)}>×</button></span>
                           ))}
                           <input
                              placeholder={tags.length < 5 ? 'Add a tag...' : ''}
                              value={tagInput}
                              onChange={e => setTagInput(e.target.value)}
                              onKeyDown={handleTagKeyDown}
                              disabled={tags.length >= 5}
                           />
                        </div>
                        <div className="suggested-tags">
                           {SUGGESTED_TAGS.filter(t => !tags.includes(t)).slice(0, 8).map(tag => (
                              <span key={tag} className="tag" onClick={() => addTag(tag)}>#{tag}</span>
                           ))}
                        </div>
                     </div>

                     {/* Anonymous toggle */}
                     <div className="form-group">
                        <div className="toggle-wrapper" onClick={() => setIsAnonymous(!isAnonymous)}>
                           <div className={`toggle ${isAnonymous ? 'active' : ''}`} />
                           <div>
                              <span className="toggle-label" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Post Anonymously</span>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>Your identity will be hidden from other users</p>
                           </div>
                        </div>
                     </div>

                     <div style={{ display: 'flex', gap: 12 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
                           {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : isAnonymous ? '🎭 Post Anonymously' : '📤 Publish Post'}
                        </button>
                     </div>
                  </form>
               </div>
            </main>
         </div>
         <MobileNav />
      </>
   );
}
