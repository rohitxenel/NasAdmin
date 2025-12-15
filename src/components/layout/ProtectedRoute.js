'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAuthChecked(true);
    }, 150); // allow AuthContext to initialize

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!user && authChecked) {
      router.replace('/'); // redirect to login
    }
  }, [user, authChecked, router]);

  // Show loader ONLY while checking unauthenticated state
  if (!user && !authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <motion.div
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        />
      </div>
    );
  }

  // ✅ User is authenticated → render page
  if (user) return children;

  // ❌ Unauthenticated (authChecked = true) → null (handled by redirect)
  return null;
}
