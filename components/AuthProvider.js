'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
   const [user, setUser] = useState(null);
   const [token, setToken] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const saved = localStorage.getItem('campusconnect_token');
      if (saved) {
         setToken(saved);
         fetchUser(saved);
      } else {
         setLoading(false);
      }
   }, []);

   async function fetchUser(tok) {
      try {
         const res = await fetch('/api/users/me', {
            headers: { 'Authorization': `Bearer ${tok}` },
         });
         if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(tok);
         } else {
            logout();
         }
      } catch {
         logout();
      } finally {
         setLoading(false);
      }
   }

   function login(tok, usr) {
      localStorage.setItem('campusconnect_token', tok);
      setToken(tok);
      setUser(usr);
   }

   function logout() {
      localStorage.removeItem('campusconnect_token');
      setToken(null);
      setUser(null);
   }

   function updateUser(updates) {
      setUser(prev => ({ ...prev, ...updates }));
   }

   return (
      <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, fetchUser: () => fetchUser(token) }}>
         {children}
      </AuthContext.Provider>
   );
}

export function useAuth() {
   const ctx = useContext(AuthContext);
   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
   return ctx;
}
