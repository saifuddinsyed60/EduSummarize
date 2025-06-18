'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from 'firebase/auth';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showExpiredDialog, setShowExpiredDialog] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken(true); // force refresh
          localStorage.setItem('edusummarize_token', token);
          setUser(firebaseUser);
          setShowExpiredDialog(false);
          sessionStorage.removeItem('session_expired_shown');
        } catch (err) {
          console.error('Token refresh failed:', err);
          handleSessionExpiry();
        }
      } else {
        handleSessionExpiry();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSessionExpiry = () => {
    localStorage.removeItem('edusummarize_token');

    if (!sessionStorage.getItem('session_expired_shown')) {
      setShowExpiredDialog(true);
      sessionStorage.setItem('session_expired_shown', 'true');
    }

    setUser(null);
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      localStorage.setItem('edusummarize_token', idToken);
      setUser(result.user);
      setShowExpiredDialog(false);
      sessionStorage.removeItem('session_expired_shown');
      router.push('/profile');
    } catch (err: any) {
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        console.warn('Login popup closed by user');
      } else {
        console.error('Login failed:', err);
        alert('Login failed! See console.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleSessionExpiry();
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Logout failed! See console.');
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur">
        <nav className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            EduSummarize
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/upload" className="text-sm font-medium">
              Upload
            </Link>

            {user ? (
              <>
                <Link
                  href="/profile"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="!flex !items-center !gap-2 !px-6 !py-3 !text-white !font-semibold !bg-gradient-to-r !from-blue-500 !to-indigo-600 !rounded-xl !shadow-lg !hover:from-blue-600 !hover:to-indigo-700 !active:scale-95 !transition !duration-300 !focus:outline-none !focus:ring-4 !focus:ring-blue-300 !focus:ring-opacity-50"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 533.5 544.3"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fill="#4285f4"
                    d="M533.5 278.4c0-18.5-1.6-37-5.2-54.7H272v103.4h146.9c-6.3 33.9-25 62.5-53.3 81.7v67h86.1c50.6-46.6 79.8-115.1 79.8-197.4z"
                  />
                  <path
                    fill="#34a853"
                    d="M272 544.3c72.6 0 133.5-24 178-65.4l-86-67c-24 16-55 25.3-92 25.3-70.9 0-131-47.8-152.4-112.3h-89v70.4c44.7 88.2 136.2 149.9 241.4 149.9z"
                  />
                  <path
                    fill="#fbbc04"
                    d="M119.6 324.9c-10.9-32.4-10.9-67.8 0-100.2v-70.4h-89c-38.7 76.9-38.7 168.3 0 245.2l89-74.6z"
                  />
                  <path
                    fill="#ea4335"
                    d="M272 107.7c38.8-.6 75.9 14.1 104.3 40.7l78.2-78.2C408.7 24 348 0 272 0 166.7 0 75.2 61.7 30.5 149.9l89 74.6c21.5-64.6 81.5-112.3 152.4-116.8z"
                  />
                </svg>
                Login with Google
              </button>
            )}
          </div>
        </nav>
      </header>

      {showExpiredDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Session Expired
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Your login session has expired. Please log in again.
            </p>
            <button
              onClick={() => setShowExpiredDialog(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}