'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import PostCard from '@/components/PostCard';

export default function ProfilePage() {
   const { id } = useParams();
   const { token, user: authUser } = useAuth();
   const router = useRouter();
   const [profile, setProfile] = useState(null);
   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (!token) return;
      fetch(`/api/users/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
         .then(r => r.json())
         .then(d => { setProfile(d.user); setPosts(d.posts || []); })
         .catch(() => { })
         .finally(() => setLoading(false));
   }, [id, token]);

   const handleFollow = async () => {
      const res = await fetch(`/api/users/${id}/follow`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setProfile(prev => ({
         ...prev,
         isFollowing: data.isFollowing,
         followersCount: data.isFollowing ? prev.followersCount + 1 : prev.followersCount - 1,
      }));
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

   if (loading) return (<><Navbar /><div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div></>);
   if (!profile) return (<><Navbar /><div className="empty-state"><h3>User not found</h3></div></>);

   return (
      <>
         <Navbar />
         <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px', position: 'relative', zIndex: 1 }}>
            <div className="card profile-header">
               <div className="avatar avatar-xl" style={{ margin: '0 auto 16px' }}>
                  {profile.avatar ? <img src={profile.avatar} alt="" /> : getInitials(profile.name)}
               </div>
               <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{profile.name}</h1>
               <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                  {profile.department} {profile.year && `· ${profile.year}`}
               </p>
               {profile.bio && <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: '0.9rem' }}>{profile.bio}</p>}

               {profile.skills?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 12 }}>
                     {profile.skills.map(s => <span key={s} className="tag">{s}</span>)}
                  </div>
               )}

               <div className="profile-stats">
                  <div><div className="profile-stat-value">{profile.postsCount || 0}</div><div className="profile-stat-label">Posts</div></div>
                  <div><div className="profile-stat-value">{profile.followersCount || 0}</div><div className="profile-stat-label">Followers</div></div>
                  <div><div className="profile-stat-value">{profile.followingCount || 0}</div><div className="profile-stat-label">Following</div></div>
               </div>

               {profile.isOwnProfile ? (
                  <button className="btn btn-secondary" onClick={() => router.push('/profile/edit')}>Edit Profile</button>
               ) : (
                  <button className={`btn ${profile.isFollowing ? 'btn-secondary' : 'btn-primary'}`} onClick={handleFollow}>
                     {profile.isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
               )}
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '24px 0 16px' }}>Posts</h3>
            {posts.length === 0 ? (
               <div className="empty-state"><p>No posts yet</p></div>
            ) : (
               posts.map(post => <PostCard key={post.id} post={post} onLike={handleLike} onBookmark={handleBookmark} />)
            )}
         </div>
         <MobileNav />
      </>
   );
}
