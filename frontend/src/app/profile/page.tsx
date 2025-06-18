'use client';

import React, { useEffect, useState } from 'react';
import { UploadCloud, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getUserHistory } from '@/lib/api';
import { onAuthStateChanged, getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { firestore } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { deleteDoc, doc } from 'firebase/firestore';

type LectureEntry = {
  video_url: string;
  timestamp: string;
};

type VideoMetaMap = { [url: string]: string };

export default function ProfilePage() {
  const [history, setHistory] = useState<any[]>([]);
  const [videoTitles, setVideoTitles] = useState<VideoMetaMap>({});
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName,
          photo: firebaseUser.photoURL,
        });
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('edusummarize_token', token);
      } else {
        setUser(null);
        setShowModal(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        try {
          const data = await getUserHistory();
          setHistory(data);
        } catch (err) {
          console.error('Failed to fetch lecture history:', err);
        }
      };
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    const fetchTitles = async () => {
      const urls = history.map(entry => {
        const data = Object.values(entry)[0] as LectureEntry;
        return data.video_url;
      });

      const titlePromises = urls.map(async url => {
        try {
          const res = await fetch(`https://www.youtube.com/oembed?url=${url}&format=json`);
          const json = await res.json();
          return { url, title: json.title };
        } catch {
          return { url, title: 'Unknown Title' };
        }
      });

      const titlesArray = await Promise.all(titlePromises);
      const map: VideoMetaMap = {};
      titlesArray.forEach(({ url, title }) => {
        map[url] = title;
      });
      setVideoTitles(map);
    };

    if (history.length > 0) fetchTitles();
  }, [history]);

  const getThumbnail = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    localStorage.setItem('edusummarize_token', idToken);
    setUser({
      name: result.user.displayName,
      photo: result.user.photoURL,
    });
    setShowModal(false);
  };

  const deleteVideo = async (videoUrl: string) => {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) return alert("Not authenticated");

    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(videoUrl));
    const docId = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');

    await deleteDoc(doc(firestore, 'users', uid, 'history', docId));
    setHistory(prev => prev.filter(entry => Object.keys(entry)[0] !== docId));
  };

  if (showModal && !user) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Profile Access Restricted
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The Profile section is only available to logged-in users.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleLogin}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Login with Google
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-800 transition-colors duration-300">
        {user && (
          <div className="flex items-center gap-3 px-6 py-4">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-white rounded-full font-semibold text-sm uppercase">
              {user.name?.split(' ').join('').slice(0, 2)}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
          </div>
        )}

        <nav className="mt-6">
          <Link href="/upload" className="flex items-center px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
            <UploadCloud className="mr-3" />
            Upload New Video
          </Link>
          <Link href="#" className="flex items-center px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
            <Settings className="mr-3" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Saved Lectures</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse through your saved lecture notes</p>
        </header>

        <div className="space-y-6">
          {history.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No lectures saved yet.</p>
          ) : (
            history.map((entry, idx) => {
              const [docId, rawData] = Object.entries(entry)[0];
              const data = rawData as LectureEntry;
              const displayDate = new Date(data.timestamp).toLocaleString();
              const detailHref = `/profile/details?video_url=${encodeURIComponent(data.video_url)}`;
              const thumbnail = getThumbnail(data.video_url);

              return (
                <div
                  key={docId}
                  className="flex flex-row items-center justify-between p-4 gap-4 rounded-xl shadow-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors duration-300"
                >
                  <div className="flex flex-row gap-4 items-start">
                    {thumbnail && (
                      <img src={thumbnail} alt="Video thumbnail" className="w-40 h-24 object-cover rounded" />
                    )}
                    <div className="flex flex-col">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {videoTitles[data.video_url] || 'Loading...'}
                      </h2>
                      <Link
                        href={data.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 underline break-all"
                      >
                        {data.video_url}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{displayDate}</p>
                    </div>
                  </div>

                  <div className="self-center flex gap-2">
                    <Link
                      href={detailHref}
                      className="px-4 py-2 rounded-md font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors duration-200"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => deleteVideo(data.video_url)}
                      className="px-4 py-2 rounded-md font-medium bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                    >
                      <Trash2 className="inline h-4 w-4 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

const auth = getAuth();
