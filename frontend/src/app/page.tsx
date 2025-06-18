'use client';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Disable scroll on mount
    document.body.style.overflow = 'hidden';

    return () => {
      // Re-enable scroll on unmount
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <main
      role="main"
      className="relative isolate px-6 pt-14 lg:px-8 bg-white text-gray-900 dark:bg-gray-950 dark:text-white transition-colors duration-300 h-screen overflow-hidden"
    >
      {/* Background blobs */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-30 
                     bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:opacity-20 
                     sm:left-[calc(50%-30rem)] sm:w-[72rem]"
        />
      </div>

      {/* Hero content */}
      <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:py-32 text-center">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
          Turn Your Videos Into Smart Notes
        </h1>
        <p className="mt-8 text-lg font-medium text-gray-500 dark:text-gray-300 sm:text-xl">
          Transform your classroom experience with our AI-powered note-taking app. Never miss important details again.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/upload"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm 
                       hover:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Get started
          </a>
          {/* Uncomment this if you want a Learn More link */}
          {/* <a
            href="#"
            className="text-sm font-semibold text-gray-900 dark:text-white hover:underline"
          >
            Learn more <span aria-hidden="true">→</span>
          </a> */}
        </div>
      </div>

      {/* Bottom blob */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(100%-20rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 
                     bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 dark:opacity-20 
                     sm:left-[calc(50%+36rem)] sm:w-[72rem]"
        />
      </div>
    </main>
  );
}