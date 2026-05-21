'use client';
import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
   const { user, loading } = useAuth();
   const router = useRouter();

   useEffect(() => {
      if (!loading && !user) {
         router.push('/login');
      }
   }, [loading, user, router]);

   if (loading) {
      return (
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="spinner" />
         </div>
      );
   }

   if (!user) return null;
   return children;
}
