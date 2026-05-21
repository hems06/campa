'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

export default function MobileNav() {
   const router = useRouter();
   const pathname = usePathname();
   const { user } = useAuth();

   if (!user) return null;

   const items = [
      { label: 'Home', path: '/', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
      { label: 'Search', path: '/search', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg> },
      { label: 'Create', path: '/create', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> },
      { label: 'Saved', path: '/bookmarks', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg> },
      { label: 'Profile', path: `/profile/${user?.id}`, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
   ];

   return (
      <div className="mobile-nav">
         <div className="mobile-nav-inner">
            {items.map(item => (
               <button
                  key={item.path}
                  className={`mobile-nav-item ${pathname === item.path ? 'active' : ''}`}
                  onClick={() => router.push(item.path)}
               >
                  {item.icon}
                  {item.label}
               </button>
            ))}
         </div>
      </div>
   );
}
