'use client';
import { useAuth } from './AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
   const { user, logout } = useAuth();
   const router = useRouter();
   const pathname = usePathname();
   const [searchQuery, setSearchQuery] = useState('');
   const [showMenu, setShowMenu] = useState(false);

   if (!user) return null;

   const handleSearch = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
         router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
   };

   const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

   return (
      <nav className="navbar">
         <div className="navbar-brand" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2">
               <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6c5ce7" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
               <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
            CampusConnect
         </div>

         <form className="navbar-search" onSubmit={handleSearch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
               className="input"
               placeholder="Search posts, people, tags..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
         </form>

         <div className="navbar-actions">
            <button className="btn-icon" onClick={() => router.push('/bookmarks')} title="Bookmarks">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
            </button>
            <div className="dropdown">
               <div className="navbar-user" onClick={() => setShowMenu(!showMenu)}>
                  <div className="avatar avatar-sm">
                     {user.avatar ? <img src={user.avatar} alt="" /> : getInitials(user.name)}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
               </div>
               {showMenu && (
                  <div className="dropdown-menu" onClick={() => setShowMenu(false)}>
                     <button className="dropdown-item" onClick={() => router.push(`/profile/${user.id}`)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        My Profile
                     </button>
                     <button className="dropdown-item" onClick={() => router.push('/profile/edit')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Edit Profile
                     </button>
                     {user.role === 'admin' && (
                        <button className="dropdown-item" onClick={() => router.push('/admin')}>
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                           Admin Panel
                        </button>
                     )}
                     <button className="dropdown-item danger" onClick={() => { logout(); router.push('/login'); }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        Log Out
                     </button>
                  </div>
               )}
            </div>
         </div>
      </nav>
   );
}
