"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTimer } from '@/contexts/TimerContext';

export default function LogoutPage() {
  const { setUser, setIsAuthenticated } = useAuth();
  const { clearAll } = useTimer();
  const router = useRouter();
  const logoutPerformed = useRef(false);

  useEffect(() => {
    if (logoutPerformed.current) return;
    logoutPerformed.current = true;

    const performLogout = async () => {
      // Fire and forget logout request
      // Use keepalive to ensure request completes even if page unloads
      fetch('/api/auth/logout', { 
        method: 'POST',
        keepalive: true
      }).catch(err => console.error('Logout failed:', err));

      try {
        clearAll();
        setUser(null);
        setIsAuthenticated(false);
      } catch (e) {
        console.error('Error clearing state:', e);
      }
      
      // Navigate immediately
      router.replace('/login');
    };

    performLogout();
  }, [setUser, setIsAuthenticated, clearAll, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Logging out...</p>
    </div>
  );
}
