// components/ui/Controls.tsx
"use client";

import React, { useState } from "react";

const Controls: React.FC = () => {
  const [showControls, setShowControls] = useState(false);

  if (!showControls)
    return (
      <button
        onClick={() => setShowControls(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-sm opacity-50 hover:opacity-100 transition"
      >
        Show Controls
      </button>
    );

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 bg-opacity-90 text-white p-4 rounded-sm shadow-lg z-50">
      <button
        onClick={() => setShowControls(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        ✕
      </button>
      <h3 className="font-bold mb-2">Controls</h3>
      <ul className="space-y-1 text-sm">
        <li>↑↓←→ - Move</li>
        <li>Space - Jump</li>
        <li>Shift - Run</li>
        <li>Mouse Click - Shoot Web</li>
        <li>ESC - Pause</li>
      </ul>
    </div>
  );
};

export default Controls;
