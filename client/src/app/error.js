'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application Runtime Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="bg-red-50 p-8 rounded-2xl border border-red-100 shadow-sm max-w-md">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Something went wrong!
        </h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          The application encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-200 active:scale-95"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2.5 bg-slate-800 hover:bg-black text-white font-semibold rounded-xl transition active:scale-95"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}