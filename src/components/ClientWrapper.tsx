'use client';

import dynamic from 'next/dynamic';

const GameContainer = dynamic(() => import('./game/GameContainer'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#0a0e17] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full loading-spinner mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  ),
});

export default function ClientWrapper() {
  return <GameContainer />;
}
