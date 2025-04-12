// components/ui/Menu.tsx
"use client";

import React from "react";

interface MenuProps {
  onResume: () => void;
}

const Menu: React.FC<MenuProps> = ({ onResume }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-white">
        <h2 className="text-2xl mb-6 text-center">Paused</h2>
        <div className="space-y-4">
          <button
            onClick={onResume}
            className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-sm transition"
          >
            Resume Game
          </button>
          <div className="text-sm text-gray-400 mt-4">
            <p>Controls:</p>
            <p>Arrow Keys - Move</p>
            <p>Space - Jump</p>
            <p>Shift - Run</p>
            <p>Mouse Click - Shoot Web</p>
            <p>ESC - Pause</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
